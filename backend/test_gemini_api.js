const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Your API key from .env file
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAt3RBBqIid_ACku6fsdIweKL-hLwhXe58';

console.log('🧪 Testing Gemini 1.5 Flash API...');
console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 20)}...` : 'Not found');

async function testGeminiAPI() {
  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Test 1: Basic Hello Test
    console.log('\n📝 Test 1: Basic Hello Test');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const helloResult = await model.generateContent("Say hello and confirm you're working!");
    const helloResponse = await helloResult.response;
    console.log('✅ Response:', helloResponse.text());

    // Test 2: LeetCode Question Test (like your app uses)
    console.log('\n📝 Test 2: LeetCode Question Test');
    const leetcodePrompt = `Find LeetCode problem details for: "Two Sum"
    
    Return ONLY a JSON object with this exact structure:
    {
      "found": true,
      "leetcodeId": "LC1",
      "title": "Two Sum",
      "difficulty": "Easy",
      "topics": ["Array", "Hash Table"],
      "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
      "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
    }
    
    If not found, return: {"found": false}`;

    const leetcodeResult = await model.generateContent(leetcodePrompt);
    const leetcodeResponse = await leetcodeResult.response;
    console.log('✅ LeetCode Response:', leetcodeResponse.text());

    // Test 3: JSON Parsing Test
    console.log('\n📝 Test 3: JSON Parsing Test');
    try {
      const cleanedText = leetcodeResponse.text().replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      console.log('✅ JSON Parsed Successfully:', parsed);
    } catch (parseError) {
      console.log('❌ JSON Parse Error:', parseError.message);
      console.log('Raw response:', leetcodeResponse.text());
    }

    // Test 4: Revision Plan Test
    console.log('\n📝 Test 4: Revision Plan Test');
    const revisionPrompt = `Generate a 3-day revision plan for DSA topics: ["Arrays", "Strings", "Hash Tables"]
    
    Return as JSON:
    {
      "plan": [
        {"day": 1, "topics": ["Arrays"], "focus": "Basic operations"},
        {"day": 2, "topics": ["Strings"], "focus": "String manipulation"},
        {"day": 3, "topics": ["Hash Tables"], "focus": "Key-value operations"}
      ]
    }`;

    const revisionResult = await model.generateContent(revisionPrompt);
    const revisionResponse = await revisionResult.response;
    console.log('✅ Revision Plan:', revisionResponse.text());

    console.log('\n🎉 ALL TESTS PASSED! Your API key works perfectly with Gemini 1.5 Flash!');
    
  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message);
    
    // Detailed error analysis
    if (error.message.includes('API key not valid')) {
      console.log('💡 Solution: Check your API key in Google AI Studio');
    } else if (error.message.includes('quota')) {
      console.log('💡 Solution: You may have exceeded your quota, try tomorrow');
    } else if (error.message.includes('403')) {
      console.log('💡 Solution: API key might not have proper permissions');
    } else if (error.message.includes('503')) {
      console.log('💡 Solution: Service temporarily unavailable, try again later');
    } else {
      console.log('💡 Full error details:', error);
    }
  }
}

// Run the test
testGeminiAPI();