@echo off
REM FarmConnect Mobile - Development Start Script (CMD)
REM This script sets the necessary environment variables and starts the Expo dev server

echo.
echo ========================================
echo FarmConnect Mobile Development Server
echo ========================================
echo.
echo WARNING: SSL verification is disabled for development only
echo.

REM Set environment variable to bypass SSL verification
set NODE_TLS_REJECT_UNAUTHORIZED=0

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the Expo development server
echo Starting Expo...
call npm start
