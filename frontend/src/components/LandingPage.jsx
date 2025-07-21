import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  GitHub, 
  ExternalLink, 
  Code, 
  Brain, 
  BarChart3, 
  Zap,
  Users,
  Award,
  Rocket,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Globe
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ questions: 0, sessions: 0, topics: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Animate stats
    const timer = setTimeout(() => {
      setStats({ questions: 150, sessions: 25, topics: 12 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <Code className="h-8 w-8 text-blue-400" />,
      title: "Smart Question Bank",
      description: "AI-powered question fetching with 500+ LeetCode problems and intelligent categorization",
      demo: "questions",
      highlight: "Try: Add '1865' or 'Two Sum'"
    },
    {
      icon: <Brain className="h-8 w-8 text-green-400" />,
      title: "AI DSA Mentor",
      description: "Personalized explanations, code review, and learning paths powered by Google Gemini",
      demo: "dsa-mentor",
      highlight: "Ask: 'Explain HashMap in Java'"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-400" />,
      title: "Performance Analytics",
      description: "Advanced insights with weakness identification and learning pattern analysis",
      demo: "analytics",
      highlight: "Real-time progress tracking"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      title: "Adaptive Learning",
      description: "AI-curated revision sessions and quizzes based on your performance data",
      demo: "quiz",
      highlight: "Personalized difficulty scaling"
    }
  ];

  const techStack = [
    { name: 'React 18', color: 'text-blue-400' },
    { name: 'Node.js', color: 'text-green-400' },
    { name: 'MongoDB', color: 'text-green-500' },
    { name: 'Express.js', color: 'text-gray-400' },
    { name: 'Tailwind CSS', color: 'text-cyan-400' },
    { name: 'Google Gemini AI', color: 'text-purple-400' }
  ];

  const achievements = [
    { icon: <Award className="h-6 w-6" />, text: "Full-Stack MERN Implementation", color: "text-blue-400" },
    { icon: <Rocket className="h-6 w-6" />, text: "AI Integration with Fallback Systems", color: "text-green-400" },
    { icon: <Target className="h-6 w-6" />, text: "Real-time Analytics Dashboard", color: "text-purple-400" },
    { icon: <Users className="h-6 w-6" />, text: "Production-Ready Architecture", color: "text-yellow-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-dark-primary/90 backdrop-blur-sm border-b border-dark z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-dark-primary">
                <span className="text-blue-400">Leet</span>Coach
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Visris-19/LeetCodeCoach"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-dark-secondary hover:text-dark-primary transition-colors"
              >
                <GitHub className="h-5 w-5" />
                Source Code
              </a>
              <button
                onClick={() => navigate('/questions')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Try Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center">
          {/* Professional Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-blue-400 font-semibold mb-6">
            <Star className="h-4 w-4" />
            Full-Stack Portfolio Project
            <Star className="h-4 w-4" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-dark-primary mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              LeetCoach
            </span>
            <br />
            <span className="text-3xl md:text-4xl text-dark-secondary">
              AI-Powered DSA Learning Platform
            </span>
          </h1>

          <p className="text-xl text-dark-secondary mb-8 max-w-3xl mx-auto">
            A comprehensive technical interview preparation platform showcasing modern web development, 
            AI integration, and production-ready engineering practices.
          </p>

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
            {[
              { label: 'LeetCode Problems', value: stats.questions, suffix: '+' },
              { label: 'Practice Sessions', value: stats.sessions, suffix: '+' },
              { label: 'DSA Topics', value: stats.topics, suffix: '+' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-dark-secondary">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/questions')}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold text-lg"
            >
              <Play className="h-5 w-5" />
              Try Live Demo
              <ArrowRight className="h-5 w-5" />
            </button>
            <a
              href="https://github.com/Visris-19/LeetCodeCoach"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 border border-gray-600 text-dark-primary rounded-lg hover:bg-dark-tertiary transition-all duration-300 font-semibold text-lg"
            >
              <GitHub className="h-5 w-5" />
              View Source Code
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Professional Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-dark-secondary/50 border border-dark rounded-lg hover:border-blue-500/30 transition-colors"
              >
                <div className={achievement.color}>
                  {achievement.icon}
                </div>
                <span className="text-dark-primary text-sm font-medium">
                  {achievement.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-primary mb-4">
            Technical Features & Demonstrations
          </h2>
          <p className="text-lg text-dark-secondary max-w-3xl mx-auto">
            Each feature showcases different aspects of modern web development and software engineering practices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-dark-secondary border border-dark rounded-lg p-8 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-dark-tertiary rounded-lg group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-dark-primary mb-2">
                      {feature.title}
                    </h3>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      {feature.highlight}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-dark-secondary mb-6 leading-relaxed">
                {feature.description}
              </p>
              <button
                onClick={() => navigate(`/${feature.demo}`)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold"
              >
                Try This Feature
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark-primary mb-4">
            Modern Technology Stack
          </h2>
          <p className="text-lg text-dark-secondary">
            Built with industry-standard tools and frameworks
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="group text-center p-6 bg-dark-secondary border border-dark rounded-lg hover:border-blue-500/30 transition-all duration-300 hover:scale-105"
            >
              <div className={`text-lg font-semibold ${tech.color} group-hover:scale-110 transition-transform`}>
                {tech.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Demo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-dark-primary mb-4">
            🚀 Ready for Technical Review?
          </h2>
          <p className="text-lg text-dark-secondary mb-8 max-w-2xl mx-auto">
            Experience the full application capabilities in under 5 minutes. 
            Perfect for technical interviews and code review discussions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Question Management", route: "/questions", icon: <Code className="h-5 w-5" /> },
              { label: "AI Learning Assistant", route: "/dsa-mentor", icon: <Brain className="h-5 w-5" /> },
              { label: "Performance Dashboard", route: "/analytics", icon: <BarChart3 className="h-5 w-5" /> }
            ].map((demo, index) => (
              <button
                key={index}
                onClick={() => navigate(demo.route)}
                className="flex items-center justify-center gap-3 p-4 bg-dark-secondary border border-gray-600 text-dark-primary rounded-lg hover:bg-dark-tertiary hover:border-blue-500/50 transition-all duration-300 font-semibold"
              >
                {demo.icon}
                {demo.label}
              </button>
            ))}
          </div>
          
          <div className="mt-8 text-sm text-dark-muted">
            <p>💡 <strong>Pro Tip for Recruiters:</strong> Try adding question "1865" or ask the AI about "HashMap" to see advanced features</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-dark-muted">
            <p className="mb-2">
              Built with ❤️ for technical interview preparation and professional portfolio demonstration
            </p>
            <p className="text-sm">
              Open to opportunities in <span className="text-blue-400 font-semibold">Full-Stack Development</span>, 
              <span className="text-green-400 font-semibold"> AI Integration</span>, and 
              <span className="text-purple-400 font-semibold"> Technical Leadership</span> roles
            </p>
            <div className="flex justify-center items-center gap-6 mt-4">
              <a href="https://linkedin.com/in/yourprofile" className="text-blue-400 hover:text-blue-300 transition-colors">
                LinkedIn
              </a>
              <a href="mailto:your.email@example.com" className="text-green-400 hover:text-green-300 transition-colors">
                Email
              </a>
              <a href="https://yourportfolio.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
