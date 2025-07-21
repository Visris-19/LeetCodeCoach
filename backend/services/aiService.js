const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize with fallback API key (same as test script)
const API_KEY = process.env.GEMINI_API_KEY;
// console.log('AI Service initialized with API key:', API_KEY ? `${API_KEY.substring(0, 20)}...` : 'Not found');
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Rate limiting and retry configuration
const API_DELAY = 1000; // 1 second delay between API calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

// Queue for processing requests sequentially
let requestQueue = [];
let isProcessing = false;

class AIService {
  // Helper function to add delay
  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry wrapper for API calls
  static async retryWithBackoff(apiCall, maxRetries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        console.error(`API attempt ${attempt} failed:`, error.message);
        
        // Check if it's a rate limit error (503, 429, or quota exceeded)
        const isRateLimited = error.message?.includes('503') || 
                             error.message?.includes('429') || 
                             error.message?.includes('quota') ||
                             error.message?.includes('rate limit');

        if (isRateLimited && attempt < maxRetries) {
          const backoffDelay = RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Rate limited. Retrying in ${backoffDelay}ms...`);
          await this.delay(backoffDelay);
          continue;
        }
        
        // If not rate limited or max retries reached, throw the error
        throw error;
      }
    }
  }

  // Process requests sequentially to avoid overwhelming the API
  static async processWithQueue(requestFn) {
    return new Promise((resolve, reject) => {
      requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  static async processQueue() {
    if (isProcessing || requestQueue.length === 0) return;
    
    isProcessing = true;
    
    while (requestQueue.length > 0) {
      const { requestFn, resolve, reject } = requestQueue.shift();
      
      try {
        const result = await this.retryWithBackoff(requestFn);
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Add delay between requests to respect rate limits
      if (requestQueue.length > 0) {
        await this.delay(API_DELAY);
      }
    }
    
    isProcessing = false;
  }

  // Enhanced fetch question details with fallback data
  static async fetchQuestionDetails(query) {
    // For number queries, try fallback first, then AI
    const cleanQuery = query.toLowerCase().replace(/^lc/, '').trim();
    const isNumberQuery = /^\d+$/.test(cleanQuery);
    
    if (isNumberQuery) {
      // For pure number queries, try fallback first
      const fallbackResult = this.getFallbackQuestionData(query);
      if (fallbackResult.found) {
        console.log(`Using fallback data for number query: ${query}`);
        return fallbackResult;
      }
    }
    
    // Try AI first, with fallback to static data
    try {
      return await this.processWithQueue(async () => {
        return await this.fetchFromAI(query);
      });
    } catch (error) {
      console.error('AI fetch failed, trying fallback:', error.message);
      return this.getFallbackQuestionData(query);
    }
  }

  // Original AI fetch method
  static async fetchFromAI(query) {
    console.log(`Fetching question details from AI for query: ${query}`);
    const prompt = `
You are a LeetCode expert assistant. Your job is to identify the correct LeetCode problem from a user query and return structured information.

The user query can be:
- A number (e.g., "1", "15", "206", "704") — treat this as a LeetCode problem number.
- A full or partial title (e.g., "Two Sum", "Reverse Linked List", "Binary Search").
- A format like "LC1", "LC15" — treat the number part as the LeetCode problem number.

Your task:
1. Identify the exact LeetCode problem.
2. Return a JSON response **strictly** in the following format:

If the problem is found:
{
  "found": true,
  "leetcodeId": "1",
  "title": "Two Sum",
  "difficulty": "Easy",
  "topics": ["Array", "Hash Table"],
  "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
}

If the problem is NOT found:
{
  "found": false,
  "error": "Question not found"
}

⚠️ Important Rules:
- Use **exact LeetCode URL format**: https://leetcode.com/problems/problem-slug/
- "leetcodeId" must be just the number as a string (e.g., "1", not "LC1")
- "difficulty" must be one of: "Easy", "Medium", or "Hard"
- "topics" must be an array of topic strings
- "description" should be a brief summary of the problem

Be precise. Do not return any extra explanation or formatting — only the JSON response.
Query: "${query}"
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  }

  // Fallback question data for when AI is unavailable
  static getFallbackQuestionData(query) {
    const fallbackQuestions = {
      '1': { leetcodeId: '1', title: 'Two Sum', difficulty: 'Easy', topics: ['Array', 'Hash Table'], leetcodeUrl: 'https://leetcode.com/problems/two-sum/', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.' },
      '2': { leetcodeId: '2', title: 'Add Two Numbers', difficulty: 'Medium', topics: ['Linked List', 'Math', 'Recursion'], leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/', description: 'You are given two non-empty linked lists representing two non-negative integers.' },
      '3': { leetcodeId: '3', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topics: ['Hash Table', 'String', 'Sliding Window'], leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', description: 'Given a string s, find the length of the longest substring without repeating characters.' },
      '4': { leetcodeId: '4', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topics: ['Array', 'Binary Search', 'Divide and Conquer'], leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.' },
      '5': { leetcodeId: '5', title: 'Longest Palindromic Substring', difficulty: 'Medium', topics: ['String', 'Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', description: 'Given a string s, return the longest palindromic substring in s.' },
      '6': { leetcodeId: '6', title: 'Zigzag Conversion', difficulty: 'Medium', topics: ['String'], leetcodeUrl: 'https://leetcode.com/problems/zigzag-conversion/', description: 'The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows.' },
      '7': { leetcodeId: '7', title: 'Reverse Integer', difficulty: 'Medium', topics: ['Math'], leetcodeUrl: 'https://leetcode.com/problems/reverse-integer/', description: 'Given a signed 32-bit integer x, return x with its digits reversed.' },
      '8': { leetcodeId: '8', title: 'String to Integer (atoi)', difficulty: 'Medium', topics: ['String'], leetcodeUrl: 'https://leetcode.com/problems/string-to-integer-atoi/', description: 'Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.' },
      '9': { leetcodeId: '9', title: 'Palindrome Number', difficulty: 'Easy', topics: ['Math'], leetcodeUrl: 'https://leetcode.com/problems/palindrome-number/', description: 'Given an integer x, return true if x is palindrome integer.' },
      '10': { leetcodeId: '10', title: 'Regular Expression Matching', difficulty: 'Hard', topics: ['String', 'Dynamic Programming', 'Recursion'], leetcodeUrl: 'https://leetcode.com/problems/regular-expression-matching/', description: 'Given an input string s and a pattern p, implement regular expression matching with support for . and *.' },
      '11': { leetcodeId: '11', title: 'Container With Most Water', difficulty: 'Medium', topics: ['Array', 'Two Pointers', 'Greedy'], leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/', description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).' },
      '12': { leetcodeId: '12', title: 'Integer to Roman', difficulty: 'Medium', topics: ['Hash Table', 'Math', 'String'], leetcodeUrl: 'https://leetcode.com/problems/integer-to-roman/', description: 'Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M.' },
      '13': { leetcodeId: '13', title: 'Roman to Integer', difficulty: 'Easy', topics: ['Hash Table', 'Math', 'String'], leetcodeUrl: 'https://leetcode.com/problems/roman-to-integer/', description: 'Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M.' },
      '14': { leetcodeId: '14', title: 'Longest Common Prefix', difficulty: 'Easy', topics: ['String'], leetcodeUrl: 'https://leetcode.com/problems/longest-common-prefix/', description: 'Write a function to find the longest common prefix string amongst an array of strings.' },
      '15': { leetcodeId: '15', title: '3Sum', difficulty: 'Medium', topics: ['Array', 'Two Pointers', 'Sorting'], leetcodeUrl: 'https://leetcode.com/problems/3sum/', description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.' },
      '16': { leetcodeId: '16', title: '3Sum Closest', difficulty: 'Medium', topics: ['Array', 'Two Pointers', 'Sorting'], leetcodeUrl: 'https://leetcode.com/problems/3sum-closest/', description: 'Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target.' },
      '17': { leetcodeId: '17', title: 'Letter Combinations of a Phone Number', difficulty: 'Medium', topics: ['Hash Table', 'String', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', description: 'Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.' },
      '18': { leetcodeId: '18', title: '4Sum', difficulty: 'Medium', topics: ['Array', 'Two Pointers', 'Sorting'], leetcodeUrl: 'https://leetcode.com/problems/4sum/', description: 'Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that a != b != c != d and nums[a] + nums[b] + nums[c] + nums[d] == target.' },
      '19': { leetcodeId: '19', title: 'Remove Nth Node From End of List', difficulty: 'Medium', topics: ['Linked List', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', description: 'Given the head of a linked list, remove the nth node from the end of the list and return its head.' },
      '20': { leetcodeId: '20', title: 'Valid Parentheses', difficulty: 'Easy', topics: ['String', 'Stack'], leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/', description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.' },
      '21': { leetcodeId: '21', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topics: ['Linked List', 'Recursion'], leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', description: 'You are given the heads of two sorted linked lists list1 and list2.' },
      '22': { leetcodeId: '22', title: 'Generate Parentheses', difficulty: 'Medium', topics: ['String', 'Dynamic Programming', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/generate-parentheses/', description: 'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.' },
      '23': { leetcodeId: '23', title: 'Merge k Sorted Lists', difficulty: 'Hard', topics: ['Linked List', 'Divide and Conquer', 'Heap (Priority Queue)', 'Merge Sort'], leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.' },
      '24': { leetcodeId: '24', title: 'Swap Nodes in Pairs', difficulty: 'Medium', topics: ['Linked List', 'Recursion'], leetcodeUrl: 'https://leetcode.com/problems/swap-nodes-in-pairs/', description: 'Given a linked list, swap every two adjacent nodes and return its head.' },
      '25': { leetcodeId: '25', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', topics: ['Linked List', 'Recursion'], leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', description: 'Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.' },
      '26': { leetcodeId: '26', title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', description: 'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once.' },
      '27': { leetcodeId: '27', title: 'Remove Element', difficulty: 'Easy', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/remove-element/', description: 'Given an integer array nums and an integer val, remove all occurrences of val in nums in-place.' },
      '28': { leetcodeId: '28', title: 'Find the Index of the First Occurrence in a String', difficulty: 'Easy', topics: ['Two Pointers', 'String', 'String Matching'], leetcodeUrl: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/', description: 'Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.' },
      '29': { leetcodeId: '29', title: 'Divide Two Integers', difficulty: 'Medium', topics: ['Math', 'Bit Manipulation'], leetcodeUrl: 'https://leetcode.com/problems/divide-two-integers/', description: 'Given two integers dividend and divisor, divide two integers without using multiplication, division, and mod operator.' },
      '30': { leetcodeId: '30', title: 'Substring with Concatenation of All Words', difficulty: 'Hard', topics: ['Hash Table', 'String', 'Sliding Window'], leetcodeUrl: 'https://leetcode.com/problems/substring-with-concatenation-of-all-words/', description: 'You are given a string s and an array of strings words. All the strings of words are of the same length.' },
      '70': { leetcodeId: '70', title: 'Climbing Stairs', difficulty: 'Easy', topics: ['Math', 'Dynamic Programming', 'Memoization'], leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/', description: 'You are climbing a staircase. It takes n steps to reach the top.' },
      '104': { leetcodeId: '104', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topics: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'], leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', description: 'Given the root of a binary tree, return its maximum depth.' },
      '121': { leetcodeId: '121', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topics: ['Array', 'Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.' },
      '136': { leetcodeId: '136', title: 'Single Number', difficulty: 'Easy', topics: ['Array', 'Bit Manipulation'], leetcodeUrl: 'https://leetcode.com/problems/single-number/', description: 'Given a non-empty array of integers nums, every element appears twice except for one.' },
      '198': { leetcodeId: '198', title: 'House Robber', difficulty: 'Medium', topics: ['Array', 'Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/house-robber/', description: 'You are a professional robber planning to rob houses along a street.' },
      '206': { leetcodeId: '206', title: 'Reverse Linked List', difficulty: 'Easy', topics: ['Linked List', 'Recursion'], leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.' },
      '322': { leetcodeId: '322', title: 'Coin Change', difficulty: 'Medium', topics: ['Array', 'Dynamic Programming', 'Breadth-First Search'], leetcodeUrl: 'https://leetcode.com/problems/coin-change/', description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.' },
      '704': { leetcodeId: '704', title: 'Binary Search', difficulty: 'Easy', topics: ['Array', 'Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/binary-search/', description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.' }
    };

    // Clean query and try to match
    const cleanQuery = query.toLowerCase().replace(/^lc/, '').trim();
    
    // Try exact ID match first
    let questionData = fallbackQuestions[cleanQuery];
    
    // Try title match
    if (!questionData) {
      for (const [id, data] of Object.entries(fallbackQuestions)) {
        if (data.title.toLowerCase().includes(cleanQuery) || cleanQuery.includes(data.title.toLowerCase())) {
          questionData = data;
          break;
        }
      }
    }

    if (questionData) {
      return {
        found: true,
        ...questionData
      };
    }

    return {
      found: false,
      error: `Question "${query}" not found. AI temporarily unavailable, using fallback data.`
    };
  }

  // Generate revision questions based on user performance
  static async generateRevisionPlan(userPerformance, sessionDuration = 60) {
    const { topicPerformance, difficultyPerformance, learningPatterns } = userPerformance;
    
    const prompt = `
      Based on this user's LeetCode performance data, generate a smart revision plan:
      
      Topic Performance:
      ${topicPerformance.map(tp => 
        `- ${tp.topic}: ${tp.questionsCompleted}/${tp.questionsAttempted} completed (${tp.averageTime}min avg), weakness: ${tp.weaknessScore}/100`
      ).join('\n')}
      
      Difficulty Performance:
      ${difficultyPerformance.map(dp =>
        `- ${dp.difficulty}: ${dp.completionRate}% completion rate, ${dp.averageTime}min average`
      ).join('\n')}
      
      Learning Patterns:
      - Struggling topics: ${learningPatterns.strugglingTopics?.join(', ') || 'None identified'}
      - Preferred topics: ${learningPatterns.preferredTopics?.join(', ') || 'None identified'}
      - Optimal session duration: ${learningPatterns.optimalSessionDuration || 60} minutes
      
      Session Duration: ${sessionDuration} minutes
      
      Generate a revision plan that:
      1. Focuses on weak topics (high weakness score)
      2. Balances difficulty levels
      3. Fits within the time limit
      4. Prioritizes questions for maximum learning impact
      
      Return ONLY a JSON object:
      {
        "plan": {
          "totalQuestions": 4,
          "estimatedDuration": 55,
          "focusAreas": ["Arrays", "Hash Tables"],
          "questions": [
            {
              "priority": 10,
              "recommendedTime": 15,
              "reason": "High weakness score in Arrays topic",
              "difficulty": "Medium",
              "topics": ["Array", "Two Pointers"]
            }
          ]
        },
        "strategy": "Focus on weak areas while building confidence",
        "tips": [
          "Start with easier problems to build momentum",
          "Pay attention to patterns in array problems"
        ]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('AI Error generating revision plan:', error);
      return {
        plan: {
          totalQuestions: 3,
          estimatedDuration: sessionDuration,
          focusAreas: ["General Practice"],
          questions: []
        },
        strategy: "Continue practicing regularly",
        tips: ["Focus on understanding problem patterns"]
      };
    }
  }

  // Analyze performance and update weakness scores
  static async analyzePerformance(sessionData, currentPerformance) {
    const prompt = `
      Analyze this LeetCode revision session and provide insights:
      
      Session Data:
      - Questions completed: ${sessionData.questionsCompleted}/${sessionData.questions.length}
      - Total time: ${sessionData.totalActualTime} minutes
      - Topics attempted: ${sessionData.performance?.topicsAttempted?.join(', ') || 'Various'}
      
      Performance per question:
      ${sessionData.questions.map((q, i) => 
        `${i+1}. ${q.completed ? 'Completed' : 'Incomplete'} in ${q.actualTime || 0}/${q.allocatedTime} minutes`
      ).join('\n')}
      
      Current Performance Data:
      ${currentPerformance.topicPerformance.map(tp => 
        `- ${tp.topic}: ${tp.weaknessScore}/100 weakness score`
      ).join('\n')}
      
      Provide analysis for:
      1. Updated weakness scores for each topic (0-100, higher = weaker)
      2. Learning patterns identified
      3. Recommendations for improvement
      4. Suggested focus areas
      
      Return ONLY a JSON object:
      {
        "topicUpdates": [
          {
            "topic": "Array",
            "newWeaknessScore": 45,
            "reasoning": "Improved performance, reduced from previous sessions"
          }
        ],
        "learningPatterns": {
          "improvingAreas": ["Hash Tables"],
          "strugglingAreas": ["Dynamic Programming"],
          "timeManagement": "good|needs_improvement|poor",
          "consistencyScore": 75
        },
        "recommendations": [
          "Focus more on time management",
          "Practice more DP problems"
        ],
        "nextSessionSuggestions": {
          "duration": 45,
          "focusTopics": ["Dynamic Programming", "Recursion"],
          "difficulty": "Medium"
        }
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('AI Error analyzing performance:', error);
      return {
        topicUpdates: [],
        learningPatterns: {
          improvingAreas: [],
          strugglingAreas: [],
          timeManagement: "needs_improvement",
          consistencyScore: 50
        },
        recommendations: ["Continue practicing regularly"],
        nextSessionSuggestions: {
          duration: 60,
          focusTopics: ["General Practice"],
          difficulty: "Medium"
        }
      };
    }
  }

  // Get smart question suggestions based on learning patterns
  static async getSmartSuggestions(userPerformance, availableQuestions) {
    const weakTopics = userPerformance.topicPerformance
      .filter(tp => tp.weaknessScore > 60)
      .map(tp => tp.topic);

    const prompt = `
      Given these available LeetCode questions and user performance data, suggest the most beneficial questions for revision:
      
      User's Weak Topics: ${weakTopics.join(', ') || 'None identified'}
      
      Available Questions:
      ${availableQuestions.map(q => 
        `${q.leetcodeId}. ${q.title} (${q.difficulty}) - Topics: ${q.topics.join(', ')} - Last revised: ${q.lastRevisedAt ? 'Yes' : 'Never'}`
      ).join('\n')}
      
      Recent Performance:
      ${userPerformance.topicPerformance.map(tp => 
        `- ${tp.topic}: ${tp.questionsCompleted}/${tp.questionsAttempted} completed, weakness: ${tp.weaknessScore}/100`
      ).join('\n')}
      
      Select 3-5 questions that would be most beneficial for the user's growth, prioritizing:
      1. Questions covering weak topics
      2. Questions not revised recently
      3. Appropriate difficulty progression
      4. Diverse topic coverage
      
      Return ONLY a JSON array:
      [
        {
          "leetcodeId": "1",
          "priority": 10,
          "reason": "Covers weak Array topic, fundamental problem",
          "estimatedTime": 20,
          "benefits": ["Strengthens Array skills", "Hash Table practice"]
        }
      ]
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('AI Error getting suggestions:', error);
      return [];
    }
  }

  // ================================
  // DSA MENTOR AI METHODS
  // ================================

  // Process learning request and extract topic/difficulty
  static async processLearningRequest(requestText) {
    const prompt = `
      Analyze this learning request and extract key information:
      "${requestText}"
      
      Extract:
      1. Main topic/concept they want to learn
      2. Programming language (if mentioned, default to Java)
      3. Their apparent skill level (Beginner/Intermediate/Advanced)
      4. Learning style preference (concept/practice/both)
      
      Return ONLY a JSON object:
      {
        "topic": "HashMap",
        "language": "Java",
        "difficulty": "Beginner",
        "learningStyle": "concept",
        "keywords": ["key-value", "data structure"],
        "isValid": true
      }
      
      For invalid/unclear requests, set isValid to false.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('AI Error processing learning request:', error);
      return {
        topic: "General Programming",
        language: "Java",
        difficulty: "Beginner",
        learningStyle: "concept",
        keywords: [],
        isValid: false
      };
    }
  }

  // Generate comprehensive learning content
  static async generateLearningContent(topic, difficulty, language = 'Java') {
    const prompt = `
      Create a comprehensive learning session for:
      Topic: ${topic}
      Difficulty: ${difficulty}
      Language: ${language}
      
      Generate content with this structure:
      1. Clear explanation of the concept
      2. Key points to remember
      3. Code examples with comments
      4. 2-3 practice problems with test cases
      5. Common mistakes to avoid
      
      Return ONLY a JSON object:
      {
        "explanation": "Detailed explanation of ${topic}...",
        "keyPoints": [
          "Point 1",
          "Point 2"
        ],
        "codeExamples": [
          "// Example 1\\nHashMap<String, Integer> map = new HashMap<>();"
        ],
        "practiceProblems": [
          {
            "title": "Count Character Frequency",
            "description": "Write a program to count frequency of characters in a string using HashMap",
            "starterCode": "public class Solution {\\n    public HashMap<Character, Integer> countFrequency(String str) {\\n        // Your code here\\n    }\\n}",
            "testCases": [
              {
                "input": "hello",
                "expectedOutput": "{h=1, e=1, l=2, o=1}",
                "explanation": "Each character appears with its frequency"
              }
            ],
            "hints": [
              "Use HashMap.put() and HashMap.getOrDefault()",
              "Iterate through each character in the string"
            ]
          }
        ],
        "commonMistakes": [
          "Forgetting to handle null keys",
          "Not understanding time complexity"
        ],
        "nextTopics": ["TreeMap", "LinkedHashMap"]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('AI Error generating learning content:', error);
      return this.getFallbackLearningContent(topic, difficulty);
    }
  }

  // Review user's code submission
  static async reviewCode(userCode, problemContext) {
    const prompt = `
      Review this code submission:
      
      Problem: ${problemContext.title}
      Description: ${problemContext.description}
      
      User's Code:
      ${userCode}
      
      Provide feedback on:
      1. Correctness (does it solve the problem?)
      2. Code quality (style, readability)
      3. Efficiency (time/space complexity)
      4. Suggestions for improvement
      5. Next learning steps
      
      Return ONLY a JSON object:
      {
        "isCorrect": true,
        "score": 85,
        "feedback": {
          "positive": ["Good use of HashMap", "Clean code structure"],
          "improvements": ["Consider edge cases", "Add comments"],
          "codeQuality": "Good",
          "efficiency": "Optimal time complexity O(n)"
        },
        "suggestions": [
          "Try the TreeMap version for sorted output",
          "Practice with LinkedHashMap for insertion order"
        ],
        "nextStep": "intermediate",
        "encouragement": "Great job! You're understanding HashMap well."
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('AI Error reviewing code:', error);
      return {
        isCorrect: false,
        score: 50,
        feedback: {
          positive: ["You're making progress!"],
          improvements: ["Review the problem requirements"],
          codeQuality: "Needs improvement",
          efficiency: "Could be optimized"
        },
        suggestions: ["Practice more basic problems"],
        nextStep: "practice",
        encouragement: "Keep practicing, you'll get there!"
      };
    }
  }

  // Generate quiz questions for a topic
  static async generateQuiz(topic, difficulty, questionCount = 5) {
    const prompt = `
      Generate ${questionCount} quiz questions for:
      Topic: ${topic}
      Difficulty: ${difficulty}
      
      Mix of question types:
      - Multiple choice (concept understanding)
      - Code output prediction
      - True/false (common misconceptions)
      - Fill in the blanks (syntax)
      
      Return ONLY a JSON object:
      {
        "questions": [
          {
            "type": "multiple_choice",
            "question": "What is the time complexity of HashMap.get()?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correctAnswer": 0,
            "explanation": "HashMap uses hashing for O(1) average case lookup"
          },
          {
            "type": "code_output",
            "question": "What will this code print?",
            "code": "HashMap<String, Integer> map = new HashMap<>();\\nmap.put(\\\"a\\\", 1);\\nSystem.out.println(map.get(\\\"b\\\"));",
            "options": ["1", "0", "null", "Exception"],
            "correctAnswer": 2,
            "explanation": "Getting a non-existent key returns null"
          }
        ]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('AI Error generating quiz:', error);
      return {
        questions: [
          {
            type: "multiple_choice",
            question: `What is the main purpose of ${topic}?`,
            options: ["Store data", "Process data", "Display data", "All of above"],
            correctAnswer: 0,
            explanation: "Review the basic concepts of this topic."
          }
        ]
      };
    }
  }

  // Provide personalized learning path suggestions
  static async suggestLearningPath(userProgress, currentTopic) {
    const completedTopics = userProgress.topicProgress
      .filter(tp => tp.masteryLevel >= 70)
      .map(tp => tp.topic);

    const prompt = `
      Based on this user's progress, suggest next learning topics:
      
      Current Topic: ${currentTopic}
      Completed Topics: ${completedTopics.join(', ') || 'None'}
      
      User Stats:
      - Topics Started: ${userProgress.overallStats.totalTopicsStarted}
      - Topics Completed: ${userProgress.overallStats.totalTopicsCompleted}
      - Learning Style: ${userProgress.preferences.learningStyle}
      
      Suggest 3-5 related topics they should learn next, considering:
      1. Logical progression from current topic
      2. Prerequisites they've completed
      3. Difficulty progression
      4. Practical applications
      
      Return ONLY a JSON object:
      {
        "recommendations": [
          {
            "topic": "TreeMap",
            "reason": "Natural progression from HashMap with sorting",
            "difficulty": "Intermediate",
            "estimatedTime": "2-3 hours",
            "prerequisites": ["HashMap"],
            "priority": "high"
          }
        ],
        "learningPath": [
          "TreeMap",
          "LinkedHashMap", 
          "Graph Algorithms"
        ],
        "motivation": "You're making great progress! HashMap mastery opens up many advanced concepts."
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('AI Error suggesting learning path:', error);
      return {
        recommendations: [
          {
            topic: "Practice Problems",
            reason: "Reinforce current knowledge",
            difficulty: "Current Level",
            estimatedTime: "1-2 hours",
            prerequisites: [],
            priority: "medium"
          }
        ],
        learningPath: ["Practice", "Review", "Advance"],
        motivation: "Keep practicing to build strong foundations!"
      };
    }
  }

  // Fallback learning content
  static getFallbackLearningContent(topic, difficulty) {
    const topicLower = topic.toLowerCase();
    
    // Enhanced fallback content based on topic
    const fallbackData = {
      'binary search': {
        explanation: `Binary search is a highly efficient algorithm used to find a specific element within a **sorted** array or list. It works by repeatedly dividing the search interval in half. If the target value is less than the middle element, the search continues in the lower half; otherwise, it continues in the upper half. This process is repeated until the target value is found or the search interval is empty.

The key to binary search is the sorted nature of the data; it wouldn't work efficiently (or at all) on an unsorted array.

**Time Complexity**: O(log n)
**Space Complexity**: O(1) for iterative, O(log n) for recursive`,
        keyPoints: [
          "Array must be sorted for binary search to work",
          "Time complexity is O(log n) - very efficient for large datasets",
          "Works by repeatedly dividing search space in half",
          "Can be implemented iteratively or recursively",
          "Much faster than linear search for large arrays"
        ],
        codeExamples: [
          `// Java Binary Search Implementation
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid; // Found target
            } else if (arr[mid] < target) {
                left = mid + 1; // Search right half
            } else {
                right = mid - 1; // Search left half
            }
        }
        
        return -1; // Target not found
    }
}`,
          `// Recursive Binary Search
public static int binarySearchRecursive(int[] arr, int target, int left, int right) {
    if (left > right) {
        return -1; // Base case: not found
    }
    
    int mid = left + (right - left) / 2;
    
    if (arr[mid] == target) {
        return mid;
    } else if (arr[mid] < target) {
        return binarySearchRecursive(arr, target, mid + 1, right);
    } else {
        return binarySearchRecursive(arr, target, left, mid - 1);
    }
}`
        ],
        practiceProblems: [
          {
            title: "Find Target in Sorted Array",
            description: "Given a sorted array and a target value, return the index of the target if found, otherwise return -1.",
            difficulty: "easy",
            timeComplexity: "O(log n)",
            spaceComplexity: "O(1)"
          },
          {
            title: "Find First and Last Position",
            description: "Given a sorted array with duplicate elements, find the first and last occurrence of a target value.",
            difficulty: "medium",
            timeComplexity: "O(log n)",
            spaceComplexity: "O(1)"
          }
        ],
        commonMistakes: [
          "Forgetting to check if array is sorted",
          "Using (left + right) / 2 instead of left + (right - left) / 2 (integer overflow)",
          "Wrong boundary conditions (left <= right vs left < right)",
          "Not handling edge cases (empty array, single element)"
        ],
        nextTopics: ["Binary Search Tree", "Two Pointers", "Sliding Window"]
      },
      'arraylist': {
        explanation: `ArrayList is a dynamic array implementation in Java that can grow and shrink in size automatically. Unlike regular arrays, ArrayLists can change their size during runtime, making them very flexible for storing collections of objects.

ArrayLists are part of Java's Collections Framework and implement the List interface. They store elements in an ordered sequence and allow duplicate values.

**Time Complexity**: 
- Access: O(1)
- Insert/Delete at end: O(1) amortized
- Insert/Delete at arbitrary position: O(n)
- Search: O(n)`,
        keyPoints: [
          "Dynamic size - can grow and shrink automatically",
          "Stores objects only (not primitives directly)",
          "Maintains insertion order",
          "Allows duplicate elements",
          "Provides random access to elements",
          "Not thread-safe (use Vector or synchronize manually)"
        ],
        codeExamples: [
          `// ArrayList Basic Operations
import java.util.ArrayList;

public class ArrayListExample {
    public static void main(String[] args) {
        // Create ArrayList
        ArrayList<String> list = new ArrayList<>();
        
        // Add elements
        list.add("Apple");
        list.add("Banana");
        list.add("Cherry");
        
        // Access elements
        System.out.println(list.get(0)); // Apple
        
        // Size
        System.out.println(list.size()); // 3
        
        // Check if contains
        System.out.println(list.contains("Apple")); // true
        
        // Remove element
        list.remove(1); // Removes "Banana"
        
        // Iterate
        for (String fruit : list) {
            System.out.println(fruit);
        }
    }
}`,
          `// ArrayList vs Array Comparison
// Array - Fixed size
int[] array = new int[5];
array[0] = 1;

// ArrayList - Dynamic size
ArrayList<Integer> arrayList = new ArrayList<>();
arrayList.add(1);
arrayList.add(2); // Can keep adding!`
        ],
        practiceProblems: [
          {
            title: "Remove Duplicates from ArrayList",
            description: "Given an ArrayList with duplicate elements, remove all duplicates while maintaining order.",
            difficulty: "easy",
            timeComplexity: "O(n)",
            spaceComplexity: "O(n)"
          },
          {
            title: "Merge Two Sorted ArrayLists",
            description: "Given two sorted ArrayLists, merge them into one sorted ArrayList.",
            difficulty: "medium",
            timeComplexity: "O(n + m)",
            spaceComplexity: "O(n + m)"
          }
        ],
        commonMistakes: [
          "Trying to store primitives directly (use wrapper classes)",
          "Not handling IndexOutOfBoundsException",
          "Modifying ArrayList while iterating (use Iterator)",
          "Not considering thread safety in multi-threaded environments"
        ],
        nextTopics: ["LinkedList", "HashMap", "Collections Framework"]
      },
      'hashmap': {
        explanation: `HashMap is a hash table implementation in Java that stores key-value pairs. It provides constant-time O(1) average performance for basic operations like get, put, and remove.

HashMap uses hashing to map keys to their corresponding values. It's part of Java's Collections Framework and implements the Map interface.

**Key Features**:
- Stores key-value pairs
- Keys must be unique
- Values can be duplicated
- Not thread-safe
- Allows one null key and multiple null values`,
        keyPoints: [
          "Average O(1) time complexity for basic operations",
          "Uses hashing for fast lookups",
          "Keys must be unique, values can be duplicated",
          "Not thread-safe (use ConcurrentHashMap for thread safety)",
          "Allows null keys and values",
          "No guaranteed order of elements"
        ],
        codeExamples: [
          `// HashMap Basic Operations
import java.util.HashMap;

public class HashMapExample {
    public static void main(String[] args) {
        // Create HashMap
        HashMap<String, Integer> map = new HashMap<>();
        
        // Add key-value pairs
        map.put("apple", 10);
        map.put("banana", 20);
        map.put("orange", 15);
        
        // Get value by key
        System.out.println(map.get("apple")); // 10
        
        // Check if key exists
        System.out.println(map.containsKey("banana")); // true
        
        // Get with default value
        System.out.println(map.getOrDefault("grape", 0)); // 0
        
        // Iterate through map
        for (String key : map.keySet()) {
            System.out.println(key + ": " + map.get(key));
        }
        
        // Remove key-value pair
        map.remove("banana");
    }
}`
        ],
        practiceProblems: [
          {
            title: "Character Frequency Counter",
            description: "Count the frequency of each character in a given string using HashMap.",
            difficulty: "easy",
            timeComplexity: "O(n)",
            spaceComplexity: "O(k)"
          },
          {
            title: "Two Sum Problem",
            description: "Find two numbers in an array that add up to a target sum using HashMap.",
            difficulty: "medium",
            timeComplexity: "O(n)",
            spaceComplexity: "O(n)"
          }
        ],
        commonMistakes: [
          "Assuming HashMap maintains insertion order",
          "Not handling null keys/values properly",
          "Using HashMap in multi-threaded environments without synchronization",
          "Forgetting to override equals() and hashCode() for custom objects as keys"
        ],
        nextTopics: ["TreeMap", "LinkedHashMap", "ConcurrentHashMap"]
      }
    };

    // Get specific fallback data or use generic
    const specificData = fallbackData[topicLower];
    
    if (specificData) {
      return {
        explanation: specificData.explanation,
        keyPoints: specificData.keyPoints,
        codeExamples: specificData.codeExamples,
        practiceProblems: specificData.practiceProblems,
        commonMistakes: specificData.commonMistakes,
        nextTopics: specificData.nextTopics
      };
    }

    // Generic fallback
    return {
      explanation: `${topic} is an important concept in programming. Let's explore this topic step by step.

This is a fundamental concept that every programmer should understand. While AI is temporarily unavailable, here's a basic introduction to get you started.

**Learning Approach**:
1. Understand the basic concepts
2. See practical examples
3. Practice with coding problems
4. Build real projects using this knowledge`,
      keyPoints: [
        `${topic} is widely used in software development`,
        "Understanding the fundamentals is crucial for problem-solving",
        "Practice with examples helps reinforce learning",
        "Build projects to apply your knowledge practically"
      ],
      codeExamples: [
        `// Basic ${topic} example
// This is a placeholder - detailed examples will be provided
// when AI service is available again

public class ${topic.replace(/\s+/g, '')}Example {
    public static void main(String[] args) {
        // TODO: Add specific ${topic} implementation
        System.out.println("Learning ${topic}...");
    }
}`
      ],
      practiceProblems: [
        {
          title: `Basic ${topic} Problem`,
          description: `Practice problem involving ${topic} concepts`,
          difficulty: difficulty.toLowerCase(),
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)"
        }
      ],
      commonMistakes: [
        "Not understanding the basic concepts thoroughly",
        "Skipping practice problems",
        "Not considering edge cases",
        "Not optimizing for time and space complexity"
      ],
      nextTopics: ["Related Topics", "Advanced Concepts", "Real-world Applications"]
    };
  }
}

module.exports = AIService;
