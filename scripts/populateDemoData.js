const mongoose = require('mongoose');
const { Question, RevisionSession, UserPerformance } = require('../backend/models/schemas');
require('dotenv').config();

// Demo data for professional showcase
const demoQuestions = [
  {
    leetcodeId: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    revisionCount: 3,
    lastRevisedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    averageRevisionTime: 15
  },
  {
    leetcodeId: '136',
    title: 'Single Number',
    difficulty: 'Easy',
    topics: ['Array', 'Bit Manipulation'],
    leetcodeUrl: 'https://leetcode.com/problems/single-number/',
    description: 'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.',
    revisionCount: 2,
    lastRevisedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    averageRevisionTime: 12
  },
  {
    leetcodeId: '206',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topics: ['Linked List', 'Recursion'],
    leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    revisionCount: 4,
    lastRevisedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    averageRevisionTime: 18
  },
  {
    leetcodeId: '15',
    title: '3Sum',
    difficulty: 'Medium',
    topics: ['Array', 'Two Pointers', 'Sorting'],
    leetcodeUrl: 'https://leetcode.com/problems/3sum/',
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    revisionCount: 2,
    lastRevisedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    averageRevisionTime: 35
  },
  {
    leetcodeId: '104',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    topics: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
    leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    description: 'Given the root of a binary tree, return its maximum depth.',
    revisionCount: 3,
    lastRevisedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    averageRevisionTime: 14
  },
  {
    leetcodeId: '121',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topics: ['Array', 'Dynamic Programming'],
    leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.',
    revisionCount: 1,
    lastRevisedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    averageRevisionTime: 20
  },
  {
    leetcodeId: '704',
    title: 'Binary Search',
    difficulty: 'Easy',
    topics: ['Array', 'Binary Search'],
    leetcodeUrl: 'https://leetcode.com/problems/binary-search/',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.',
    revisionCount: 5,
    lastRevisedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    averageRevisionTime: 10
  },
  {
    leetcodeId: '198',
    title: 'House Robber',
    difficulty: 'Medium',
    topics: ['Array', 'Dynamic Programming'],
    leetcodeUrl: 'https://leetcode.com/problems/house-robber/',
    description: 'You are a professional robber planning to rob houses along a street.',
    revisionCount: 2,
    lastRevisedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    averageRevisionTime: 25
  },
  {
    leetcodeId: '322',
    title: 'Coin Change',
    difficulty: 'Medium',
    topics: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
    leetcodeUrl: 'https://leetcode.com/problems/coin-change/',
    description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.',
    revisionCount: 1,
    lastRevisedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    averageRevisionTime: 40
  },
  {
    leetcodeId: '1865',
    title: 'Finding Pairs With a Certain Sum',
    difficulty: 'Medium',
    topics: ['Array', 'Hash Table', 'Design'],
    leetcodeUrl: 'https://leetcode.com/problems/finding-pairs-with-a-certain-sum/',
    description: 'You are given two integer arrays nums1 and nums2. You are tasked to implement a data structure that supports queries of two types.',
    revisionCount: 0,
    lastRevisedAt: null,
    averageRevisionTime: 0
  }
];

