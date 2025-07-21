import { useState, useEffect } from 'react';
import { BarChart, Calendar, Target, TrendingUp, Brain, Clock, Award, AlertTriangle, Activity } from 'lucide-react';

const PerformanceDashboard = ({ performance, recentSessions }) => {
  if (!performance) {
    return (
      <div className="bg-dark-secondary rounded-lg border border-dark p-6">
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-dark-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-primary mb-2">No Performance Data</h3>
          <p className="text-dark-secondary">Complete some revision sessions to see your analytics</p>
        </div>
      </div>
    );
  }

  const getWeakestTopics = () => {
    return performance.topicPerformance
      .filter(tp => tp.weaknessScore > 60)
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, 5);
  };

  const getTopPerformingTopics = () => {
    return performance.topicPerformance
      .filter(tp => tp.weaknessScore < 40 && tp.questionsAttempted > 0)
      .sort((a, b) => a.weaknessScore - b.weaknessScore)
      .slice(0, 3);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const weakestTopics = getWeakestTopics();
  const topPerformingTopics = getTopPerformingTopics();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-secondary border border-dark rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Questions Added</p>
              <p className="text-2xl font-bold text-dark-primary">{performance.totalQuestionsAdded}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-dark-secondary border border-dark rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Revision Sessions</p>
              <p className="text-2xl font-bold text-dark-primary">{performance.totalRevisionSessions}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-dark-secondary border border-dark rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Total Time</p>
              <p className="text-2xl font-bold text-dark-primary">{formatTime(performance.totalRevisionTime)}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-dark-secondary border border-dark rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Avg Completion</p>
              <p className="text-2xl font-bold text-dark-primary">{performance.averageSessionCompletion.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Difficulty Performance */}
      {performance.difficultyPerformance.length > 0 && (
        <div className="bg-dark-secondary border border-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold text-dark-primary mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Difficulty Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performance.difficultyPerformance.map((diff) => (
              <div key={diff.difficulty} className="bg-dark-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium ${
                    diff.difficulty === 'Easy' ? 'text-green-400' :
                    diff.difficulty === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {diff.difficulty}
                  </h4>
                  <span className="text-dark-muted text-sm">
                    {diff.questionsAttempted} questions
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-secondary">Completion Rate:</span>
                    <span className="text-dark-primary font-medium">{diff.completionRate.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-dark-secondary">Avg Time:</span>
                    <span className="text-dark-primary font-medium">{formatTime(diff.averageTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weakest Topics */}
        {weakestTopics.length > 0 && (
          <div className="bg-dark-secondary border border-dark rounded-lg p-6">
            <h3 className="text-lg font-semibold text-dark-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Areas Needing Focus
            </h3>
            <div className="space-y-3">
              {weakestTopics.map((topic) => (
                <div key={topic.topic} className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-red-400">{topic.topic}</h4>
                    <span className="text-red-300 text-sm font-medium">
                      {topic.weaknessScore}/100 weakness
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-red-200">
                    <div>
                      <span className="text-red-300">Attempted:</span> {topic.questionsAttempted}
                    </div>
                    <div>
                      <span className="text-red-300">Completed:</span> {topic.questionsCompleted}
                    </div>
                  </div>
                  
                  {topic.lastAttempted && (
                    <div className="mt-2 text-xs text-red-300">
                      Last practiced: {new Date(topic.lastAttempted).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performing Topics */}
        {topPerformingTopics.length > 0 && (
          <div className="bg-dark-secondary border border-dark rounded-lg p-6">
            <h3 className="text-lg font-semibold text-dark-primary mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Strong Areas
            </h3>
            <div className="space-y-3">
              {topPerformingTopics.map((topic) => (
                <div key={topic.topic} className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-400">{topic.topic}</h4>
                    <span className="text-green-300 text-sm font-medium">
                      {(100 - topic.weaknessScore).toFixed(0)}% strong
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-green-200">
                    <div>
                      <span className="text-green-300">Attempted:</span> {topic.questionsAttempted}
                    </div>
                    <div>
                      <span className="text-green-300">Completed:</span> {topic.questionsCompleted}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      {recentSessions && recentSessions.length > 0 && (
        <div className="bg-dark-secondary border border-dark rounded-lg p-6">
          <h3 className="text-lg font-semibold text-dark-primary mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Sessions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark">
                  <th className="text-left py-2 text-sm font-medium text-dark-secondary">Date</th>
                  <th className="text-left py-2 text-sm font-medium text-dark-secondary">Questions</th>
                  <th className="text-left py-2 text-sm font-medium text-dark-secondary">Completed</th>
                  <th className="text-left py-2 text-sm font-medium text-dark-secondary">Time</th>
                  <th className="text-left py-2 text-sm font-medium text-dark-secondary">Rate</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.slice(0, 5).map((session) => (
                  <tr key={session._id} className="border-b border-dark/50">
                    <td className="py-3 text-sm text-dark-primary">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-sm text-dark-secondary">
                      {session.questions.length}
                    </td>
                    <td className="py-3 text-sm text-green-400">
                      {session.questionsCompleted}
                    </td>
                    <td className="py-3 text-sm text-dark-secondary">
                      {formatTime(session.totalActualTime || 0)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        session.performance?.completionRate >= 80 ? 'bg-green-900/30 text-green-400' :
                        session.performance?.completionRate >= 60 ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {session.performance?.completionRate?.toFixed(0) || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Learning Insights */}
      {performance.learningPatterns && (
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Learning Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-blue-300 mb-2">Optimal Settings</h4>
              <div className="space-y-1 text-sm text-blue-200">
                <div>Session Duration: {performance.learningPatterns.optimalSessionDuration} minutes</div>
                <div>Revision Frequency: Every {performance.learningPatterns.revisionFrequency} days</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-blue-300 mb-2">Focus Areas</h4>
              <div className="space-y-1 text-sm">
                {performance.learningPatterns.strugglingTopics?.length > 0 && (
                  <div className="text-red-300">
                    Struggling: {performance.learningPatterns.strugglingTopics.join(', ')}
                  </div>
                )}
                {performance.learningPatterns.improvingAreas?.length > 0 && (
                  <div className="text-green-300">
                    Improving: {performance.learningPatterns.improvingAreas.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
