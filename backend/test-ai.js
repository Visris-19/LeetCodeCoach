// Test script for AI Service rate limiting and error handling
const AIService = require('./services/aiService');

async function testAIService() {
  console.log('🧪 Testing AI Service with rate limiting...\n');

  // Test single question
  console.log('1. Testing single question:');
  try {
    const result1 = await AIService.fetchQuestionDetails('1');
    console.log('✅ Single question test passed:', result1.title || result1.error);
  } catch (error) {
    console.log('❌ Single question test failed:', error.message);
  }

  // Test multiple questions (simulating bulk)
  console.log('\n2. Testing multiple questions with rate limiting:');
  const testQueries = ['2', '3', '15', '206'];
  
  for (let i = 0; i < testQueries.length; i++) {
    try {
      console.log(`Processing ${i + 1}/${testQueries.length}: ${testQueries[i]}`);
      const result = await AIService.fetchQuestionDetails(testQueries[i]);
      console.log(`✅ Success: ${result.title || result.error}`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  console.log('\n🎉 AI Service test completed!');
}

// Run the test
if (require.main === module) {
  testAIService().catch(console.error);
}

module.exports = testAIService;
