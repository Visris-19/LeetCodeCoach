import { useState } from 'react';
import { Lightbulb, X, ExternalLink, Clock, AlertTriangle } from 'lucide-react';

const PlannerCard = ({ suggestions, onClose, questionData, isVisible }) => {
  const [activeTab, setActiveTab] = useState('foundational');

  if (!isVisible || !suggestions) return null;

  const { foundational = [], similar = [], revisionPlan = null } = suggestions;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                AI Suggestions for {questionData?.title}
              </h2>
              <p className="text-purple-100">
                Powered by Gemini AI • Personalized recommendations based on your performance
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('foundational')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'foundational'
                  ? 'border-purple-500 text-purple-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Foundational Problems ({foundational.length})
            </button>
            <button
              onClick={() => setActiveTab('similar')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'similar'
                  ? 'border-purple-500 text-purple-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Similar Problems ({similar.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'foundational' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-900">Build Your Foundation</h3>
                </div>
                <p className="text-amber-800 text-sm">
                  These easier problems will help you understand the core concepts needed to solve "{questionData?.title}". 
                  Master these first before attempting the original problem again.
                </p>
              </div>

              {foundational.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No foundational problems suggested at this time.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {foundational.map((problem, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm text-gray-500">{problem.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{problem.title}</h4>
                          {problem.reason && (
                            <p className="text-gray-600 text-sm mb-3">{problem.reason}</p>
                          )}
                          {problem.topics && (
                            <div className="flex flex-wrap gap-1">
                              {problem.topics.map((topic, topicIndex) => (
                                <span
                                  key={topicIndex}
                                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'similar' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Practice Similar Patterns</h3>
                </div>
                <p className="text-blue-800 text-sm">
                  These problems use similar algorithms, data structures, or problem-solving patterns. 
                  Practicing these will strengthen your understanding of the core concepts.
                </p>
              </div>

              {similar.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No similar problems found at this time.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {similar.map((problem, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm text-gray-500">{problem.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{problem.title}</h4>
                          {problem.similarity && (
                            <p className="text-gray-600 text-sm mb-3">{problem.similarity}</p>
                          )}
                          {problem.topics && (
                            <div className="flex flex-wrap gap-1">
                              {problem.topics.map((topic, topicIndex) => (
                                <span
                                  key={topicIndex}
                                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Generated by Gemini AI
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerCard;
