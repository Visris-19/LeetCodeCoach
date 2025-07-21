import { useState } from 'react';
import { Clock, Target, Brain, Sparkles } from 'lucide-react';

const StartRevision = ({ onStartSession, questions }) => {
  const [duration, setDuration] = useState(60);
  const [numberOfQuestions, setNumberOfQuestions] = useState(3);
  const [focusTopics, setFocusTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get unique topics from questions
  const availableTopics = [...new Set(questions.flatMap(q => q.topics || []))].sort();

  const handleTopicToggle = (topic) => {
    setFocusTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleStartSession = async () => {
    setLoading(true);
    try {
      await onStartSession(duration, focusTopics, numberOfQuestions);
    } catch (error) {
      console.error('Failed to start revision session:', error);
    } finally {
      setLoading(false);
    }
  };

  const estimatedTime = numberOfQuestions * 20; // 20 min average per question
  const maxQuestions = Math.min(questions.length, 10); // Max 10 questions or available questions

  return (
    <div className="bg-dark-secondary rounded-lg border border-dark p-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-dark-primary mb-2">Start AI Revision Session</h2>
        <p className="text-dark-secondary">
          Let AI create a personalized revision plan based on your performance and weak areas
        </p>
      </div>      <div className="space-y-6">
        {/* Number of Questions Selection */}
        <div>
          <label className="block text-sm font-medium text-dark-primary mb-3">
            Number of Questions
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setNumberOfQuestions(num)}
                disabled={num > maxQuestions}
                className={`p-3 rounded-lg border text-center transition-all ${
                  numberOfQuestions === num
                    ? 'border-purple-500 bg-purple-600/20 text-purple-400'
                    : num > maxQuestions
                    ? 'border-gray-700 bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'border-dark bg-dark-tertiary text-dark-secondary hover:bg-hover-bg'
                }`}
              >
                <Target className="w-4 h-4 mx-auto mb-1" />
                <div className="text-sm font-medium">{num}</div>
              </button>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-dark-muted flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Estimated time: ~{estimatedTime} minutes • Available questions: {questions.length}
          </div>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-dark-primary mb-3">
            Session Duration (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  duration === mins
                    ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                    : 'border-dark bg-dark-tertiary text-dark-secondary hover:bg-hover-bg'
                }`}
              >
                <Clock className="w-4 h-4 mx-auto mb-1" />
                <div className="text-sm font-medium">{mins} min</div>
              </button>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-dark-muted flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            AI will optimize time allocation per question based on difficulty
          </div>
        </div>

        {/* Topic Focus */}
        {availableTopics.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-dark-primary mb-3">
              Focus Topics (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`p-2 rounded-lg border text-xs text-center transition-all ${
                    focusTopics.includes(topic)
                      ? 'border-purple-500 bg-purple-600/20 text-purple-400'
                      : 'border-dark bg-dark-tertiary text-dark-secondary hover:bg-hover-bg'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            
            <div className="mt-2 text-xs text-dark-muted">
              Leave empty for AI to automatically select based on your weaknesses
            </div>
          </div>
        )}

        {/* AI Features Info */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI-Powered Features
          </h3>
          <ul className="text-xs text-blue-300 space-y-1">            <li>• Smart question selection based on your revision history</li>
            <li>• Adaptive difficulty progression for {numberOfQuestions} questions</li>
            <li>• Focus on your weak topics and patterns</li>
            <li>• Real-time performance tracking and learning</li>
            <li>• Optimal time allocation per question difficulty</li>
          </ul>
        </div>

        {/* Start Button */}        <button
          onClick={handleStartSession}
          disabled={loading || questions.length === 0 || numberOfQuestions > maxQuestions}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg 
                     hover:from-blue-700 hover:to-purple-700 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-3 font-medium text-lg"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating AI Session...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Start {numberOfQuestions}-Question Revision
            </>
          )}
        </button>

        {questions.length === 0 ? (
          <div className="text-center text-dark-muted text-sm">
            Add some completed questions first to start revision sessions
          </div>
        ) : numberOfQuestions > maxQuestions ? (
          <div className="text-center text-yellow-400 text-sm">
            You only have {questions.length} questions available. Add more questions or select fewer.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StartRevision;
