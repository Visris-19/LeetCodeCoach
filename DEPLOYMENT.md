# 🚀 LeetCoach Deployment Guide

## Quick Professional Deployment

### Option 1: Railway (Recommended for Full-Stack)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: professional deployment ready"
   git push origin main
   ```

2. **Deploy Backend**
   - Go to [Railway](https://railway.app)
   - Connect GitHub repository
   - Select `LeetCoach` repository
   - Railway will auto-detect Node.js and use `railway.json`
   - Set environment variables:
     ```
     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/LeetCoach
     GEMINI_API_KEY=your_api_key
     NODE_ENV=production
     ```

3. **Deploy Frontend**
   - Create new Railway service
   - Connect same repository
   - Set build command: `cd frontend && npm install && npm run build`
   - Set start command: `cd frontend && npm run preview`

### Option 2: Vercel + Railway

1. **Backend on Railway** (as above)

2. **Frontend on Vercel**
   - Connect GitHub to Vercel
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/dist`
   - Set environment variable: `REACT_APP_API_URL=your-railway-backend-url/api`

### Option 3: Render (Alternative)

Use the included `render.yaml` for one-click deployment on Render.

## MongoDB Setup

1. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://mongodb.com/atlas)
   - Create free cluster
   - Create database user
   - Whitelist IP addresses
   - Get connection string

2. **Populate Demo Data**
   ```bash
   npm run demo:populate
   ```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/LeetCoach
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=production
SESSION_SECRET=your_session_secret
```

### Frontend (if needed)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Custom Domain (Optional)

1. **Purchase domain** (e.g., leetcoach.dev)
2. **Configure DNS** to point to your deployment
3. **Update CORS** in backend to allow your domain

## Performance Optimizations

1. **Enable compression** in Express
2. **Use CDN** for static assets
3. **Database indexing** for faster queries
4. **API response caching** for frequently requested data

## Monitoring & Analytics

1. **Railway/Render dashboards** for server metrics
2. **MongoDB Atlas monitoring** for database performance
3. **Google Analytics** for user behavior (optional)

## Security Checklist

- ✅ Environment variables secured
- ✅ CORS configured properly
- ✅ API rate limiting enabled
- ✅ Input validation implemented
- ✅ Error messages don't expose sensitive data

## Demo URLs Structure

After deployment, your URLs will be:
- **Frontend**: `https://leetcoach.vercel.app`
- **API**: `https://leetcoach-api.railway.app`
- **Demo Landing**: `https://leetcoach.vercel.app/landing`

## Recruiter Testing Guide

Share these test cases with recruiters:

1. **Question Addition**: Try adding "1865", "Two Sum", or "Binary Search"
2. **AI Mentor**: Ask "Explain HashMap in Java" or "What is Binary Search?"
3. **Quiz System**: Select Array + Hash Table topics, Medium difficulty
4. **Analytics**: View the performance dashboard with demo data

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check connection string format
- Verify network access (whitelist IP)
- Ensure database user has correct permissions

**AI Service Errors**
- Verify Gemini API key is valid
- Check API quota and rate limits
- Fallback system should handle gracefully

**CORS Errors**
- Update backend CORS configuration
- Verify frontend URL is in allowed origins

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

## Professional Presentation Tips

1. **Create demo video** (2-3 minutes)
2. **Prepare technical discussion points**:
   - Architecture decisions
   - Performance optimizations
   - Scalability considerations
   - Security implementations

3. **Have metrics ready**:
   - Load times
   - API response times
   - Database query performance
   - Error rates

## Cost Optimization

- **Railway**: Free tier covers most demo needs
- **Vercel**: Free for personal projects
- **MongoDB Atlas**: Free M0 cluster (512MB storage)
- **Total monthly cost**: $0 for demo deployment

## Future Enhancements

Ideas for technical discussions:
- User authentication system
- Real-time collaboration features
- Mobile app development
- Advanced AI features
- Microservices architecture
- GraphQL API layer

---

**Ready to impress recruiters with a production-ready application!** 🚀
