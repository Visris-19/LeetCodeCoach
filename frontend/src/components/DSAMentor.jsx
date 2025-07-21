import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  BookOpen, 
  Code, 
  CheckCircle, 
  Clock, 
  Award,
  Send,
  Play,
  Target,
  TrendingUp,
  Lightbulb,
  FileText,
  MessageCircle,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';
import { mentorApi } from '../utils/api';

const DSAMentor = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('request'); // request, session, progress, history
  const [currentSession, setCurrentSession] = useState(null);
  const [learningProgress, setLearningProgress] = useState(null);
  const [learningHistory, setLearningHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Request form state
  const [requestForm, setRequestForm] = useState({
    topic: '',
    difficulty: 'beginner',
    learningType: 'explanation',
    description: ''
  });

  // Code review state
  const [codeReview, setCodeReview] = useState({
    code: '',
    language: 'java',
    feedback: null
  });

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [progressRes, historyRes, suggestionsRes] = await Promise.all([
        mentorApi.getLearningProgress(),
        mentorApi.getLearningHistory(),
        mentorApi.getLearningPathSuggestions()
      ]);

      setLearningProgress(progressRes.data);
      setLearningHistory(historyRes.data);
      setSuggestions(suggestionsRes.data);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestForm.topic.trim()) {
      setError('Please enter a topic to learn');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await mentorApi.submitLearningRequest(
        requestForm.topic,
        requestForm.difficulty,
        requestForm.learningType,
        requestForm.description
      );

      // Create session object from API response
      const session = {
        _id: response.data.sessionId,
        topic: response.data.topic,
        difficulty: response.data.difficulty.toLowerCase(),
        learningType: requestForm.learningType,
        content: response.data.content,
        message: response.data.message
      };

      setCurrentSession(session);
      setActiveView('session');
      
      // Reset form
      setRequestForm({
        topic: '',
        difficulty: 'beginner',
        learningType: 'explanation',
        description: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create learning session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!codeReview.code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await mentorApi.submitCodeForReview(
        currentSession._id,
        codeReview.code,
        codeReview.language
      );

      setCodeReview(prev => ({ ...prev, feedback: response.data.feedback }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to get code review');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (topic, difficulty) => {
    setLoading(true);
    setError(null);

    try {
      const response = await mentorApi.getQuiz(topic, difficulty);
      setCurrentQuiz(response.data.quiz);
      setQuizAnswers(new Array(response.data.quiz.questions.length).fill(''));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentSession || !currentQuiz) return;

    setLoading(true);
    setError(null);

    try {
      const response = await mentorApi.submitQuiz(currentSession._id, quizAnswers);
      // Update current session with quiz results
      setCurrentSession(prev => ({
        ...prev,
        quizResults: response.data.results
      }));
      setCurrentQuiz(null);
      setQuizAnswers([]);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const renderLearningRequest = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-dark-primary mb-2">DSA Mentor</h2>
        <p className="text-dark-secondary">
          Tell me what you want to learn and I'll create a personalized lesson just for you
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="bg-dark-secondary rounded-lg border border-dark p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-primary mb-2">
            What do you want to learn?
          </label>
          <input
            type="text"
            value={requestForm.topic}
            onChange={(e) => setRequestForm(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="e.g., Binary Search Trees, Dynamic Programming, Graph Algorithms..."
            className="w-full px-4 py-2 bg-dark-primary border border-dark rounded-lg text-dark-primary placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-primary mb-2">
              Difficulty Level
            </label>
            <select
              value={requestForm.difficulty}
              onChange={(e) => setRequestForm(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full px-4 py-2 bg-dark-primary border border-dark rounded-lg text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-primary mb-2">
              Learning Type
            </label>
            <select
              value={requestForm.learningType}
              onChange={(e) => setRequestForm(prev => ({ ...prev, learningType: e.target.value }))}
              className="w-full px-4 py-2 bg-dark-primary border border-dark rounded-lg text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="explanation">Explanation & Theory</option>
              <option value="implementation">Code Implementation</option>
              <option value="practice">Practice Problems</option>
              <option value="quiz">Interactive Quiz</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-primary mb-2">
            Additional Details (Optional)
          </label>
          <textarea
            value={requestForm.description}
            onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Any specific areas you want to focus on or questions you have..."
            rows={3}
            className="w-full px-4 py-2 bg-dark-primary border border-dark rounded-lg text-dark-primary placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSubmitRequest}
          disabled={loading || !requestForm.topic.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Creating your lesson...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Start Learning
            </>
          )}
        </button>
      </div>

      {/* Quick suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-dark-secondary rounded-lg border border-dark p-4">
          <h3 className="text-lg font-semibold text-dark-primary mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Recommended Topics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.slice(0, 6).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setRequestForm(prev => ({ ...prev, topic: suggestion.topic }))}
                className="text-left p-3 rounded-lg bg-dark-primary hover:bg-dark-tertiary transition-colors border border-dark"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-dark-primary font-medium">{suggestion.topic}</span>
                </div>
                <p className="text-sm text-dark-secondary mt-1">{suggestion.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLearningSession = () => {
    if (!currentSession) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark-primary">{currentSession.topic}</h2>
              <p className="text-dark-secondary capitalize">
                {currentSession.difficulty} • {currentSession.learningType}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('request')}
            className="px-4 py-2 bg-dark-tertiary text-dark-primary rounded-lg hover:bg-dark-muted transition-colors"
          >
            New Topic
          </button>
        </div>

        {/* Learning Content */}
        {currentSession.content && (
          <div className="bg-dark-secondary rounded-lg border border-dark p-6">
            <h3 className="text-lg font-semibold text-dark-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Learning Content
            </h3>
            <div className="prose prose-invert max-w-none">
              {currentSession.content.explanation && (
                <div className="mb-6">
                  <h4 className="text-dark-primary font-medium mb-2">Explanation</h4>
                  <div className="text-dark-secondary whitespace-pre-wrap">
                    {currentSession.content.explanation}
                  </div>
                </div>
              )}
              
              {currentSession.content.codeExamples && currentSession.content.codeExamples.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-dark-primary font-medium mb-2">Code Examples</h4>
                  <div className="space-y-4">
                    {currentSession.content.codeExamples.map((example, index) => (
                      <pre key={index} className="bg-dark-primary p-4 rounded-lg overflow-x-auto">
                        <code className="text-green-400">{example}</code>
                      </pre>
                    ))}
                  </div>
                </div>
              )}
              
              {currentSession.content.keyPoints && currentSession.content.keyPoints.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-dark-primary font-medium mb-2">Key Points</h4>
                  <ul className="text-dark-secondary space-y-2">
                    {currentSession.content.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {currentSession.content.practiceProblems && currentSession.content.practiceProblems.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-dark-primary font-medium mb-2">Practice Problems</h4>
                  <div className="space-y-3">
                    {currentSession.content.practiceProblems.map((problem, index) => (
                      <div key={index} className="bg-dark-primary p-4 rounded-lg">
                        <h5 className="font-medium text-dark-primary mb-2">{problem.title}</h5>
                        <p className="text-dark-secondary text-sm mb-2">{problem.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-1 rounded ${
                            problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                            problem.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-dark-muted">{problem.timeComplexity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interactive Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code Review */}
          <div className="bg-dark-secondary rounded-lg border border-dark p-6">
            <h3 className="text-lg font-semibold text-dark-primary mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Code Review
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">
                  Language
                </label>
                <select
                  value={codeReview.language}
                  onChange={(e) => setCodeReview(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-primary border border-dark rounded-lg text-dark-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-primary mb-2">
                  Your Code
                </label>
                <textarea
                  value={codeReview.code}
                  onChange={(e) => setCodeReview(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Paste your code here for review..."
                  rows={8}
                  className="w-full px-3 py-2 bg-dark-primary border border-dark rounded-lg text-dark-primary placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              
              <button
                onClick={handleSubmitCode}
                disabled={loading || !codeReview.code.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    Get Feedback
                  </>
                )}
              </button>
              
              {codeReview.feedback && (
                <div className="bg-dark-primary p-4 rounded-lg">
                  <h4 className="font-medium text-dark-primary mb-2">AI Feedback</h4>
                  <div className="text-dark-secondary whitespace-pre-wrap text-sm">
                    {codeReview.feedback}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quiz */}
          <div className="bg-dark-secondary rounded-lg border border-dark p-6">
            <h3 className="text-lg font-semibold text-dark-primary mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Knowledge Check
            </h3>
            
            {!currentQuiz ? (
              <div className="text-center py-8">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-dark-secondary mb-4">
                  Test your understanding with a quick quiz
                </p>
                <button
                  onClick={() => navigate(`/quiz/${currentSession.topic}/${currentSession.difficulty}`)}
                  disabled={loading}
                  className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Take Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-dark-primary">{currentQuiz.title}</h4>
                  <span className="text-sm text-dark-secondary">
                    {currentQuiz.questions.length} questions
                  </span>
                </div>
                
                <div className="space-y-4">
                  {currentQuiz.questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-dark-primary p-4 rounded-lg">
                      <h5 className="font-medium text-dark-primary mb-3">
                        {qIndex + 1}. {question.question}
                      </h5>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <label key={oIndex} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              value={oIndex}
                              checked={quizAnswers[qIndex] === oIndex}
                              onChange={(e) => {
                                const newAnswers = [...quizAnswers];
                                newAnswers[qIndex] = parseInt(e.target.value);
                                setQuizAnswers(newAnswers);
                              }}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-dark-secondary">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleSubmitQuiz}
                  disabled={loading || quizAnswers.some(answer => answer === '')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit Quiz
                    </>
                  )}
                </button>
              </div>
            )}
            
            {currentSession.quizResults && (
              <div className="mt-4 bg-dark-primary p-4 rounded-lg">
                <h4 className="font-medium text-dark-primary mb-2">Quiz Results</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-dark-primary">
                    Score: {currentSession.quizResults.score}% 
                    ({currentSession.quizResults.correct}/{currentSession.quizResults.total})
                  </span>
                </div>
                {currentSession.quizResults.feedback && (
                  <p className="text-dark-secondary text-sm">
                    {currentSession.quizResults.feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProgress = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-dark-primary mb-2">Learning Progress</h2>
        <p className="text-dark-secondary">
          Track your DSA learning journey and achievements
        </p>
      </div>

      {learningProgress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-secondary rounded-lg border border-dark p-6 text-center">
            <div className="bg-blue-600 p-3 rounded-full w-12 h-12 mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-dark-primary mb-2">
              {learningProgress.totalSessions}
            </h3>
            <p className="text-dark-secondary">Learning Sessions</p>
          </div>

          <div className="bg-dark-secondary rounded-lg border border-dark p-6 text-center">
            <div className="bg-purple-600 p-3 rounded-full w-12 h-12 mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-dark-primary mb-2">
              {learningProgress.topicsMastered}
            </h3>
            <p className="text-dark-secondary">Topics Mastered</p>
          </div>

          <div className="bg-dark-secondary rounded-lg border border-dark p-6 text-center">
            <div className="bg-green-600 p-3 rounded-full w-12 h-12 mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-dark-primary mb-2">
              {learningProgress.averageScore}%
            </h3>
            <p className="text-dark-secondary">Average Quiz Score</p>
          </div>
        </div>
      )}

      {/* Topic Progress */}
      {learningProgress && learningProgress.topicProgress && (
        <div className="bg-dark-secondary rounded-lg border border-dark p-6">
          <h3 className="text-lg font-semibold text-dark-primary mb-4">Topic Mastery</h3>
          <div className="space-y-3">
            {Object.entries(learningProgress.topicProgress).map(([topic, progress]) => (
              <div key={topic} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-dark-primary font-medium">{topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-dark-primary rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${progress.masteryLevel}%` }}
                    />
                  </div>
                  <span className="text-dark-secondary text-sm w-12 text-right">
                    {progress.masteryLevel}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
          <Clock className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-dark-primary mb-2">Learning History</h2>
        <p className="text-dark-secondary">
          Review your past learning sessions and track your progress
        </p>
      </div>

      {learningHistory.length > 0 ? (
        <div className="space-y-4">
          {learningHistory.map((session) => (
            <div key={session._id} className="bg-dark-secondary rounded-lg border border-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-dark-primary">{session.topic}</h3>
                    <p className="text-dark-secondary capitalize">
                      {session.difficulty} • {session.learningType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-dark-secondary text-sm">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-dark-muted text-xs">
                    {new Date(session.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {session.quizResults && (
                <div className="bg-dark-primary p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-secondary">Quiz Score:</span>
                    <span className="text-dark-primary font-medium">
                      {session.quizResults.score}% ({session.quizResults.correct}/{session.quizResults.total})
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-dark-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-primary mb-2">No Learning History Yet</h3>
          <p className="text-dark-secondary">
            Start your first learning session to see your progress here!
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-dark pb-4">
        <button
          onClick={() => setActiveView('request')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            activeView === 'request'
              ? 'bg-blue-600 text-white'
              : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary'
          }`}
        >
          <Send className="w-4 h-4" />
          New Request
        </button>
        
        {currentSession && (
          <button
            onClick={() => setActiveView('session')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              activeView === 'session'
                ? 'bg-blue-600 text-white'
                : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Current Session
          </button>
        )}
        
        <button
          onClick={() => setActiveView('progress')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            activeView === 'progress'
              ? 'bg-blue-600 text-white'
              : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Progress
        </button>
        
        <button
          onClick={() => setActiveView('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            activeView === 'history'
              ? 'bg-blue-600 text-white'
              : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary'
          }`}
        >
          <Clock className="w-4 h-4" />
          History
        </button>
      </div>

      {/* Content */}
      {activeView === 'request' && renderLearningRequest()}
      {activeView === 'session' && renderLearningSession()}
      {activeView === 'progress' && renderProgress()}
      {activeView === 'history' && renderHistory()}
    </div>
  );
};

export default DSAMentor;
