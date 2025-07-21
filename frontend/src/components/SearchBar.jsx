import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

const SearchBar = ({ onSearch, onQuestionAdd, isLoading, placeholder = "Search by question number or title..." }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleAddQuestion = () => {
    if (query.trim()) {
      onQuestionAdd(query.trim());
      setQuery('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700"
          />
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Search Questions
          </button>
          
          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={!query.trim() || isLoading}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Add via AI
          </button>
        </div>
      </form>
      
      <p className="text-sm text-gray-500 mt-2 text-center">
        Search existing questions or use "Add via AI" to fetch question info from Gemini
      </p>
    </div>
  );
};

export default SearchBar;
