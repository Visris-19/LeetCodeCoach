import { useState, useEffect } from 'react';
import { Play, Pause, Clock, Target, ExternalLink, CheckCircle, SkipForward, Home, RefreshCw } from 'lucide-react';
import { revisionApi } from '../utils/api';

const RevisionSession = ({ session, onQuestionStart, onQuestionComplete, onSessionFinish, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [isQuestionActive, setIsQuestionActive] = useState(false);

  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + (currentQuestion?.completed ? 1 : 0)) / session.questions.length) * 100;

  // Session timer effect
  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Question timer effect
  useEffect(() => {
    let interval;
    if (isQuestionActive) {
      interval = setInterval(() => {
        setQuestionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQuestionActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuestion = async () => {
    try {
      await onQuestionStart(session.sessionId, currentQuestionIndex);
      setIsQuestionActive(true);
      setQuestionTimer(0);
    } catch (error) {
      console.error('Failed to start question:', error);
    }
  };

  const handleCompleteQuestion = async () => {
    try {
      await onQuestionComplete(session.sessionId, currentQuestionIndex);
      setIsQuestionActive(false);
      
      // Move to next question or finish session
      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setQuestionTimer(0);
      } else {
        // All questions completed
        handleFinishSession();
      }
    } catch (error) {
      console.error('Failed to complete question:', error);
    }
  };

  const handleSkipQuestion = () => {
    setIsQuestionActive(false);
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionTimer(0);
    } else {
      handleFinishSession();
    }
  };

  const handleFinishSession = async () => {
    try {
      setIsSessionActive(false);
      setIsQuestionActive(false);
      await onSessionFinish(session.sessionId);
    } catch (error) {
      console.error('Failed to finish session:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-900/30 border-green-800';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
      case 'Hard': return 'text-red-400 bg-red-900/30 border-red-800';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-800';
    }
  };
  const handleClearSession = async () => {
    try {
      await revisionApi.clearSession();
      onClose(); // This will trigger the parent to reload and go back to dashboard
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="bg-dark-secondary rounded-lg border border-dark p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-dark-primary mb-2">Session Complete!</h2>
        <p className="text-dark-secondary mb-6">Great job! All questions have been completed.</p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleClearSession}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 
                       transition-colors flex items-center gap-2 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Start New Session
          </button>
          
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 
                       transition-colors flex items-center gap-2 font-medium"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-secondary rounded-lg border border-dark overflow-hidden">
      {/* Session Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Revision Session Active</h2>
            <p className="text-blue-100">AI-powered personalized practice</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 ${isSessionActive ? 'timer-active' : ''}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(sessionTimer)}</span>
            </div>
            
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-2 mb-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-blue-100">
          <span>Question {currentQuestionIndex + 1} of {session.questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Current Question */}
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Question Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm text-dark-muted">#{currentQuestion.questionId.leetcodeId}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(currentQuestion.questionId.difficulty)}`}>
                {currentQuestion.questionId.difficulty}
              </span>
              <span className="text-dark-muted text-sm">
                Allocated: {currentQuestion.allocatedTime} min
              </span>
            </div>

            <h3 className="text-xl font-bold text-dark-primary mb-3">
              {currentQuestion.questionId.title}
            </h3>

            {currentQuestion.questionId.description && (
              <p className="text-dark-secondary mb-4 leading-relaxed">
                {currentQuestion.questionId.description}
              </p>
            )}

            {currentQuestion.questionId.topics && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentQuestion.questionId.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-sm border border-blue-800"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <a
                href={currentQuestion.questionId.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 
                           transition-colors flex items-center gap-2 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Solve on LeetCode
              </a>

              {!currentQuestion.startedAt ? (
                <button
                  onClick={handleStartQuestion}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 
                             transition-colors flex items-center gap-2 font-medium"
                >
                  <Play className="w-4 h-4" />
                  Start Timer
                </button>
              ) : !currentQuestion.completed ? (
                <button
                  onClick={handleCompleteQuestion}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 
                             transition-colors flex items-center gap-2 font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Completed!</span>
                </div>
              )}

              <button
                onClick={handleSkipQuestion}
                className="text-dark-muted hover:text-dark-secondary transition-colors 
                           flex items-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </button>
            </div>
          </div>

          {/* Timer Panel */}
          <div className="bg-dark-tertiary rounded-lg p-4 min-w-[200px]">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-dark-primary mb-2">
                {formatTime(questionTimer)}
              </div>
              <div className="text-sm text-dark-secondary mb-4">
                {isQuestionActive ? 'Timer Running' : 'Timer Stopped'}
              </div>
              
              {currentQuestion.allocatedTime && (
                <div className="text-xs text-dark-muted">
                  Target: {currentQuestion.allocatedTime} min
                  {questionTimer > currentQuestion.allocatedTime * 60 && (
                    <div className="text-red-400 mt-1">
                      ⚠️ Over time limit
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Session Overview */}
            <div className="mt-6 pt-4 border-t border-dark">
              <h4 className="text-sm font-medium text-dark-primary mb-3">Session Progress</h4>
              <div className="space-y-2 text-xs">
                {session.questions.map((q, index) => (
                  <div key={index} className={`flex items-center gap-2 ${
                    index === currentQuestionIndex ? 'text-blue-400' : 
                    q.completed ? 'text-green-400' : 'text-dark-muted'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      index === currentQuestionIndex ? 'bg-blue-400' :
                      q.completed ? 'bg-green-400' : 'bg-dark-muted'
                    }`} />
                    <span className="truncate">Q{index + 1}</span>
                    {q.completed && <CheckCircle className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Session Controls */}
      <div className="bg-dark-tertiary border-t border-dark p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-dark-secondary">
            Questions completed: {session.questions.filter(q => q.completed).length} / {session.questions.length}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleClearSession}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 
                         transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Exit Session
            </button>
            
            <button
              onClick={handleFinishSession}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 
                         transition-colors text-sm font-medium"
            >
              End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionSession;
