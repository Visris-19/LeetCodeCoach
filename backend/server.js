const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { Question, RevisionSession, UserPerformance, AISuggestion, LearningRequest, LearningSession, LearningProgress, GeneratedContent } = require('./models/schemas');
const AIService = require('./services/aiService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas - LeetCoachCluster'))
  .catch(err => console.error('MongoDB connection error:', err));

// Helper functions for DSA Mentor
async function updateLearningProgress(topic, difficulty) {
  try {
    let progress = await LearningProgress.findOne({ userId: 'default' });
    
    if (!progress) {
      progress = new LearningProgress({ userId: 'default' });
    }
    
    // Update overall stats
    progress.totalSessions += 1;
    progress.lastSessionDate = new Date();
    
    // Update topic progress
    if (!progress.topicProgress) {
      progress.topicProgress = {};
    }
    
    const topicKey = topic.toLowerCase();
    const currentProgress = progress.topicProgress[topicKey] || {
      sessionsCount: 0,
      masteryLevel: 0,
      lastStudiedDate: new Date(),
      averageScore: 0
    };
    
    currentProgress.sessionsCount += 1;
    currentProgress.lastStudiedDate = new Date();
    // Increase mastery level based on difficulty
    const difficultyBonus = difficulty === 'advanced' ? 15 : difficulty === 'intermediate' ? 10 : 5;
    currentProgress.masteryLevel = Math.min(100, currentProgress.masteryLevel + difficultyBonus);
    
    progress.topicProgress[topicKey] = currentProgress;
    
    await progress.save();
    return progress;
  } catch (error) {
    console.error('Error updating learning progress:', error);
    throw error;
  }
}

async function updateTopicProgress(topic, quizScore) {
  try {
    let progress = await LearningProgress.findOne({ userId: 'default' });
    
    if (!progress) {
      progress = new LearningProgress({ userId: 'default' });
    }
    
    if (!progress.topicProgress) {
      progress.topicProgress = {};
    }
    
    const topicKey = topic.toLowerCase();
    const currentProgress = progress.topicProgress[topicKey] || {
      sessionsCount: 0,
      masteryLevel: 0,
      lastStudiedDate: new Date(),
      averageScore: 0
    };
    
    // Update average score
    const totalScore = (currentProgress.averageScore * (currentProgress.sessionsCount - 1)) + quizScore;
    currentProgress.averageScore = Math.round(totalScore / currentProgress.sessionsCount);
    
    // Update mastery level based on quiz performance
    if (quizScore >= 90) {
      currentProgress.masteryLevel = Math.min(100, currentProgress.masteryLevel + 10);
    } else if (quizScore >= 70) {
      currentProgress.masteryLevel = Math.min(100, currentProgress.masteryLevel + 5);
    } else if (quizScore < 50) {
      currentProgress.masteryLevel = Math.max(0, currentProgress.masteryLevel - 5);
    }
    
    progress.topicProgress[topicKey] = currentProgress;
    
    // Update topics mastered count
    progress.topicsMastered = Object.values(progress.topicProgress)
      .filter(p => p.masteryLevel >= 80).length;
    
    // Update average score across all topics
    const allScores = Object.values(progress.topicProgress)
      .map(p => p.averageScore)
      .filter(score => score > 0);
    
    if (allScores.length > 0) {
      progress.averageScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    }
    
    await progress.save();
    return progress;
  } catch (error) {
    console.error('Error updating topic progress:', error);
    throw error;
  }
}

// Routes


