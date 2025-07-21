import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`
});

// Questions API
export const questionApi = {
  addQuestion: (query) => api.post('/questions/add', { query }),
  getAllQuestions: () => api.get('/questions')
};

// Revision Sessions API
export const revisionApi = {
  startSession: (duration, focusTopics, numberOfQuestions) => 
    api.post('/revision/start', { duration, focusTopics, numberOfQuestions }),
  
  getActiveSession: () => 
    api.get('/revision/active'),
  
  clearSession: () => 
    api.post('/revision/clear'),
  
  startQuestion: (sessionId, questionIndex) => 
    api.post(`/revision/${sessionId}/question/${questionIndex}/start`),
  
  completeQuestion: (sessionId, questionIndex) => 
    api.post(`/revision/${sessionId}/question/${questionIndex}/complete`),
  
  finishSession: (sessionId) => 
    api.post(`/revision/${sessionId}/finish`)
};

// Performance API
export const performanceApi = {
  getUserPerformance: () => 
    api.get('/performance')
};

// DSA Mentor API
export const mentorApi = {
  // Submit a learning request
  submitLearningRequest: (topic, difficulty, learningType, description) => 
    api.post('/mentor/request', { topic, difficulty, learningType, description }),
  
  // Get learning progress
  getLearningProgress: () => 
    api.get('/mentor/progress'),
  
  // Submit code for review
  submitCodeForReview: (sessionId, code, language) => 
    api.post('/mentor/submit-code', { sessionId, code, language }),
  
  // Get quiz for a topic
  getQuiz: (topic, difficulty) => 
    api.get(`/mentor/quiz/${topic}/${difficulty}`),
  
  // Generate quiz for a topic
  generateQuiz: (topic, difficulty, questionCount = 10) => 
    api.post('/mentor/generate-quiz', { topic, difficulty, questionCount }),
  
  // Submit quiz answers
  submitQuiz: (quizData) => 
    api.post('/mentor/submit-quiz', quizData),
  
  // Get learning path suggestions
  getLearningPathSuggestions: () => 
    api.get('/mentor/suggestions'),
  
  // Get learning history
  getLearningHistory: () => 
    api.get('/mentor/history')
};

export default api;
