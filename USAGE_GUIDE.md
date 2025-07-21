# LeetCode Coach - DSA Revision System

## 🚀 Quick Setup

### 1. MongoDB Atlas Setup (REQUIRED)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster named **`LeetCoachCluster`**
3. Create a database user with username/password
4. Get your connection string and update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@leetcoachcluster.mongodb.net/leetcode_coach?retryWrites=true&w=majority
   ```

### 2. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Your app will run at http://localhost:5173/

## ✅ Core Features - Revision Focused

### 1. **Add Completed Questions**
- **AI-Powered Addition**: Add questions you've already solved on LeetCode
- **Smart Detection**: Just type "LC1", "Two Sum", or question number
- **Auto-Fetch**: AI gets title, difficulty, topics, and LeetCode URL
- **Question Bank**: Build your personal revision database

### 2. **Timed Revision Sessions**
- **Smart Selection**: AI picks questions based on your weak areas
- **Allocated Time**: Each question gets specific time based on difficulty
- **Live Timer**: Track time spent on each problem
- **Direct Links**: Click to open LeetCode and solve
- **Quick Marking**: Mark complete when you finish solving

### 3. **AI Learning & Growth**
- **Performance Tracking**: System learns your strengths/weaknesses
- **Smart Suggestions**: Get questions that help you improve
- **Topic Analysis**: Identifies which data structures need more practice
- **Adaptive Planning**: Revision sessions adapt to your performance

## 🎯 Revision Workflow

### Perfect DSA Revision Process:

**Step 1: Build Your Question Bank**
1. Add questions you've solved: "LC1", "Binary Search", "LC206"
2. AI fetches details and adds to your database
3. Each question stored with difficulty, topics, LeetCode URL

**Step 2: Start Revision Session**
1. Click "Start Revision" 
2. AI selects questions based on:
   - Topics you're weak in
   - Questions not revised recently
   - Your performance patterns
3. Set total session time (30min, 60min, 90min)

**Step 3: Timed Practice**
1. Each question gets allocated time based on difficulty:
   - Easy: 15-20 minutes
   - Medium: 25-35 minutes  
   - Hard: 40-50 minutes
2. Click the LeetCode link to open and solve
3. Timer tracks your actual time
4. Mark "Complete" when you finish successfully

**Step 4: AI Learns & Adapts**
1. System tracks: time taken, completion rate per topic
2. AI identifies weak areas (e.g., "struggling with Dynamic Programming")
3. Next sessions prioritize your weak topics
4. Get personalized suggestions for improvement

### Example Workflow:
```
Day 1: Add 10 completed questions → Start 60min revision
       → Practice 3 questions → AI learns you're weak in Graphs

Day 3: Start revision → AI gives you more Graph problems
       → Improve Graph performance → AI adjusts recommendations

Day 7: Dashboard shows progress → "Trees: 85% completion, Graphs: 60%"
       → AI suggests specific Tree questions to maintain skills
```

## 🔧 Technical Architecture

### Backend (Node.js + Express + MongoDB)
- **MongoDB Atlas**: Cloud database storing questions, sessions, performance
- **AI Integration**: Google Gemini for question fetching and learning recommendations  
- **REST API**: Endpoints for adding questions, managing sessions, tracking performance
- **Smart Learning**: AI analyzes your data to suggest optimal practice questions

### Frontend (React + Vite + Tailwind)
- **Dark Theme**: Optimized for long coding sessions
- **Responsive Design**: Works on desktop and mobile
- **Real-time Tracking**: Live timers and performance updates
- **Question Management**: Add, view, and practice your completed questions

### Data Models
- **Questions**: LeetCode details, topics, URLs, revision history
- **Sessions**: Timed practice sessions with allocated/actual times
- **Performance**: Topic-wise analytics and learning patterns
- **AI Suggestions**: Personalized recommendations based on your data

## 🚀 Getting Started Examples

### Add Your First Questions
Try these to build your question bank:
```
"LC1"           → Two Sum (Easy, Array, Hash Table)
"Binary Search" → LC704 (Easy, Binary Search)  
"3Sum"          → LC15 (Medium, Array, Two Pointers)
"206"           → Reverse Linked List (Easy, Linked List)
```

### Test Revision Sessions
1. Add 5-10 questions from different topics
2. Start a 45-minute revision session
3. AI will select 2-3 questions based on difficulty
4. Practice and mark complete to build performance data

## 🛠 Development Commands

### Backend (Terminal 1)
```bash
cd backend
npm install        # Install dependencies
npm start         # Start backend server (port 5000)
npm run dev       # Development mode with nodemon
```

### Frontend (Terminal 2)  
```bash
cd frontend
npm install        # Install dependencies
npm run dev       # Start development server (port 5173)
npm run build     # Build for production
npm run lint      # Check code quality
```

## 🚨 Important Setup Notes

### Required Environment Setup:
1. **MongoDB Atlas Cluster**: Must be named `LeetCoachCluster`
2. **Gemini API Key**: Already configured for AI features
3. **Backend URL**: Frontend points to `http://localhost:5000`

### Database Collections Created:
- `questions`: Your completed LeetCode problems
- `revisionsessions`: Timed practice session data  
- `userperformances`: Learning analytics and weak areas
- `aisuggestions`: Personalized recommendations

### Dark Theme Optimized:
- Background: Deep black for comfortable long sessions
- Syntax highlighting for code snippets
- High contrast for better readability
- Mobile responsive design

---

## 🎯 Your DSA Growth Journey Starts Here!

This system is designed to help you systematically revise and strengthen your DSA skills. The AI learns from every session to provide better recommendations.

**MongoDB Cluster Name**: `LeetCoachCluster`
**Focus**: Revision-based learning with AI adaptation
**Goal**: Identify and improve weak areas through targeted practice

Ready to become a DSA expert? Set up your MongoDB cluster and start adding your completed questions! 🧠🚀
