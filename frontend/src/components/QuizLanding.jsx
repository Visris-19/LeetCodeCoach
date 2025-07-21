import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Clock, Trophy, ArrowRight, BookOpen } from 'lucide-react';

const QuizLanding = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');
  const [questionCount, setQuestionCount] = useState(10);

  const topics = [
    { value: 'Binary Search', label: 'Binary Search', description: 'Search algorithms and optimization' },
    { value: 'HashMap', label: 'HashMap & Hash Tables', description: 'Key-value data structures' },
    { value: 'ArrayList', label: 'ArrayList & Dynamic Arrays', description: 'Resizable array structures' },
    { value: 'LinkedList', label: 'Linked Lists', description: 'Node-based data structures' },
    { value: 'Binary Trees', label: 'Binary Trees', description: 'Tree data structures and traversals' },
    { value: 'Sorting', label: 'Sorting Algorithms', description: 'Merge sort, quick sort, etc.' },
    { value: 'Dynamic Programming', label: 'Dynamic Programming', description: 'Optimization and memoization' },
    { value: 'Graphs', label: 'Graph Algorithms', description: 'BFS, DFS, shortest paths' },
    { value: 'Strings', label: 'String Algorithms', description: 'Pattern matching and manipulation' },
    { value: 'General', label: 'Mixed Topics', description: 'Various DSA concepts' }
  ];

  const difficulties = [
    { value: 'Beginner', label: 'Beginner', description: 'Basic concepts and syntax' },
    { value: 'Intermediate', label: 'Intermediate', description: 'Problem-solving and optimization' },
    { value: 'Advanced', label: 'Advanced', description: 'Complex algorithms and edge cases' }
  ];

  const questionCounts = [5, 10, 15, 20];

  const handleStartQuiz = () => {
    if (!selectedTopic) {
      alert('Please select a topic to start the quiz.');
      return;
    }
    
    navigate(`/quiz/${selectedTopic}/${selectedDifficulty}?count=${questionCount}`);
  };

  const getEstimatedTime = (count) => {
    return Math.ceil(count * 1.5); // 1.5 minutes per question
  };

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <div className="bg-dark-secondary border-b border-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-12 w-12 text-blue-400 mr-3" />
              <h1 className="text-3xl font-bold text-dark-primary">DSA Quiz Platform</h1>
            </div>
            <p className="text-dark-secondary max-w-2xl mx-auto">
              Test your knowledge with interactive quizzes covering data structures, algorithms, 
              and programming concepts. Get instant feedback and improve your coding skills.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quiz Configuration */}
        <div className="bg-dark-secondary rounded-lg border border-dark p-8 mb-8">
          <h2 className="text-2xl font-semibold text-dark-primary mb-6">Create Your Quiz</h2>
          
          {/* Topic Selection */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-dark-primary mb-4">
              Choose a Topic
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.value}
                  onClick={() => setSelectedTopic(topic.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTopic === topic.value
                      ? 'border-blue-400 bg-blue-900/30'
                      : 'border-dark hover:border-gray-500 hover:bg-dark-tertiary'
                  }`}
                >
                  <h3 className="font-semibold text-dark-primary mb-1">{topic.label}</h3>
                  <p className="text-sm text-dark-secondary">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-dark-primary mb-4">
              Select Difficulty
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficulties.map((difficulty) => (
                <div
                  key={difficulty.value}
                  onClick={() => setSelectedDifficulty(difficulty.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDifficulty === difficulty.value
                      ? 'border-blue-400 bg-blue-900/30'
                      : 'border-dark hover:border-gray-500 hover:bg-dark-tertiary'
                  }`}
                >
                  <h3 className="font-semibold text-dark-primary mb-1">{difficulty.label}</h3>
                  <p className="text-sm text-dark-secondary">{difficulty.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="mb-8">
            <label className="block text-lg font-medium text-dark-primary mb-4">
              Number of Questions
            </label>
            <div className="flex flex-wrap gap-4">
              {questionCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    questionCount === count
                      ? 'border-blue-400 bg-blue-900/30 text-blue-300'
                      : 'border-dark hover:border-gray-500 text-dark-primary'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{count} Questions</div>
                    <div className="text-sm text-dark-muted">
                      ~{getEstimatedTime(count)} min
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Summary */}
          {selectedTopic && (
            <div className="bg-dark-tertiary rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-dark-primary mb-4">Quiz Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span className="text-dark-secondary"><strong className="text-dark-primary">Topic:</strong> {selectedTopic}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-green-400" />
                  <span className="text-dark-secondary"><strong className="text-dark-primary">Level:</strong> {selectedDifficulty}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span className="text-dark-secondary"><strong className="text-dark-primary">Time:</strong> ~{getEstimatedTime(questionCount)} minutes</span>
                </div>
              </div>
            </div>
          )}

          {/* Start Quiz Button */}
          <div className="text-center">
            <button
              onClick={handleStartQuiz}
              disabled={!selectedTopic}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Start Quiz</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-secondary rounded-lg border border-dark p-6 text-center">
            <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="font-semibold text-dark-primary mb-2">Smart Questions</h3>
            <p className="text-dark-secondary text-sm">
              AI-generated questions tailored to your selected topic and difficulty level.
            </p>
          </div>
          
          <div className="bg-dark-secondary rounded-lg border border-dark p-6 text-center">
            <Clock className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="font-semibold text-dark-primary mb-2">Timed Challenges</h3>
            <p className="text-dark-secondary text-sm">
              Practice under time pressure to simulate real interview conditions.
            </p>
          </div>
          
          <div className="bg-dark-secondary rounded-lg border border-dark p-6 text-center">
            <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="font-semibold text-dark-primary mb-2">Detailed Feedback</h3>
            <p className="text-dark-secondary text-sm">
              Get explanations for each question and personalized improvement suggestions.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-dark-secondary rounded-lg border border-dark p-6">
          <h3 className="text-lg font-semibold text-dark-primary mb-4">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setSelectedTopic('General');
                setSelectedDifficulty('Beginner');
                setQuestionCount(10);
                navigate('/quiz/General/Beginner?count=10');
              }}
              className="p-4 text-left border border-dark rounded-lg hover:bg-dark-tertiary transition-colors"
            >
              <h4 className="font-semibold text-dark-primary">Beginner Mixed Quiz</h4>
              <p className="text-sm text-dark-secondary">10 questions covering various basic concepts</p>
            </button>
            
            <button
              onClick={() => {
                setSelectedTopic('HashMap');
                setSelectedDifficulty('Intermediate');
                setQuestionCount(15);
                navigate('/quiz/HashMap/Intermediate?count=15');
              }}
              className="p-4 text-left border border-dark rounded-lg hover:bg-dark-tertiary transition-colors"
            >
              <h4 className="font-semibold text-dark-primary">HashMap Challenge</h4>
              <p className="text-sm text-dark-secondary">15 intermediate HashMap questions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizLanding;
