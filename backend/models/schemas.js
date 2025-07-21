const mongoose = require('mongoose');

// Question Schema
const questionSchema = new mongoose.Schema({
  leetcodeId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  topics: [{
    type: String
  }],
  leetcodeUrl: {
    type: String,
    required: true
  },
  description: String,
  isCompleted: {
    type: Boolean,
    default: true // User adds only completed questions
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  lastRevisedAt: Date,
  revisionCount: {
    type: Number,
    default: 0
  },
  averageRevisionTime: {
    type: Number,
    default: 0
  }
});

// Revision Session Schema
const revisionSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    allocatedTime: Number, // in minutes
    actualTime: Number, // in minutes
    completed: {
      type: Boolean,
      default: false
    },
    startedAt: Date,
    completedAt: Date
  }],
  totalAllocatedTime: Number,
  totalActualTime: Number,
  questionsCompleted: {
    type: Number,
    default: 0
  },
  sessionStatus: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  performance: {
    completionRate: Number,
    averageTimePerQuestion: Number,
    topicsAttempted: [String],
    weakTopics: [String]
  }
});

// User Performance Schema
const userPerformanceSchema = new mongoose.Schema({
  totalQuestionsAdded: {
    type: Number,
    default: 0
  },
  totalRevisionSessions: {
    type: Number,
    default: 0
  },
  totalRevisionTime: {
    type: Number,
    default: 0
  },
  averageSessionCompletion: {
    type: Number,
    default: 0
  },
  topicPerformance: [{
    topic: String,
    questionsAttempted: Number,
    questionsCompleted: Number,
    averageTime: Number,
    lastAttempted: Date,
    weaknessScore: Number // 0-100, higher means weaker
  }],
  difficultyPerformance: [{
    difficulty: String,
    questionsAttempted: Number,
    questionsCompleted: Number,
    averageTime: Number,
    completionRate: Number
  }],
  learningPatterns: {
    preferredTopics: [String],
    strugglingTopics: [String],
    optimalSessionDuration: Number,
    bestPerformanceTime: String, // time of day
    revisionFrequency: Number // days between revisions
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// AI Suggestions Schema
const aiSuggestionSchema = new mongoose.Schema({
  userId: String, // For future multi-user support
  suggestionType: {
    type: String,
    enum: ['revision_questions', 'focus_topics', 'session_plan', 'weakness_analysis']
  },
  suggestions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    priority: {
      type: Number,
      min: 1,
      max: 10
    },
    reason: String,
    estimatedTime: Number
  }],
  basedOnPerformance: {
    sessionIds: [String],
    weakTopics: [String],
    recentActivity: Object
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // 7 days
  }
});

// ================================
// DSA MENTOR SCHEMAS
// ================================

// Learning Request Schema - Track what users want to learn
const learningRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'default'
  },
  requestText: {
    type: String,
    required: true // e.g., "I want to learn HashMap in Java"
  },
  extractedTopic: String, // AI-extracted topic: "HashMap"
  extractedLanguage: {
    type: String,
    default: 'Java'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Learning Session Schema - Individual learning sessions
const learningSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'default'
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningRequest'
  },
  topic: String, // "HashMap", "ArrayList", "Binary Search"
  sessionType: {
    type: String,
    enum: ['concept', 'practice', 'quiz', 'assessment'],
    default: 'concept'
  },
  content: {
    explanation: String, // AI-generated explanation
    codeExamples: [String], // Code examples
    keyPoints: [String], // Important points to remember
    practiceProblems: [{
      title: String,
      description: String,
      starterCode: String,
      testCases: [{
        input: String,
        expectedOutput: String,
        explanation: String
      }],
      hints: [String]
    }]
  },
  userInteractions: [{
    type: {
      type: String,
      enum: ['question', 'code_submission', 'quiz_answer']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    aiResponse: String
  }],
  sessionDuration: Number, // in minutes
  isCompleted: {
    type: Boolean,
    default: false
  },
  userRating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// User Learning Progress Schema - Track overall progress
const learningProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'default'
  },
  topicProgress: [{
    topic: String, // "HashMap", "ArrayList", etc.
    category: String, // "Java Collections", "Data Structures", "Algorithms"
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    sessionsCompleted: {
      type: Number,
      default: 0
    },
    conceptsLearned: [String],
    problemsSolved: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0 // total minutes spent
    },
    lastStudied: Date,
    masteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  overallStats: {
    totalTopicsStarted: {
      type: Number,
      default: 0
    },
    totalTopicsCompleted: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  },
  preferences: {
    learningStyle: {
      type: String,
      enum: ['visual', 'practical', 'theoretical', 'mixed'],
      default: 'mixed'
    },
    difficulty: {
      type: String,
      enum: ['slow', 'normal', 'fast'],
      default: 'normal'
    },
    favoriteTopics: [String]
  },
  achievements: [{
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Generated Content Schema - Store AI-generated content for reuse
const generatedContentSchema = new mongoose.Schema({
  topic: String,
  difficulty: String,
  contentType: {
    type: String,
    enum: ['explanation', 'example', 'problem', 'quiz']
  },
  content: {
    title: String,
    description: String,
    code: String,
    explanation: String,
    testCases: [{
      input: String,
      output: String
    }]
  },
  quality: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  usageCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Question = mongoose.model('Question', questionSchema);
const RevisionSession = mongoose.model('RevisionSession', revisionSessionSchema);
const UserPerformance = mongoose.model('UserPerformance', userPerformanceSchema);
const AISuggestion = mongoose.model('AISuggestion', aiSuggestionSchema);
const LearningRequest = mongoose.model('LearningRequest', learningRequestSchema);
const LearningSession = mongoose.model('LearningSession', learningSessionSchema);
const LearningProgress = mongoose.model('LearningProgress', learningProgressSchema);
const GeneratedContent = mongoose.model('GeneratedContent', generatedContentSchema);

module.exports = {
  Question,
  RevisionSession,
  UserPerformance,
  AISuggestion,
  LearningRequest,
  LearningSession,
  LearningProgress,
  GeneratedContent
};
