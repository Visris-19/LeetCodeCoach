import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Brain, Plus, Target, BarChart, Activity, Sparkles, GraduationCap } from 'lucide-react';

// Components
import AddQuestion from './components/AddQuestion';
import QuestionBank from './components/QuestionBank';
import StartRevision from './components/StartRevision';
import RevisionSession from './components/RevisionSession';
import PerformanceDashboard from './components/Dashboard';
import DSAMentor from './components/DSAMentor';
import Quiz from './components/Quiz';
import QuizResults from './components/QuizResults';
import QuizLanding from './components/QuizLanding';

// API
import { questionApi, revisionApi, performanceApi } from './utils/api';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRevisionSetup, setShowRevisionSetup] = useState(false);

  // Determine active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/quiz')) return 'quiz';
    if (path === '/dsa-mentor') return 'mentor';
    if (path === '/dashboard') return 'dashboard';
    return 'questions';
  };

  const activeTab = getActiveTab();

  // Load data on mount
  useEffect(() => {
    loadQuestions();
    loadPerformance();
    checkActiveSession();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await questionApi.getAllQuestions();
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const loadPerformance = async () => {
    try {
      const response = await performanceApi.getUserPerformance();
      setPerformance(response.data.performance);
      setRecentSessions(response.data.recentSessions);
    } catch (error) {
      console.error('Failed to load performance:', error);
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await revisionApi.getActiveSession();
      if (response.data.session) {
        setActiveSession(response.data.session);
        setActiveTab('revision');
      }
    } catch (error) {
      console.error('Failed to check active session:', error);
    }
  };

  const handleQuestionAdded = (newQuestion) => {
    setQuestions(prev => [newQuestion, ...prev]);
    loadPerformance(); // Refresh stats
  };

  const handleStartRevision = () => {
    if (questions.length === 0) {
      alert('Please add some completed questions first!');
      return;
    }
    setShowRevisionSetup(true);
  };

  const handleStartSession = async (duration, focusTopics, numberOfQuestions) => {
    setLoading(true);
    try {
      const response = await revisionApi.startSession(duration, focusTopics, numberOfQuestions);
      setActiveSession(response.data.session);
      setShowRevisionSetup(false);
      setActiveTab('revision');
    } catch (error) {
      console.error('Failed to start revision session:', error);
      alert('Failed to start revision session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionStart = async (sessionId, questionIndex) => {
    try {
      await revisionApi.startQuestion(sessionId, questionIndex);
      // Refresh session data
      const response = await revisionApi.getActiveSession();
      setActiveSession(response.data.session);
    } catch (error) {
      console.error('Failed to start question:', error);
      throw error;
    }
  };

  const handleQuestionComplete = async (sessionId, questionIndex) => {
    try {
      await revisionApi.completeQuestion(sessionId, questionIndex);
      // Refresh session data
      const response = await revisionApi.getActiveSession();
      setActiveSession(response.data.session);
    } catch (error) {
      console.error('Failed to complete question:', error);
      throw error;
    }
  };

  const handleSessionFinish = async (sessionId) => {
    try {
      await revisionApi.finishSession(sessionId);
      setActiveSession(null);
      navigate('/dashboard');
      // Refresh performance data
      await loadPerformance();
    } catch (error) {
      console.error('Failed to finish session:', error);
      throw error;
    }
  };

  const closeRevisionSession = () => {
    setActiveSession(null);
    navigate('/');
  };

  // If there's an active session, show it prominently
  if (activeSession && location.pathname === '/revision') {
    return (
      <div className="min-h-screen bg-dark-primary">
        <div className="max-w-6xl mx-auto p-6">
          <RevisionSession
            session={activeSession}
            onQuestionStart={handleQuestionStart}
            onQuestionComplete={handleQuestionComplete}
            onSessionFinish={handleSessionFinish}
            onClose={closeRevisionSession}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <header className="bg-dark-secondary border-b border-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark-primary">LeetCode Coach</h1>
                <p className="text-sm text-dark-secondary">AI-Powered Revision Mastery</p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              <button
                onClick={() => navigate('/')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'questions'
                    ? 'bg-blue-600 text-white'
                    : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary'
                }`}
              >
                <Plus className="w-4 h-4" />
                Questions
              </button>
              <button
                onClick={() => navigate('/dsa-mentor')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'mentor'
                    ? 'bg-blue-600 text-white'
                    : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                DSA Mentor
              </button>
              <button
                onClick={() => navigate('/quiz')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'quiz'
                    ? 'bg-blue-600 text-white'
                    : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary'
                }`}
              >
                <Brain className="w-4 h-4" />
                Quiz
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-tertiary'
                }`}
              >
                <BarChart className="w-4 h-4" />
                Analytics
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Revision Setup Modal */}
      {showRevisionSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-secondary rounded-lg border border-dark max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-dark-primary">Start Revision Session</h2>
                <button
                  onClick={() => setShowRevisionSetup(false)}
                  className="text-dark-muted hover:text-dark-primary"
                >
                  ✕
                </button>
              </div>
              <StartRevision
                questions={questions}
                onStartSession={handleStartSession}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          {/* Questions & Home Page */}
          <Route path="/" element={
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Question Section */}
              <div className="lg:col-span-1">
                <AddQuestion onQuestionAdded={handleQuestionAdded} />
                
                {/* Quick Stats */}
                {questions.length > 0 && (
                  <div className="mt-6 bg-dark-secondary rounded-lg border border-dark p-4">
                    <h3 className="text-sm font-medium text-dark-primary mb-3">Quick Stats</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-secondary">Total Questions:</span>
                        <span className="text-dark-primary font-medium">{questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-secondary">Never Revised:</span>
                        <span className="text-yellow-400 font-medium">
                          {questions.filter(q => !q.lastRevisedAt).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-secondary">Avg Revisions:</span>
                        <span className="text-blue-400 font-medium">
                          {(questions.reduce((sum, q) => sum + (q.revisionCount || 0), 0) / questions.length).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleStartRevision}
                      className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg 
                                 hover:from-green-700 hover:to-blue-700 transition-all
                                 flex items-center justify-center gap-2 font-medium"
                    >
                      <Sparkles className="w-4 h-4" />
                      Quick Revision
                    </button>
                  </div>
                )}
              </div>

              {/* Question Bank */}
              <div className="lg:col-span-2">
                <QuestionBank 
                  questions={questions} 
                  onStartRevision={handleStartRevision}
                />
              </div>
            </div>
          } />
          
          {/* DSA Mentor */}
          <Route path="/dsa-mentor" element={<DSAMentor />} />
          
          {/* Quiz Routes */}
          <Route path="/quiz" element={<QuizLanding />} />
          <Route path="/quiz/:topic/:difficulty" element={<Quiz />} />
          <Route path="/quiz-results" element={<QuizResults />} />
          
          {/* Performance Dashboard */}
          <Route path="/dashboard" element={
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-dark-primary mb-2">Performance Analytics</h2>
                <p className="text-dark-secondary">
                  Track your revision progress and identify areas for improvement
                </p>
              </div>
              
              <PerformanceDashboard 
                performance={performance} 
                recentSessions={recentSessions}
              />
            </div>
          } />
          
          {/* Revision Session Route */}
          <Route path="/revision" element={
            activeSession ? (
              <RevisionSession
                session={activeSession}
                onQuestionStart={handleQuestionStart}
                onQuestionComplete={handleQuestionComplete}
                onSessionFinish={handleSessionFinish}
                onClose={closeRevisionSession}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-dark-secondary">No active revision session</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Questions
                </button>
              </div>
            )
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-dark-secondary border-t border-dark mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-secondary">
              © 2025 LeetCode Coach • Powered by Gemini AI & MongoDB
            </div>
            <div className="flex items-center gap-4 text-sm text-dark-muted">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Local-first • Privacy-focused
              </span>
              {performance && (
                <span className="text-green-400">
                  {performance.totalRevisionSessions} sessions completed
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
