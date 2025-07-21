import { useState, useEffect } from 'react';
import { ExternalLink, Clock, Target, Calendar, Sparkles } from 'lucide-react';

const QuestionBank = ({ questions, onStartRevision }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Get unique topics for filter
  const uniqueTopics = [...new Set(questions.flatMap(q => q.topics || []))].sort();

  useEffect(() => {
    let filtered = questions;

    // Search filter
  //    if (searchTerm) {
  //   const normalizedSearch = searchTerm.replace(/^q/i, '').trim();

  //   filtered = filtered.filter(q =>
  //     q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     q.leetcodeId.startsWith(normalizedSearch) ||
  //     (q.topics && q.topics.some(topic =>
  //       topic.toLowerCase().includes(searchTerm.toLowerCase())
  //     ))
  //   );
  // }
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.leetcodeId.includes(searchTerm) ||
        (q.topics && q.topics.some(topic => 
          topic.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    // Topic filter
    if (filterTopic !== 'all') {
      filtered = filtered.filter(q => 
        q.topics && q.topics.includes(filterTopic)
      );
    }

    // filtered = filtered.sort((a, b) => Number(a.leetcodeId) - Number(b.leetcodeId));
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, filterDifficulty, filterTopic]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-900/30 border-green-800';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
      case 'Hard': return 'text-red-400 bg-red-900/30 border-red-800';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-800';
    }
  };

  const getRevisionStatus = (question) => {
    if (!question.lastRevisedAt) {
      return { text: 'Never revised', color: 'text-gray-400' };
    }
    
    const daysSince = Math.floor((Date.now() - new Date(question.lastRevisedAt)) / (1000 * 60 * 60 * 24));
    
    if (daysSince === 0) return { text: 'Today', color: 'text-green-400' };
    if (daysSince === 1) return { text: 'Yesterday', color: 'text-yellow-400' };
    if (daysSince <= 7) return { text: `${daysSince} days ago`, color: 'text-blue-400' };
    return { text: `${daysSince} days ago`, color: 'text-red-400' };
  };

  return (
    <div className="bg-dark-secondary rounded-lg border border-dark p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark-primary">Question Bank</h2>
            <p className="text-sm text-dark-secondary">{questions.length} completed questions ready for revision</p>
          </div>
        </div>

        {questions.length > 0 && (
          <button
            onClick={onStartRevision}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg 
                       hover:from-blue-700 hover:to-purple-700 transition-all
                       flex items-center gap-2 font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Start AI Revision
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-dark-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-primary mb-2">No Questions Added Yet</h3>
          <p className="text-dark-secondary">Add some completed LeetCode questions to start your revision journey</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-dark-tertiary border border-dark rounded-lg px-3 py-2 
                         text-dark-primary placeholder-dark-muted
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-dark-tertiary border border-dark rounded-lg px-3 py-2 
                         text-dark-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="bg-dark-tertiary border border-dark rounded-lg px-3 py-2 
                         text-dark-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Topics</option>
              {uniqueTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredQuestions.map((question) => {
              const revisionStatus = getRevisionStatus(question);
              
              return (
                <div key={question._id} className="bg-dark-tertiary border border-dark rounded-lg p-4 hover:bg-hover-bg transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-dark-muted">#{question.leetcodeId}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-dark-primary mb-2 line-clamp-2">
                        {question.title}
                      </h3>
                      
                      {question.topics && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {question.topics.slice(0, 3).map((topic, index) => (
                            <span
                              key={index}
                              className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs border border-blue-800"
                            >
                              {topic}
                            </span>
                          ))}
                          {question.topics.length > 3 && (
                            <span className="text-dark-muted text-xs px-2 py-1">
                              +{question.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <a
                      href={question.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 p-2 text-dark-muted hover:text-blue-400 transition-colors"
                      title="Open in LeetCode"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-dark-secondary">
                        <Calendar className="w-3 h-3" />
                        Added {new Date(question.dateAdded).toLocaleDateString()}
                      </span>
                      
                      {question.revisionCount > 0 && (
                        <span className="flex items-center gap-1 text-dark-secondary">
                          <Clock className="w-3 h-3" />
                          {question.revisionCount} revision{question.revisionCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <span className={`${revisionStatus.color}`}>
                      {revisionStatus.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-8 text-dark-secondary">
              <p>No questions match your current filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionBank;