// Demo performance data
const demoUserPerformance = {
  userId: 'demo-user',
  overallStats: {
    totalQuestionsAttempted: 25,
    totalQuestionsCompleted: 20,
    totalTopicsStarted: 8,
    totalTopicsCompleted: 3,
    averageRevisionTime: 22,
    lastActiveDate: new Date()
  },
  topicPerformance: [
    {
      topic: 'Array',
      questionsAttempted: 8,
      questionsCompleted: 7,
      averageTime: 18,
      weaknessScore: 25,
      lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      topic: 'Hash Table',
      questionsAttempted: 4,
      questionsCompleted: 3,
      averageTime: 22,
      weaknessScore: 35,
      lastPracticed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      topic: 'Linked List',
      questionsAttempted: 3,
      questionsCompleted: 3,
      averageTime: 16,
      weaknessScore: 15,
      lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      topic: 'Dynamic Programming',
      questionsAttempted: 5,
      questionsCompleted: 2,
      averageTime: 45,
      weaknessScore: 75,
      lastPracticed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      topic: 'Binary Search',
      questionsAttempted: 2,
      questionsCompleted: 2,
      averageTime: 12,
      weaknessScore: 10,
      lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      topic: 'Tree',
      questionsAttempted: 3,
      questionsCompleted: 3,
      averageTime: 20,
      weaknessScore: 20,
      lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ],
  difficultyPerformance: [
    {
      difficulty: 'Easy',
      questionsAttempted: 15,
      questionsCompleted: 13,
      averageTime: 15,
      completionRate: 87
    },
    {
      difficulty: 'Medium',
      questionsAttempted: 8,
      questionsCompleted: 5,
      averageTime: 35,
      completionRate: 63
    },
    {
      difficulty: 'Hard',
      questionsAttempted: 2,
      questionsCompleted: 2,
      averageTime: 50,
      completionRate: 100
    }
  ],
  learningPatterns: {
    strugglingTopics: ['Dynamic Programming', 'Hash Table'],
    preferredTopics: ['Binary Search', 'Linked List'],
    optimalSessionDuration: 45,
    bestPerformanceTime: '14:00-16:00',
    consistencyScore: 78
  },
  preferences: {
    learningStyle: 'concept_first',
    programmingLanguage: 'Java',
    difficultyPreference: 'progressive',
    sessionLength: 60
  }
};

async function populateDemoData() {
  try {
    console.log('🚀 Starting demo data population...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing demo data (be careful in production!)
    if (process.env.NODE_ENV !== 'production') {
      await Question.deleteMany({});
      await UserPerformance.deleteMany({});
      await RevisionSession.deleteMany({});
      console.log('🧹 Cleared existing data');
    }
    
    // Insert demo questions
    await Question.insertMany(demoQuestions);
    console.log(`📚 Added ${demoQuestions.length} demo questions`);
    
    // Insert demo performance data
    await UserPerformance.create(demoUserPerformance);
    console.log('📊 Added demo performance data');
    
    // Create a demo revision session
    const demoSession = new RevisionSession({
      sessionId: 'demo-session-' + Date.now(),
      questions: demoQuestions.slice(0, 3).map(q => ({
        questionId: q._id,
        allocatedTime: q.difficulty === 'Easy' ? 20 : q.difficulty === 'Medium' ? 30 : 45,
        completed: Math.random() > 0.3,
        startedAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
        actualTime: Math.floor(Math.random() * 30) + 10
      })),
      totalAllocatedTime: 90,
      totalActualTime: 65,
      questionsCompleted: 2,
      sessionStatus: 'completed',
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      performance: {
        completionRate: 67,
        averageTimePerQuestion: 32,
        topicsAttempted: ['Array', 'Hash Table', 'Linked List']
      }
    });
    
    await demoSession.save();
    console.log('⏱️ Added demo revision session');
    
    console.log('\n🎉 Demo data population completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${demoQuestions.length} Questions added`);
    console.log(`   • 1 User performance profile created`);
    console.log(`   • 1 Revision session created`);
    console.log(`   • Topics covered: Arrays, Hash Tables, Linked Lists, Trees, Dynamic Programming`);
    console.log(`   • Difficulties: Easy (6), Medium (4), showcasing progression`);
    
    console.log('\n🎯 Perfect for recruiters to see:');
    console.log('   • Question addition functionality (try adding "23" or "Merge k Sorted Lists")');
    console.log('   • AI mentor interaction (ask about "HashMap" or "Binary Search")');
    console.log('   • Performance analytics with realistic data');
    console.log('   • Quiz generation across multiple topics');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating demo data:', error);
    process.exit(1);
  }
}

// Add to package.json scripts: "demo": "node scripts/populateDemoData.js"
if (require.main === module) {
  populateDemoData();
}

module.exports = { populateDemoData, demoQuestions, demoUserPerformance };
