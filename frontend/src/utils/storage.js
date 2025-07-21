import localforage from 'localforage';

// Initialize localforage
localforage.config({
  name: 'LeetCodeCoach',
  storeName: 'leetcode_data'
});

export const STORAGE_KEYS = {
  QUESTIONS: 'questions',
  ATTEMPTS: 'attempts',
  SETTINGS: 'settings'
};

// Question storage functions
export const saveQuestion = async (question) => {
  try {
    const questions = await getQuestions();
    const existingIndex = questions.findIndex(q => q.id === question.id);
    
    if (existingIndex >= 0) {
      questions[existingIndex] = { ...questions[existingIndex], ...question };
    } else {
      questions.push(question);
    }
    
    await localforage.setItem(STORAGE_KEYS.QUESTIONS, questions);
    return questions;
  } catch (error) {
    console.error('Error saving question:', error);
    throw error;
  }
};

export const getQuestions = async () => {
  try {
    const questions = await localforage.getItem(STORAGE_KEYS.QUESTIONS);
    return questions || [];
  } catch (error) {
    console.error('Error getting questions:', error);
    return [];
  }
};

export const getQuestionById = async (id) => {
  try {
    const questions = await getQuestions();
    return questions.find(q => q.id === id);
  } catch (error) {
    console.error('Error getting question by ID:', error);
    return null;
  }
};

// Attempt storage functions
export const saveAttempt = async (attempt) => {
  try {
    const attempts = await getAttempts();
    const dateKey = attempt.date;
    
    if (!attempts[dateKey]) {
      attempts[dateKey] = [];
    }
    
    attempts[dateKey].push(attempt);
    await localforage.setItem(STORAGE_KEYS.ATTEMPTS, attempts);
    return attempts;
  } catch (error) {
    console.error('Error saving attempt:', error);
    throw error;
  }
};

export const getAttempts = async () => {
  try {
    const attempts = await localforage.getItem(STORAGE_KEYS.ATTEMPTS);
    return attempts || {};
  } catch (error) {
    console.error('Error getting attempts:', error);
    return {};
  }
};

export const getAttemptsByDateRange = async (startDate, endDate) => {
  try {
    const allAttempts = await getAttempts();
    const filteredAttempts = {};
    
    Object.keys(allAttempts).forEach(date => {
      if (date >= startDate && date <= endDate) {
        filteredAttempts[date] = allAttempts[date];
      }
    });
    
    return filteredAttempts;
  } catch (error) {
    console.error('Error getting attempts by date range:', error);
    return {};
  }
};

// Settings storage functions
export const saveSettings = async (settings) => {
  try {
    await localforage.setItem(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const getSettings = async () => {
  try {
    const settings = await localforage.getItem(STORAGE_KEYS.SETTINGS);
    return settings || {
      theme: 'light',
      notifications: true,
      dailyGoal: 3
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      theme: 'light',
      notifications: true,
      dailyGoal: 3
    };
  }
};

// Analytics functions
export const getPerformanceStats = async () => {
  try {
    const questions = await getQuestions();
    const attempts = await getAttempts();
    
    const totalAttempted = questions.filter(q => q.status).length;
    const totalCompleted = questions.filter(q => q.status === 'completed').length;
    const totalFailed = questions.filter(q => q.status === 'failed').length;
    
    // Calculate topic-wise stats
    const topicStats = {};
    questions.forEach(q => {
      if (q.topics && q.status) {
        q.topics.forEach(topic => {
          if (!topicStats[topic]) {
            topicStats[topic] = { total: 0, completed: 0, failed: 0 };
          }
          topicStats[topic].total++;
          if (q.status === 'completed') topicStats[topic].completed++;
          if (q.status === 'failed') topicStats[topic].failed++;
        });
      }
    });
    
    // Calculate daily stats
    const dailyStats = {};
    Object.entries(attempts).forEach(([date, dayAttempts]) => {
      dailyStats[date] = {
        total: dayAttempts.length,
        completed: dayAttempts.filter(a => a.status === 'completed').length,
        failed: dayAttempts.filter(a => a.status === 'failed').length,
        totalTime: dayAttempts.reduce((sum, a) => sum + (a.time_taken || 0), 0)
      };
    });
    
    return {
      overall: {
        totalAttempted,
        totalCompleted,
        totalFailed,
        completionRate: totalAttempted > 0 ? (totalCompleted / totalAttempted * 100).toFixed(1) : 0
      },
      topicStats,
      dailyStats
    };
  } catch (error) {
    console.error('Error calculating performance stats:', error);
    return {
      overall: { totalAttempted: 0, totalCompleted: 0, totalFailed: 0, completionRate: 0 },
      topicStats: {},
      dailyStats: {}
    };
  }
};

export const clearAllData = async () => {
  try {
    await localforage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
