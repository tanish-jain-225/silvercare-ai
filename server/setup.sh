#!/bin/bash

# VoiceBuddy AI Server Setup Script
echo "🚀 Setting up VoiceBuddy AI Server..."

# Navigate to server directory
cd "$(dirname "$0")"

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate || venv\Scripts\activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with your environment variables."
    echo "See .env.example for reference."
else
    echo "✅ .env file found"
fi

echo "🎉 Server setup complete!"
echo "💡 To start the server, run: python app.py"
