# FarmConnect Mobile - Development Start Script
# This script sets the necessary environment variables and starts the Expo dev server

Write-Host "🚀 Starting FarmConnect Mobile Development Server..." -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  SSL verification is disabled for development only" -ForegroundColor Yellow
Write-Host ""

# Set environment variable to bypass SSL verification
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    Write-Host ""
}

# Start the Expo development server
Write-Host "🎯 Starting Expo..." -ForegroundColor Cyan
npm start