// Add this test endpoint temporarily
app.post('/api/test-gemini', async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });
    
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    
    res.json({
      success: true,
      message: "API key works!",
      response: response.text()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// Add completed question(s) - supports both single and bulk addition
app.post('/api/questions/add', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Check if input contains commas (bulk addition)
    const queries = query.includes(',') 
      ? query.split(',').map(q => q.trim()).filter(q => q.length > 0)
      : [query.trim()];

    if (queries.length === 0) {
      return res.status(400).json({ error: 'No valid questions provided' });
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    };    // Process each question sequentially to avoid rate limits
    console.log(`Processing ${queries.length} questions...`);
    for (let i = 0; i < queries.length; i++) {
      const singleQuery = queries[i];
      console.log(`Processing question ${i + 1}/${queries.length}: "${singleQuery}"`);
      
      try {
        // Check if question already exists first (quick check)
        const possibleIds = [singleQuery, singleQuery.replace(/^LC/i, ''), singleQuery.replace(/^#/, '')];
        const existingQuestion = await Question.findOne({ 
          leetcodeId: { $in: possibleIds }
        });
        
        if (existingQuestion) {
          console.log(`Question "${singleQuery}" already exists, skipping`);
          results.skipped.push({
            query: singleQuery,
            reason: 'Already exists',
            question: existingQuestion
          });
          continue;
        }

        // Use AI to fetch question details with timeout
        console.log(`Fetching AI details for "${singleQuery}"...`);
        const questionData = await Promise.race([
          AIService.fetchQuestionDetails(singleQuery),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI request timeout')), 30000) // 30 second timeout
          )
        ]);
        
        if (!questionData.found) {
          console.log(`AI couldn't find question "${singleQuery}": ${questionData.error}`);
          results.failed.push({
            query: singleQuery,
            error: questionData.error || 'Question not found'
          });
          continue;
        }

        // Double-check existence with AI-provided ID
        const existingById = await Question.findOne({ leetcodeId: questionData.leetcodeId });
        if (existingById) {
          console.log(`Question ${questionData.leetcodeId} already exists, skipping`);
          results.skipped.push({
            query: singleQuery,
            reason: 'Already exists',
            question: existingById
          });
          continue;
        }

        // Create new question
        const question = new Question({
          leetcodeId: questionData.leetcodeId,
          title: questionData.title,
          difficulty: questionData.difficulty,
          topics: questionData.topics,
          leetcodeUrl: questionData.leetcodeUrl,
          description: questionData.description
        });        await question.save();
        console.log(` ✅ Successfully added question: ${questionData.title}`);
        
        results.success.push({
          query: singleQuery,
          question: question
        });

      } catch (error) {
        console.error(`Error processing question "${singleQuery}":`, error.message);
        results.failed.push({
          query: singleQuery,
          error: error.message.includes('timeout') ? 'AI request timeout - please try again' : 'Processing failed'
        });
      }
    }

    // Update user performance if any questions were added
    if (results.success.length > 0) {
      await updateUserPerformance();
    }

    // Return comprehensive results
    const totalProcessed = results.success.length + results.failed.length + results.skipped.length;
    res.status(201).json({
      success: true,
      summary: {
        total: totalProcessed,
        added: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results,
      message: queries.length === 1 
        ? (results.success.length > 0 ? 'Question added successfully' : 'Failed to add question')
        : `Processed ${totalProcessed} questions: ${results.success.length} added, ${results.failed.length} failed, ${results.skipped.length} skipped`
    });
  } catch (error) {
    console.error('Error adding question(s):', error);
    res.status(500).json({ error: 'Failed to process questions' });
  }
});

// Get all questions
app.get('/api/questions', async (req, res) => {
  try {
    // const questions = await Question.find().sort({ leetcodeId: 1 });
    const questions = await Question.aggregate([
  {
    $addFields: {
      question_index: {
        $convert: {
          input: "$leetcodeId",
          to: "int",
          onError: 0,
          onNull: 0
        }
      }
    }
  },
  { $sort: { question_index: 1 } }
]);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Start a revision session
app.post('/api/revision/start', async (req, res) => {
  try {
    const { duration = 60, focusTopics = [], numberOfQuestions = 3 } = req.body;
    
    // Get user performance
    const userPerformance = await getUserPerformance();
    
    // Get AI suggestions for revision
    const revisionPlan = await AIService.generateRevisionPlan(userPerformance, duration);
    
    // Get available questions
    const availableQuestions = await Question.find();
    
    // Get smart suggestions
    const aiSuggestions = await AIService.getSmartSuggestions(userPerformance, availableQuestions);
    
    // Create revision session
    const sessionId = `session_${Date.now()}`;
    const selectedQuestions = [];
    
    // Use the user-specified number of questions
    const targetQuestionCount = Math.min(numberOfQuestions, availableQuestions.length);
    console.log(`Creating session with ${targetQuestionCount} questions (requested: ${numberOfQuestions})`);
      // Select questions based on AI suggestions
    for (const suggestion of aiSuggestions.slice(0, targetQuestionCount)) {
      const question = availableQuestions.find(q => q.leetcodeId === suggestion.leetcodeId);
      if (question) {
        selectedQuestions.push({
          questionId: question._id,
          allocatedTime: suggestion.estimatedTime || 
                        (question.difficulty === 'Easy' ? 15 : 
                         question.difficulty === 'Medium' ? 25 : 35),
          startedAt: null,
          completedAt: null
        });
      }
    }    // Fallback: if not enough AI suggestions, select additional random questions
    if (selectedQuestions.length < targetQuestionCount && availableQuestions.length > 0) {
      console.log(`Need ${targetQuestionCount - selectedQuestions.length} more questions, selecting randomly`);
      
      // Get questions not already selected
      const selectedIds = selectedQuestions.map(sq => sq.questionId.toString());
      const remainingQuestions = availableQuestions.filter(q => !selectedIds.includes(q._id.toString()));
      
      const shuffled = remainingQuestions.sort(() => 0.5 - Math.random());
      const numNeeded = Math.min(targetQuestionCount - selectedQuestions.length, shuffled.length);
      
      for (let i = 0; i < numNeeded; i++) {
        selectedQuestions.push({
          questionId: shuffled[i]._id,
          allocatedTime: shuffled[i].difficulty === 'Easy' ? 15 : 
                        shuffled[i].difficulty === 'Medium' ? 25 : 35,
          startedAt: null,
          completedAt: null
        });
      }
    }

    // Don't create session if no questions available
    if (selectedQuestions.length === 0) {
      return res.status(400).json({ 
        error: 'No questions available for revision. Please add some questions first.' 
      });
    }

    const session = new RevisionSession({
      sessionId,
      questions: selectedQuestions,
      totalAllocatedTime: duration,
      sessionStatus: 'active'
    });

    await session.save();

    // Populate question details
    await session.populate('questions.questionId');

    res.json({
      success: true,
      session,
      revisionPlan,
      aiSuggestions
    });
  } catch (error) {
    console.error('Error starting revision session:', error);
    res.status(500).json({ error: 'Failed to start revision session' });
  }
});

// Start a specific question in session
app.post('/api/revision/:sessionId/question/:questionIndex/start', async (req, res) => {
  try {
    const { sessionId, questionIndex } = req.params;
    
    const session = await RevisionSession.findOne({ sessionId }).populate('questions.questionId');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const questionIdx = parseInt(questionIndex);
    if (questionIdx >= session.questions.length) {
      return res.status(400).json({ error: 'Invalid question index' });
    }

    // Mark question as started
    session.questions[questionIdx].startedAt = new Date();
    await session.save();

    res.json({
      success: true,
      question: session.questions[questionIdx],
      message: 'Question started. Timer is running!'
    });
  } catch (error) {
    console.error('Error starting question:', error);
    res.status(500).json({ error: 'Failed to start question' });
  }
});

// Complete a question in session
app.post('/api/revision/:sessionId/question/:questionIndex/complete', async (req, res) => {
  try {
    const { sessionId, questionIndex } = req.params;
    
    const session = await RevisionSession.findOne({ sessionId }).populate('questions.questionId');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const questionIdx = parseInt(questionIndex);
    const question = session.questions[questionIdx];
    
    if (!question.startedAt) {
      return res.status(400).json({ error: 'Question was not started' });
    }

    // Calculate actual time taken
    const completedAt = new Date();
    const actualTime = Math.round((completedAt - question.startedAt) / (1000 * 60)); // in minutes

    // Update question in session
    question.completed = true;
    question.completedAt = completedAt;
    question.actualTime = actualTime;

    // Update session stats
    session.questionsCompleted += 1;
    session.totalActualTime = (session.totalActualTime || 0) + actualTime;

    await session.save();

    // Update question's revision stats
    const questionDoc = await Question.findById(question.questionId._id);
    questionDoc.lastRevisedAt = completedAt;
    questionDoc.revisionCount += 1;
    questionDoc.averageRevisionTime = 
      ((questionDoc.averageRevisionTime * (questionDoc.revisionCount - 1)) + actualTime) / questionDoc.revisionCount;
    await questionDoc.save();

    res.json({
      success: true,
      actualTime,
      session,
      message: `Question completed in ${actualTime} minutes!`
    });
  } catch (error) {
    console.error('Error completing question:', error);
    res.status(500).json({ error: 'Failed to complete question' });
  }
});

// Finish revision session
app.post('/api/revision/:sessionId/finish', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await RevisionSession.findOne({ sessionId }).populate('questions.questionId');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update session status
    session.sessionStatus = 'completed';
    session.completedAt = new Date();

    // Calculate performance metrics
    const completionRate = (session.questionsCompleted / session.questions.length) * 100;
    const averageTimePerQuestion = session.totalActualTime / session.questionsCompleted || 0;
    
    const topicsAttempted = [...new Set(
      session.questions.map(q => q.questionId.topics).flat()
    )];

    session.performance = {
      completionRate,
      averageTimePerQuestion,
      topicsAttempted
    };

    await session.save();

    // Get user performance for AI analysis
    const userPerformance = await getUserPerformance();
    
    // Use AI to analyze this session
    const analysis = await AIService.analyzePerformance(session, userPerformance);

    // Update user performance based on AI analysis
    await updateUserPerformanceFromSession(session, analysis);

    res.json({
      success: true,
      session,
      analysis,
      message: 'Revision session completed! Performance updated.'
    });
  } catch (error) {
    console.error('Error finishing session:', error);
    res.status(500).json({ error: 'Failed to finish session' });
  }
});

// Get current active session
app.get('/api/revision/active', async (req, res) => {
  try {
    const activeSession = await RevisionSession.findOne({ 
      sessionStatus: 'active' 
    }).populate('questions.questionId');

    // Only return sessions that actually have questions and aren't completed
    if (activeSession && activeSession.questions.length === 0) {
      // Session exists but has no questions - this is a malformed session
      console.log('Found session with no questions, marking as completed');
      activeSession.sessionStatus = 'completed';
      await activeSession.save();
      
      return res.json({
        success: true,
        session: null // Return null so frontend knows there's no active session
      });
    }

    res.json({
      success: true,
      session: activeSession
    });
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
});

// Clear/end current active session (for getting unstuck)
app.post('/api/revision/clear', async (req, res) => {
  try {
    const activeSession = await RevisionSession.findOne({ 
      sessionStatus: 'active' 
    });

    if (activeSession) {
      activeSession.sessionStatus = 'completed';
      activeSession.completedAt = new Date();
      await activeSession.save();
      
      console.log('Cleared stuck session:', activeSession.sessionId);
    }

    res.json({
      success: true,
      message: 'Active session cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing session:', error);
    res.status(500).json({ error: 'Failed to clear session' });
  }
});

// Get user performance dashboard
app.get('/api/performance', async (req, res) => {
  try {
    const performance = await getUserPerformance();
    
    // Get recent sessions
    const recentSessions = await RevisionSession.find()
      .sort({ startedAt: -1 })
      .limit(10)
      .populate('questions.questionId');

    res.json({
      success: true,
      performance,
      recentSessions
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance' });
  }
});

// ================================
// DSA MENTOR ENDPOINTS
// ================================

// Submit learning request
app.post('/api/mentor/request', async (req, res) => {
  try {
    const { topic, difficulty, learningType, description } = req.body;
    
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Topic is required' 
      });
    }

    // Create a comprehensive request text from the structured input
    const requestText = `I want to learn about ${topic}. Difficulty level: ${difficulty}. Learning type: ${learningType}. ${description ? `Additional details: ${description}` : ''}`;

    // Process the learning request with AI
    console.log('Processing learning request:', requestText);
    let aiAnalysis = await AIService.processLearningRequest(requestText);
    
    // If AI analysis fails, create a fallback analysis
    if (!aiAnalysis.isValid) {
      console.log('AI analysis failed, using fallback analysis');
      aiAnalysis = {
        topic: topic,
        language: 'Java',
        difficulty: difficulty,
        learningStyle: learningType,
        keywords: topic.toLowerCase().split(' '),
        isValid: true
      };
    }

    // Save the learning request
    const learningRequest = new LearningRequest({
      requestText: requestText.trim(),
      extractedTopic: aiAnalysis.topic,
      extractedLanguage: aiAnalysis.language,
      difficulty: aiAnalysis.difficulty,
      status: 'processed'
    });
    await learningRequest.save();

    // Generate learning content
    console.log('Generating learning content for:', aiAnalysis.topic);
    let learningContent;
    try {
      learningContent = await AIService.generateLearningContent(
        aiAnalysis.topic, 
        aiAnalysis.difficulty, 
        aiAnalysis.language
      );
    } catch (error) {
      console.log('AI content generation failed, using fallback content');
      learningContent = AIService.getFallbackLearningContent(
        aiAnalysis.topic, 
        aiAnalysis.difficulty
      );
    }

    // Create learning session
    const learningSession = new LearningSession({
      requestId: learningRequest._id,
      topic: aiAnalysis.topic,
      sessionType: 'concept',
      content: {
        explanation: learningContent.explanation,
        codeExamples: learningContent.codeExamples,
        keyPoints: learningContent.keyPoints,
        practiceProblems: learningContent.practiceProblems
      }
    });
    await learningSession.save();

    // Update user progress
    await updateLearningProgress(aiAnalysis.topic, aiAnalysis.difficulty);

    res.json({
      success: true,
      requestId: learningRequest._id,
      sessionId: learningSession._id,
      topic: aiAnalysis.topic,
      difficulty: aiAnalysis.difficulty,
      content: learningContent,
      message: `Great! Let's learn about ${aiAnalysis.topic}. I've prepared a comprehensive lesson for you.`
    });

  } catch (error) {
    console.error('Error processing learning request:', error);
    res.status(500).json({ 
      error: 'Failed to process learning request. Please try again.' 
    });
  }
});

// Get learning progress
app.get('/api/mentor/progress', async (req, res) => {
  try {
    let progress = await LearningProgress.findOne({ userId: 'default' });
    
    if (!progress) {
      progress = new LearningProgress({ userId: 'default' });
      await progress.save();
    }

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    res.status(500).json({ error: 'Failed to fetch learning progress' });
  }
});

// Submit code for review
app.post('/api/mentor/submit-code', async (req, res) => {
  try {
    const { sessionId, problemIndex, userCode, timeSpent } = req.body;

    if (!sessionId || problemIndex === undefined || !userCode) {
      return res.status(400).json({ 
        error: 'Session ID, problem index, and code are required' 
      });
    }

    // Get the learning session
    const session = await LearningSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Learning session not found' });
    }

    const problem = session.content.practiceProblems[problemIndex];
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Get AI code review
    console.log('Reviewing code for:', problem.title);
    const codeReview = await AIService.reviewCode(userCode, problem);

    // Record user interaction
    session.userInteractions.push({
      type: 'code_submission',
      content: userCode,
      aiResponse: JSON.stringify(codeReview)
    });

    if (timeSpent) {
      session.sessionDuration = (session.sessionDuration || 0) + timeSpent;
    }

    await session.save();

    // Update topic progress
    await updateTopicProgress(session.topic, codeReview.isCorrect, codeReview.score);

    res.json({
      success: true,
      review: codeReview,
      message: codeReview.encouragement
    });

  } catch (error) {
    console.error('Error reviewing code:', error);
    res.status(500).json({ error: 'Failed to review code' });
  }
});

// Generate quiz for topic
app.post('/api/mentor/generate-quiz', async (req, res) => {
  try {
    const { topic, difficulty, questionCount = 10 } = req.body;

    if (!topic || !difficulty) {
      return res.status(400).json({ 
        error: 'Topic and difficulty are required' 
      });
    }

    console.log('Generating quiz for:', topic, difficulty, 'with', questionCount, 'questions');
    const quiz = await AIService.generateQuiz(topic, difficulty, parseInt(questionCount));

    // Add metadata to quiz
    const quizData = {
      ...quiz,
      topic,
      difficulty,
      questionCount: quiz.questions?.length || questionCount,
      timeLimit: questionCount * 90, // 1.5 minutes per question
      createdAt: new Date()
    };

    res.json({
      success: true,
      ...quizData
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
  }
});

// Get quiz for topic
app.get('/api/mentor/quiz/:topic/:difficulty', async (req, res) => {
  try {
    const { topic, difficulty } = req.params;
    const questionCount = req.query.count || 5;

    console.log('Generating quiz for:', topic, difficulty);
    const quiz = await AIService.generateQuiz(topic, difficulty, parseInt(questionCount));

    res.json({
      success: true,
      quiz,
      topic,
      difficulty
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Submit quiz answers
app.post('/api/mentor/submit-quiz', async (req, res) => {
  try {
    const { topic, difficulty, answers, timeSpent, questions } = req.body;

    if (!topic || !answers || !questions) {
      return res.status(400).json({ 
        error: 'Topic, answers, and questions are required' 
      });
    }

    // Calculate score based on correct answers
    let correctCount = 0;
    const totalQuestions = questions.length;
    
    // Check each answer against the correct answer
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Calculate performance by topics if available
    const performance = {};
    questions.forEach((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      const questionTopics = question.topics || [topic];
      
      questionTopics.forEach(topicName => {
        if (!performance[topicName]) {
          performance[topicName] = { correct: 0, total: 0 };
        }
        performance[topicName].total++;
        if (isCorrect) performance[topicName].correct++;
      });
    });

    // Add percentage to performance
    Object.keys(performance).forEach(topicName => {
      performance[topicName].percentage = Math.round(
        (performance[topicName].correct / performance[topicName].total) * 100
      );
    });

    // Generate feedback based on performance
    const feedback = {
      strengths: [],
      improvements: [],
      recommendations: []
    };

    if (percentage >= 80) {
      feedback.strengths.push(`Excellent understanding of ${topic} concepts`);
      feedback.recommendations.push('Try more advanced topics or increase difficulty level');
    } else if (percentage >= 60) {
      feedback.strengths.push(`Good grasp of basic ${topic} concepts`);
      feedback.improvements.push('Review specific areas where you made mistakes');
      feedback.recommendations.push('Practice more problems in this topic');
    } else {
      feedback.improvements.push(`Need to strengthen ${topic} fundamentals`);
      feedback.recommendations.push('Review learning materials and try easier questions first');
    }

    // Save quiz result to learning session if needed
    try {
      const learningSession = new LearningSession({
        topic: topic,
        sessionType: 'quiz',
        content: {
          questions: questions,
          userAnswers: answers,
          score: score,
          percentage: percentage
        },
        userInteractions: [{
          type: 'quiz_completion',
          content: `Completed quiz: ${score}/${totalQuestions} correct`,
          aiResponse: `Score: ${percentage}%`
        }],
        sessionDuration: timeSpent || 0
      });
      await learningSession.save();
    } catch (saveError) {
      console.error('Error saving learning session:', saveError);
      // Continue anyway - don't fail the response
    }

    // Update topic progress
    try {
      await updateTopicProgress(topic, percentage >= 70, percentage);
    } catch (progressError) {
      console.error('Error updating topic progress:', progressError);
      // Continue anyway
    }

    res.json({
      success: true,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      percentage,
      timeSpent: timeSpent || 0,
      performance,
      feedback,
      message: percentage >= 80 ? 'Excellent work! You have mastered this topic.' :
               percentage >= 60 ? 'Good job! Keep practicing to improve further.' :
               'Keep learning! Review the concepts and try again.'
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get learning suggestions
app.get('/api/mentor/suggestions', async (req, res) => {
  try {
    const currentTopic = req.query.topic || '';
    
    let progress = await LearningProgress.findOne({ userId: 'default' });
    if (!progress) {
      progress = new LearningProgress({ userId: 'default' });
      await progress.save();
    }

    let suggestions;
    try {
      suggestions = await AIService.suggestLearningPath(progress, currentTopic);
    } catch (aiError) {
      // Fallback suggestions when AI is unavailable
      suggestions = {
        recommendations: [
          {
            topic: "Arrays and Strings",
            reason: "Fundamental data structures",
            difficulty: "beginner",
            estimatedTime: "2-3 hours",
            prerequisites: [],
            priority: "high"
          },
          {
            topic: "Linked Lists",
            reason: "Learn pointer manipulation",
            difficulty: "beginner",
            estimatedTime: "1-2 hours",
            prerequisites: ["Arrays"],
            priority: "high"
          },
          {
            topic: "Binary Search",
            reason: "Efficient searching algorithm",
            difficulty: "intermediate",
            estimatedTime: "1-2 hours",
            prerequisites: ["Arrays"],
            priority: "medium"
          },
          {
            topic: "Stack and Queue",
            reason: "LIFO and FIFO operations",
            difficulty: "intermediate",
            estimatedTime: "2-3 hours",
            prerequisites: ["Arrays"],
            priority: "medium"
          },
          {
            topic: "Binary Trees",
            reason: "Tree data structure fundamentals",
            difficulty: "intermediate",
            estimatedTime: "3-4 hours",
            prerequisites: ["Linked Lists"],
            priority: "medium"
          },
          {
            topic: "Dynamic Programming",
            reason: "Optimization technique",
            difficulty: "advanced",
            estimatedTime: "4-5 hours",
            prerequisites: ["Arrays", "Recursion"],
            priority: "low"
          }
        ],
        learningPath: ["Arrays", "Linked Lists", "Binary Search", "Trees", "Dynamic Programming"],
        motivation: "Start with the fundamentals and build up to advanced topics!"
      };
    }

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get learning history
app.get('/api/mentor/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentSessions = await LearningSession.find({ userId: 'default' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('requestId');

    res.json({
      success: true,
      sessions: recentSessions
    });
  } catch (error) {
    console.error('Error fetching learning history:', error);
    res.status(500).json({ error: 'Failed to fetch learning history' });
  }
});

// Helper function to get or create user performance
async function getUserPerformance() {
  let performance = await UserPerformance.findOne();
  
  if (!performance) {
    performance = new UserPerformance({
      totalQuestionsAdded: 0,
      totalRevisionSessions: 0,
      totalRevisionTime: 0,
      topicPerformance: [],
      difficultyPerformance: [
        { difficulty: 'Easy', questionsAttempted: 0, questionsCompleted: 0, averageTime: 0, completionRate: 0 },
        { difficulty: 'Medium', questionsAttempted: 0, questionsCompleted: 0, averageTime: 0, completionRate: 0 },
        { difficulty: 'Hard', questionsAttempted: 0, questionsCompleted: 0, averageTime: 0, completionRate: 0 }
      ],
      learningPatterns: {
        preferredTopics: [],
        strugglingTopics: [],
        optimalSessionDuration: 60,
        revisionFrequency: 7
      }
    });
    await performance.save();
  }
  
  return performance;
}

// Update user performance after adding question
async function updateUserPerformance() {
  const performance = await getUserPerformance();
  const totalQuestions = await Question.countDocuments();
  
  performance.totalQuestionsAdded = totalQuestions;
  performance.lastUpdated = new Date();
  
  await performance.save();
}

// Update user performance from session
async function updateUserPerformanceFromSession(session, analysis) {
  const performance = await getUserPerformance();
  
  // Update basic stats
  performance.totalRevisionSessions += 1;
  performance.totalRevisionTime += session.totalActualTime || 0;
  performance.averageSessionCompletion = 
    ((performance.averageSessionCompletion * (performance.totalRevisionSessions - 1)) + 
     session.performance.completionRate) / performance.totalRevisionSessions;

  // Update topic performance based on AI analysis
  for (const update of analysis.topicUpdates) {
    let topicPerf = performance.topicPerformance.find(tp => tp.topic === update.topic);
    if (!topicPerf) {
      topicPerf = {
        topic: update.topic,
        questionsAttempted: 0,
        questionsCompleted: 0,
        averageTime: 0,
        weaknessScore: 50
      };
      performance.topicPerformance.push(topicPerf);
    }
    
    topicPerf.weaknessScore = update.newWeaknessScore;
    topicPerf.lastAttempted = new Date();
  }

  // Update learning patterns from AI analysis
  performance.learningPatterns.improvingAreas = analysis.learningPatterns.improvingAreas;
  performance.learningPatterns.strugglingTopics = analysis.learningPatterns.strugglingAreas;
  
  if (analysis.nextSessionSuggestions.duration) {
    performance.learningPatterns.optimalSessionDuration = analysis.nextSessionSuggestions.duration;
  }

  performance.lastUpdated = new Date();
  await performance.save();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LeetCode Coach Backend running on port ${PORT}`);
  console.log(`📊 MongoDB: LeetCoachCluster database connected`);
  console.log(`🤖 Gemini AI integration active`);
});
