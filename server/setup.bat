@echo off
REM VoiceBuddy AI Server Setup Script for Windows
echo 🚀 Setting up VoiceBuddy AI Server...

REM Navigate to server directory
cd /d "%~dp0"

REM Check if virtual environment exists, create if not
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo 📦 Installing dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found!
    echo Please create a .env file with your environment variables.
    echo See .env.example for reference.
) else (
    echo ✅ .env file found
)

echo 🎉 Server setup complete!
echo 💡 To start the server, run: python app.py
pause
