import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, ArrowLeft } from 'lucide-react';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { results, quizData, answers } = location.state || {};

  if (!results || !quizData) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center p-8 bg-dark-secondary rounded-lg border border-dark max-w-md">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-primary mb-2">Results Not Found</h2>
          <p className="text-dark-secondary mb-4">Quiz results could not be loaded.</p>
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

  const { score, totalQuestions, correctAnswers, timeSpent, performance, feedback } = results;
  const percentage = Math.round((score / totalQuestions) * 100);

  const getScoreColor = (percent) => {
    if (percent >= 80) return 'text-green-400';
    if (percent >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (percent) => {
    if (percent >= 90) return { text: 'Excellent!', color: 'bg-green-900/30 text-green-300 border border-green-600', icon: '🌟' };
    if (percent >= 80) return { text: 'Great Job!', color: 'bg-blue-900/30 text-blue-300 border border-blue-600', icon: '🎉' };
    if (percent >= 70) return { text: 'Good Work!', color: 'bg-yellow-900/30 text-yellow-300 border border-yellow-600', icon: '👍' };
    if (percent >= 60) return { text: 'Keep Practicing', color: 'bg-orange-900/30 text-orange-300 border border-orange-600', icon: '📚' };
    return { text: 'Needs Improvement', color: 'bg-red-900/30 text-red-300 border border-red-600', icon: '💪' };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const badge = getScoreBadge(percentage);

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <div className="bg-dark-secondary border-b border-dark">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dsa-mentor')}
              className="p-2 text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-dark-primary">
                🎯 Quiz Results: {quizData.topic}
              </h1>
              <p className="text-sm text-dark-secondary">
                {quizData.difficulty} Level Quiz Complete
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Score Overview */}
        <div className="bg-dark-secondary rounded-lg border border-dark p-8 mb-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Trophy className={`h-16 w-16 ${getScoreColor(percentage)}`} />
            </div>
            <h2 className="text-3xl font-bold text-dark-primary mb-2">
              Quiz Complete!
            </h2>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color} mb-4`}>
              <span className="mr-1">{badge.icon}</span>
              {badge.text}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(percentage)} mb-1`}>
                {percentage}%
              </div>
              <div className="text-sm text-dark-secondary">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-dark-primary mb-1">
                {score}/{totalQuestions}
              </div>
              <div className="text-sm text-dark-secondary">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {formatTime(timeSpent)}
              </div>
              <div className="text-sm text-dark-secondary">Time Spent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {quizData.questions.length}
              </div>
              <div className="text-sm text-dark-secondary">Total Questions</div>
            </div>
          </div>

          {/* Performance Breakdown */}
          {performance && (
            <div className="border-t border-dark pt-6">
              <h3 className="text-lg font-semibold text-dark-primary mb-4">Performance by Topic</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(performance).map(([topic, data]) => (
                  <div key={topic} className="bg-dark-tertiary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-dark-primary">{topic}</span>
                      <span className={`font-semibold ${getScoreColor(data.percentage)}`}>
                        {data.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          data.percentage >= 80 ? 'bg-green-400' :
                          data.percentage >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-dark-secondary mt-1">
                      {data.correct}/{data.total} questions correct
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Results */}
        <div className="bg-dark-secondary rounded-lg border border-dark p-6 mb-6">
          <h3 className="text-lg font-semibold text-dark-primary mb-6">Question Review</h3>
          <div className="space-y-6">
            {quizData.questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={index} className="border border-dark rounded-lg p-4">
                  <div className="flex items-start space-x-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-dark-primary mb-2">
                        Question {index + 1}: {question.question}
                      </h4>
                      
                      {question.code && (
                        <div className="bg-dark-tertiary rounded-md p-3 mb-3">
                          <pre className="text-sm text-dark-primary font-mono">
                            {question.code}
                          </pre>
                        </div>
                      )}

                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded text-sm ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-900/30 text-green-300 border border-green-600'
                                : optionIndex === userAnswer && !isCorrect
                                ? 'bg-red-900/30 text-red-300 border border-red-600'
                                : 'bg-dark-tertiary text-dark-secondary border border-dark'
                            }`}
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>{' '}
                            {option}
                            {optionIndex === question.correctAnswer && (
                              <span className="ml-2 text-green-400">✓ Correct</span>
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <span className="ml-2 text-red-400">✗ Your answer</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-900/30 rounded-md border border-blue-600">
                          <p className="text-sm text-blue-300">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback & Next Steps */}
        {feedback && (
          <div className="bg-dark-secondary rounded-lg border border-dark p-6 mb-6">
            <h3 className="text-lg font-semibold text-dark-primary mb-4">Personalized Feedback</h3>
            
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-green-400 mb-2">🌟 Strengths</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-dark-secondary">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.improvements && feedback.improvements.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-orange-400 mb-2">📈 Areas for Improvement</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-dark-secondary">
                  {feedback.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.recommendations && feedback.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-400 mb-2">💡 Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-dark-secondary">
                  {feedback.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(`/quiz/${quizData.topic}/${quizData.difficulty}`)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Take Quiz Again</span>
          </button>
          
          <button
            onClick={() => navigate('/dsa-mentor')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <span>Continue Learning</span>
          </button>
          
          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <span>Try Different Topic</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
