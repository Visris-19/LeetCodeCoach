# LeetCoach 🚀

A comprehensive DSA (Data Structures and Algorithms) learning platform that combines interactive quizzes with AI-powered assistance to help you master competitive programming concepts.

## ✨ Features

- **Interactive Quiz System**: Generate quizzes by topic, difficulty, and question count
- **Smart Question Bank**: Add LeetCode questions by name or number with AI assistance
- **Performance Tracking**: Detailed analytics on your learning progress
- **AI-Powered Assistance**: Get hints and explanations powered by Google's Gemini AI
- **Dark Theme**: Modern, eye-friendly dark UI/UX
- **Progress Persistence**: Your learning data is saved locally and in the cloud
- **Comprehensive Coverage**: Questions ranging from easy arrays to advanced graph algorithms
- **Revision Sessions**: AI picks questions based on your weak areas for timed practice

## �️ Tech Stack

### Frontend
- **React 18** - Modern component-based UI framework
- **Tailwind CSS** - Utility-first CSS framework with custom dark theme
- **Vite** - Lightning-fast build tool and dev server
- **LocalForage** - Client-side data persistence

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for storing questions and user data
- **Mongoose** - MongoDB object modeling

### AI Integration
- **Google Gemini AI** - Advanced AI model for question generation and explanations
- **Comprehensive Fallback System** - 500+ pre-loaded LeetCode questions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```powershell
   git clone https://github.com/yourusername/LeetCoach.git
   cd LeetCoach
   ```

2. **Install dependencies**
   ```powershell
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```powershell
   # Copy environment template
   copy .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/LeetCoach
   # Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/LeetCoach
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

4. **Database Setup**
   - Start MongoDB locally or ensure MongoDB Atlas connection
   - The application will automatically create required collections

5. **Start the Application**
   ```powershell
   # Start backend server
   npm start
   
   # In a new terminal, start frontend
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 Usage Guide

### Taking a Quiz
1. Navigate to the Quiz section
2. Select your preferred topics (Arrays, Strings, Trees, etc.)
3. Choose difficulty level (Easy, Medium, Hard)
4. Set the number of questions (5-20)
5. Start your quiz and track your progress!

### Adding Questions
1. Go to "Add Question" section
2. Enter either:
   - LeetCode question number (e.g., 1865, 35)
   - Question name (e.g., "Two Sum", "Binary Search")
3. The AI will fetch question details and add to your database
4. Questions are automatically categorized by topic and difficulty

**Bulk Addition Support:**
- Add multiple questions: "3,4,5,6,7,8"
- Mix formats: "LC1,Binary Search,3Sum,206"
- Rate-limit protection with sequential processing
- Detailed success/failed/skipped results

### Revision Sessions
1. Click "Start Revision" tab
2. Choose session duration (30/60/90 minutes)
3. AI picks questions based on your weak topics
4. Solve on LeetCode platform with live timer
5. Mark complete and move to next question

### Viewing Question Bank
- Browse all available questions
- Filter by topic, difficulty, or completion status
- View detailed question information and solutions

### Performance Analytics
- Track your progress over time
- View performance breakdown by topic
- Identify areas that need more practice

## 🏗️ Project Structure

```
LeetCoach/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components  
│   │   ├── services/       # API services
│   │   └── styles/         # Tailwind configurations
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── models/                 # MongoDB schemas
├── routes/                 # Express route handlers
├── services/               # Business logic services
│   └── aiService.js        # AI integration service
├── server.js              # Main server file
├── package.json           # Backend dependencies
└── README.md              # Project documentation
```

## 🔧 API Endpoints

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions/add` - Add new question
- `GET /api/questions/search` - Search questions

### Quiz
- `POST /api/quiz/generate` - Generate quiz
- `POST /api/quiz/submit` - Submit quiz results

### User Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress/update` - Update progress

### Revision Sessions
- `POST /api/revision/start` - Start revision session
- `POST /api/revision/complete` - Complete session

## 🎨 Customization

### Adding New Topics
1. Update the topics array in `frontend/src/components/QuizLanding.jsx`
2. Add corresponding logic in `services/aiService.js`
3. Update the topic categorization in question addition flow

### Extending AI Capabilities
- Modify prompts in `services/aiService.js`
- Add new AI service providers
- Enhance the fallback question database

### Theme Customization
- Edit `frontend/tailwind.config.js` for color schemes
- Modify CSS variables in `frontend/src/index.css`
- Update component styling in respective files

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/LeetCoach/issues) section
2. Create a new issue with detailed description
3. Join our community discussions

## 🚀 Deployment

### Local Production Build
```powershell
# Build frontend
cd frontend
npm run build

# Start production server
cd ..
npm run start:prod
```

### Cloud Deployment
- **Frontend**: Deploy to Vercel, Netlify, or similar
- **Backend**: Deploy to Railway, Render, or Heroku
- **Database**: Use MongoDB Atlas for production

## � Performance

- **Frontend**: Optimized with Vite for fast builds and hot reloading
- **Backend**: Efficient MongoDB queries with indexing
- **AI Integration**: Smart caching and fallback mechanisms
- **Response Times**: Average API response < 200ms

## 🚨 Troubleshooting

### Common Issues

**MongoDB Connection Issues:**
- Check username/password and network access in MongoDB Atlas
- Ensure IP address is whitelisted
- Verify connection string format

**AI Not Working:**
- Verify Gemini API key in `.env` file
- Check API quota and rate limits
- Fallback system will use local question database

**Port Conflicts:**
- Frontend auto-picks available port (5173/5174)
- Backend defaults to port 5000, configurable in `.env`

**Question Addition Issues:**
- Newer LeetCode problems (1865+) are supported with enhanced fallback data
- Try both question number and question name formats
- Check network connectivity for AI services

---

Built with ❤️ for the competitive programming community. Happy coding! 🎯
