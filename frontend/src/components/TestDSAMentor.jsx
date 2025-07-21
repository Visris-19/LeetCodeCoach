import { useState } from 'react';
import { mentorApi } from '../utils/api';

const TestDSAMentor = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const response = await mentorApi.submitLearningRequest(
        'Binary Search',
        'beginner',
        'explanation',
        'I want to understand how binary search works'
      );
      
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-dark-secondary rounded-lg">
      <h3 className="text-lg font-semibold text-dark-primary mb-4">Test DSA Mentor API</h3>
      
      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-4 bg-dark-primary rounded border">
          <h4 className="text-dark-primary font-medium mb-2">Result:</h4>
          <pre className="text-sm text-dark-secondary overflow-x-auto whitespace-pre-wrap">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestDSAMentor;
