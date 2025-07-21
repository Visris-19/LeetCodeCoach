import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { mentorApi } from '../utils/api';

const Quiz = () => {
  const { topic, difficulty } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const response = await mentorApi.generateQuiz(topic || 'General', difficulty || 'Beginner');
        setQuiz(response);
        setTimeRemaining(response.timeLimit || 600); // Use quiz-specific time limit
        setError(null);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [topic, difficulty]);

  // Timer effect
  useEffect(() => {
    if (!quiz || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const submission = {
        topic: topic || quiz.topic,
        difficulty: difficulty || quiz.difficulty,
        answers: answers,
        timeSpent: (quiz.timeLimit || 600) - timeRemaining,
        questions: quiz.questions
      };

      const result = await mentorApi.submitQuiz(submission);
      
      // Navigate to results page with quiz results
      navigate('/quiz-results', { 
        state: { 
          results: result,
          quizData: quiz,
          answers: answers 
        } 
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-dark-secondary">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center">
      <div className="text-center p-8 bg-dark-secondary rounded-lg shadow-md max-w-md border border-dark">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-dark-primary mb-2">No Quiz Questions</h2>
        <p className="text-dark-secondary mb-4">
          No questions were generated for this quiz. Please try a different topic or difficulty.
        </p>
        <button
          onClick={() => navigate('/dsa-mentor')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to DSA Mentor
        </button>
      </div>
    </div>
  );
}

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-dark-primary flex items-center justify-center">
  //       <div className="text-center p-8 bg-dark-secondary rounded-lg shadow-md max-w-md border border-dark">
  //         <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-xl font-semibold text-dark-primary mb-2">Quiz Load Error</h2>
  //         <p className="text-dark-secondary mb-4">{error}</p>
  //         <button
  //           onClick={() => navigate('/dsa-mentor')}
  //           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
  //         >
  //           Back to DSA Mentor
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const allQuestionsAnswered = getAnsweredQuestionsCount() === quiz.questions.length;

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <div className="bg-dark-secondary shadow-sm border-b border-dark">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dsa-mentor')}
                className="p-2 text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary rounded-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-dark-primary">
                  🧠 Quiz: {quiz.topic}
                </h1>
                <p className="text-sm text-dark-secondary">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length} • {difficulty} Level
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-dark-secondary">
                <Clock className="h-4 w-4" />
                <span className={`font-mono ${timeRemaining < 60 ? 'text-red-400' : 'text-dark-primary'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-dark-secondary">
                📊 {getAnsweredQuestionsCount()}/{quiz.questions.length} answered
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-dark rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-dark-secondary rounded-lg shadow-md p-8 border border-dark">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start space-x-3 mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                {currentQuestionIndex + 1}
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-dark-primary mb-2">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.type === 'code_output' && currentQuestion.code && (
                  <div className="bg-dark-tertiary rounded-md p-4 mt-4 border border-dark">
                    <pre className="text-sm text-dark-primary font-mono overflow-x-auto">
                      {currentQuestion.code}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestionIndex] === index
                    ? 'border-blue-500 bg-blue-600/10'
                    : 'border-dark hover:border-dark-secondary hover:bg-dark-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm ${
                    answers[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-dark-secondary text-dark-secondary'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-dark-primary">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-dark">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-dark-secondary hover:text-dark-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4">
              {isLastQuestion ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || !allQuestionsAnswered}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-6 bg-dark-secondary rounded-lg shadow-md p-6 border border-dark">
          <h3 className="text-sm font-semibold text-dark-primary mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded text-sm font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-600 text-white'
                    : 'bg-dark-tertiary text-dark-secondary border border-dark'
                } hover:scale-105 transition-transform`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
