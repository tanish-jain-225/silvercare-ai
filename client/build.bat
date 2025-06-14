@echo off
REM VoiceBuddy AI - Build and Deploy Script for Windows
echo 🚀 Starting VoiceBuddy AI Build Process...

REM Navigate to client directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Run linting
echo 🔍 Running linter...
npm run lint

REM Build the project
echo 🏗️ Building project...
npm run build

REM Check if build was successful
if %ERRORLEVEL% equ 0 (
    echo ✅ Build completed successfully!
    echo 📁 Build files are in the 'dist' directory
    echo 🌐 You can now deploy the 'dist' folder to your hosting service
    
    REM Optionally preview the build
    echo 🔍 Starting preview server...
    npm run preview
) else (
    echo ❌ Build failed! Please check the errors above.
    exit /b 1
)
