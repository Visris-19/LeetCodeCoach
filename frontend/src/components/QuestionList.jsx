import { useState } from 'react';
import { CheckCircle, XCircle, Clock, RotateCcw, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const QuestionList = ({ 
  questions, 
  onStatusChange, 
  onTimeUpdate, 
  onGetSuggestions,
  loadingSuggestions = {}
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [timeInputs, setTimeInputs] = useState({});

  const toggleExpanded = (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleTimeChange = (questionId, time) => {
    setTimeInputs(prev => ({
      ...prev,
      [questionId]: time
    }));
  };

  const saveTime = (questionId) => {
    const time = parseInt(timeInputs[questionId]);
    if (time && time > 0) {
      onTimeUpdate(questionId, time);
      setTimeInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[questionId];
        return newInputs;
      });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>;
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No questions found</div>
        <p className="text-gray-500">Use the search bar to find questions or add new ones via AI</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <div
          key={question.id}
          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            {/* Question Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-gray-500">{question.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  {question.fail_count > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                      Failed {question.fail_count}x
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{question.title}</h3>
                
                {question.topics && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {question.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                
                {question.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{question.description}</p>
                )}
                
                {question.date && (
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Last attempted: {question.date}</span>
                    {question.time_taken && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {question.time_taken} min
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Status Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStatusChange(question.id, 'completed')}
                  className={`p-2 rounded-lg transition-colors ${
                    question.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                  }`}
                  title="Mark as completed"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => onStatusChange(question.id, 'failed')}
                  className={`p-2 rounded-lg transition-colors ${
                    question.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                  }`}
                  title="Mark as failed"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                
                {question.status && (
                  <button
                    onClick={() => onStatusChange(question.id, null)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    title="Reset status"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
                
                <button
                  onClick={() => toggleExpanded(question.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  {expandedQuestions.has(question.id) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Expanded Content */}
            {expandedQuestions.has(question.id) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Time Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time taken (minutes)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={timeInputs[question.id] || ''}
                        onChange={(e) => handleTimeChange(question.id, e.target.value)}
                        placeholder="e.g., 45"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => saveTime(question.id)}
                        disabled={!timeInputs[question.id]}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  
                  {/* AI Suggestions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Get AI suggestions
                    </label>
                    <button
                      onClick={() => onGetSuggestions(question)}
                      disabled={loadingSuggestions[question.id]}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingSuggestions[question.id] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Getting suggestions...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4" />
                          Get similar problems
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
