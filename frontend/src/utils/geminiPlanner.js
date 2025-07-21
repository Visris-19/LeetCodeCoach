import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper function to make API calls with error handling
const makeGeminiCall = async (prompt) => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key not configured');
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw new Error(`AI service unavailable: ${error.message}`);
  }
};

// Get LeetCode question information by number or title
export const getLeetCodeQuestionInfo = async (query) => {
  const prompt = `
    You are a LeetCode expert. Given a query "${query}", provide information about the LeetCode problem.
    
    If the query is a number (like "4" or "LC4"), find the corresponding LeetCode problem.
    If the query is a title or partial title, find the matching problem.
    
    Return ONLY a JSON object with this exact structure (no markdown, no explanations):
    {
      "id": "LC4",
      "title": "Median of Two Sorted Arrays",
      "difficulty": "Hard",
      "topics": ["Binary Search", "Divide and Conquer", "Array"],
      "description": "Brief description of the problem",
      "found": true
    }
    
    If no problem is found, return:
    {
      "found": false,
      "message": "Problem not found"
    }
  `;
  
  try {
    const response = await makeGeminiCall(prompt);
    // Clean the response to extract JSON
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error getting question info:', error);
    return {
      found: false,
      message: 'Failed to fetch question information'
    };
  }
};

// Generate foundational questions for a failed problem
export const suggestFoundationalQuestions = async (questionData) => {
  const prompt = `
    A user failed to solve the LeetCode problem: "${questionData.title}" (${questionData.difficulty}).
    Topics: ${questionData.topics?.join(', ') || 'Not specified'}
    
    Suggest 3 easier foundational problems that would help them build up to solving this problem.
    Focus on the core concepts and patterns needed.
    
    Return ONLY a JSON array with this exact structure:
    [
      {
        "id": "LC1",
        "title": "Two Sum",
        "difficulty": "Easy",
        "reason": "Builds foundation for array manipulation and hash table usage"
      },
      {
        "id": "LC26",
        "title": "Remove Duplicates from Sorted Array", 
        "difficulty": "Easy",
        "reason": "Teaches two-pointer technique essential for array problems"
      },
      {
        "id": "LC88",
        "title": "Merge Sorted Array",
        "difficulty": "Easy", 
        "reason": "Introduces merge logic needed for divide and conquer"
      }
    ]
  `;
  
  try {
    const response = await makeGeminiCall(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error getting foundational questions:', error);
    return [];
  }
};

// Generate a smart revision plan
export const generateRevisionPlan = async (userStats, timeframe = '3-day') => {
  const { overall, topicStats, dailyStats } = userStats;
  
  const topicWeaknesses = Object.entries(topicStats)
    .filter(([topic, stats]) => stats.failed > 0)
    .sort((a, b) => (b[1].failed / b[1].total) - (a[1].failed / a[1].total))
    .slice(0, 5);
  
  const prompt = `
    Create a ${timeframe} revision plan for a LeetCode student based on their performance:
    
    Overall Stats:
    - Total Attempted: ${overall.totalAttempted}
    - Completed: ${overall.totalCompleted}
    - Failed: ${overall.totalFailed}
    - Success Rate: ${overall.completionRate}%
    
    Weakest Topics (by failure rate):
    ${topicWeaknesses.map(([topic, stats]) => 
      `- ${topic}: ${stats.failed}/${stats.total} failed (${(stats.failed/stats.total*100).toFixed(1)}%)`
    ).join('\n')}
    
    Create a structured revision plan that focuses on:
    1. Strengthening weak topics
    2. Progressive difficulty increase
    3. Specific problem recommendations
    4. Daily goals and time estimates
    
    Return ONLY a JSON object with this structure:
    {
      "summary": "Brief overview of the plan focus",
      "dailyPlans": [
        {
          "day": 1,
          "focus": "Topic/Concept",
          "problems": [
            {
              "id": "LC1",
              "title": "Two Sum",
              "difficulty": "Easy",
              "estimatedTime": 20,
              "priority": "high"
            }
          ],
          "totalEstimatedTime": 60,
          "notes": "Additional tips or focus areas"
        }
      ],
      "weeklyGoals": ["Goal 1", "Goal 2", "Goal 3"]
    }
  `;
  
  try {
    const response = await makeGeminiCall(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error generating revision plan:', error);
    return {
      summary: 'Unable to generate revision plan at this time.',
      dailyPlans: [],
      weeklyGoals: ['Continue practicing daily', 'Focus on weak areas', 'Track your progress']
    };
  }
};

// Analyze performance and provide feedback
export const analyzePerformance = async (userStats, recentAttempts) => {
  const { overall, topicStats } = userStats;
  
  const recentPerformance = Object.entries(recentAttempts)
    .slice(-7) // Last 7 days
    .map(([date, attempts]) => ({
      date,
      total: attempts.length,
      success: attempts.filter(a => a.status === 'completed').length
    }));
  
  const prompt = `
    Analyze this LeetCode student's performance and provide personalized feedback:
    
    Overall Performance:
    - Success Rate: ${overall.completionRate}%
    - Total Problems: ${overall.totalAttempted}
    - Completed: ${overall.totalCompleted}
    - Failed: ${overall.totalFailed}
    
    Recent 7-day Performance:
    ${recentPerformance.map(day => 
      `${day.date}: ${day.success}/${day.total} solved`
    ).join('\n')}
    
    Topic Performance:
    ${Object.entries(topicStats).slice(0, 5).map(([topic, stats]) => 
      `${topic}: ${stats.completed}/${stats.total} (${(stats.completed/stats.total*100).toFixed(1)}%)`
    ).join('\n')}
    
    Provide constructive feedback focusing on:
    1. Strengths and improvements
    2. Areas that need attention
    3. Specific actionable advice
    4. Motivation and encouragement
    
    Return ONLY a JSON object:
    {
      "overallFeedback": "General performance assessment",
      "strengths": ["Strength 1", "Strength 2"],
      "improvementAreas": ["Area 1", "Area 2"],
      "actionableAdvice": ["Advice 1", "Advice 2", "Advice 3"],
      "motivationalMessage": "Encouraging message"
    }
  `;
  
  try {
    const response = await makeGeminiCall(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error analyzing performance:', error);
    return {
      overallFeedback: 'Keep up the great work! Consistency is key to improvement.',
      strengths: ['Dedication to practice', 'Tracking progress'],
      improvementAreas: ['Focus on understanding patterns', 'Practice weak topics'],
      actionableAdvice: ['Review failed problems', 'Practice similar problems', 'Take breaks when stuck'],
      motivationalMessage: 'Every expert was once a beginner. Keep practicing!'
    };
  }
};

// Search for similar problems
export const findSimilarProblems = async (questionData) => {
  const prompt = `
    Find 3-5 LeetCode problems similar to "${questionData.title}" (${questionData.difficulty}).
    Topics: ${questionData.topics?.join(', ') || 'Not specified'}
    
    Focus on problems that use similar:
    - Data structures
    - Algorithms
    - Problem-solving patterns
    - Difficulty level (±1 level)
    
    Return ONLY a JSON array:
    [
      {
        "id": "LC15",
        "title": "3Sum",
        "difficulty": "Medium",
        "similarity": "Uses similar two-pointer technique",
        "topics": ["Array", "Two Pointers"]
      }
    ]
  `;
  
  try {
    const response = await makeGeminiCall(prompt);
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Error finding similar problems:', error);
    return [];
  }
};
