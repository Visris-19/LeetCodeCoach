import { useState } from 'react';
import { Plus, Search, Loader2, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { questionApi } from '../utils/api';

const AddQuestion = ({ onQuestionAdded }) => {  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(null); // For bulk operation progress

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;    setLoading(true);
    setMessage('');
    setResults(null);
    setProgress(null);

    // Show progress for bulk operations
    if (isBulkInput) {
      setProgress({ current: 0, total: questionCount });
    }

    try {
      const response = await questionApi.addQuestion(query.trim());
      
      if (response.data.success) {
        const { summary, results: addResults } = response.data;
        
        // Set success message
        if (summary.total === 1) {
          setMessage(summary.added > 0 ? '✅ Question added successfully!' : '❌ Failed to add question');
        } else {
          setMessage(`✅ Bulk addition complete: ${summary.added} added, ${summary.failed} failed, ${summary.skipped} skipped`);
        }
        
        // Store detailed results for display
        setResults(addResults);
        
        // Notify parent of successful additions
        if (onQuestionAdded && summary.added > 0) {
          // Call onQuestionAdded for each successfully added question
          addResults.success.forEach(result => {
            onQuestionAdded(result.question);
          });
        }
        
        // Clear input only on success
        setQuery('');
          // Clear message and progress after 5 seconds
        setTimeout(() => {
          setMessage('');
          setResults(null);
          setProgress(null);
        }, 5000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add question(s)';
      setMessage(`❌ ${errorMessage}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setProgress(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const isBulkInput = query.includes(',');
  const questionCount = isBulkInput ? query.split(',').filter(q => q.trim().length > 0).length : 1;

  return (
    <div className="bg-dark-secondary rounded-lg border border-dark p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Plus className="w-5 h-5 text-white" />
        </div>        <div>
          <h2 className="text-lg font-semibold text-dark-primary">Add Completed Question{isBulkInput ? 's' : ''}</h2>
          <p className="text-sm text-dark-secondary">
            {isBulkInput 
              ? `Add ${questionCount} LeetCode questions you've already solved`
              : "Add LeetCode questions you've already solved"
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-5 h-5" />          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Single: '2' or '3Sum' | Bulk: '3,4,5,6,7,8' or 'LC1,LC15,Two Sum'"
            className="w-full pl-10 pr-4 py-3 bg-dark-tertiary border border-dark rounded-lg 
                       text-dark-primary placeholder-dark-muted
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                       outline-none transition-all"
            disabled={loading}
          />
        </div>        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg 
                     hover:bg-blue-700 transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     flex items-center justify-center gap-2 font-medium"
        >          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isBulkInput ? `Processing ${questionCount} questions...` : 'Fetching question details...'}
              {progress && (
                <span className="text-sm ml-2">({progress.current}/{progress.total})</span>
              )}
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              {isBulkInput ? `Add ${questionCount} Questions via AI` : 'Add Question via AI'}
            </>
          )}
        </button>        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-green-900/30 text-green-400 border border-green-800' 
              : 'bg-red-900/30 text-red-400 border border-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Detailed Results for Bulk Addition */}
        {results && (
          <div className="space-y-3">
            {/* Success Results */}
            {results.success.length > 0 && (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Successfully Added ({results.success.length})
                </h4>
                <div className="space-y-2">
                  {results.success.map((result, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <span className="text-green-300">#{result.question.leetcodeId}</span>
                      <span className="text-green-200 flex-1">{result.question.title}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.question.difficulty === 'Easy' ? 'bg-green-800 text-green-200' :
                        result.question.difficulty === 'Medium' ? 'bg-yellow-800 text-yellow-200' :
                        'bg-red-800 text-red-200'
                      }`}>
                        {result.question.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped Results */}
            {results.skipped.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                <h4 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Skipped - Already Exists ({results.skipped.length})
                </h4>
                <div className="space-y-2">
                  {results.skipped.map((result, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <span className="text-yellow-300">#{result.question.leetcodeId}</span>
                      <span className="text-yellow-200 flex-1">{result.question.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Results */}
            {results.failed.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Failed to Add ({results.failed.length})
                </h4>
                <div className="space-y-2">
                  {results.failed.map((result, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <span className="text-red-300">{result.query}</span>
                      <span className="text-red-200 flex-1 text-xs">{result.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>      <div className="mt-6 p-4 bg-dark-tertiary rounded-lg border border-dark">
        <h3 className="text-sm font-medium text-dark-primary mb-2 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          How it works
        </h3>
        <ul className="text-xs text-dark-secondary space-y-1">
          <li>• <strong>Single question</strong>: "2", "Two Sum", "LC1"</li>
          <li>• <strong>Bulk addition</strong>: "3,4,5,6,7,8" or "LC1,Binary Search,3Sum"</li>
          <li>• AI fetches details and LeetCode URL automatically</li>
          <li>• Only add questions you've already completed</li>
          <li>• Build your revision database for smart practice sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default AddQuestion;
