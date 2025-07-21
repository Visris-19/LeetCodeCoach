# LeetCode Coach Startup Script
# Run this to start both backend and frontend

Write-Host "🚀 Starting LeetCode Coach..." -ForegroundColor Green

# Start Backend
Write-Host "📡 Starting Backend Server..." -ForegroundColor Blue
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'c:\Full-On-Projects\LeetCoach\backend'; npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🎨 Starting Frontend Development Server..." -ForegroundColor Blue
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'c:\Full-On-Projects\LeetCoach\frontend'; npm run dev"

Write-Host "✅ Both servers starting..." -ForegroundColor Green
Write-Host "📱 Frontend will be at: http://localhost:5173 or http://localhost:5174" -ForegroundColor Yellow
Write-Host "🔧 Backend will be at: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: Set up your MongoDB Atlas cluster first!" -ForegroundColor Red
Write-Host "   Cluster name: LeetCoachCluster" -ForegroundColor Yellow
Write-Host "   Update backend/.env with your connection string" -ForegroundColor Yellow
