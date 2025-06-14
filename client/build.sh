#!/bin/bash

# VoiceBuddy AI - Build and Deploy Script
echo "🚀 Starting VoiceBuddy AI Build Process..."

# Navigate to client directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the project
echo "🏗️ Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in the 'dist' directory"
    echo "🌐 You can now deploy the 'dist' folder to your hosting service"
    
    # Optionally preview the build
    echo "🔍 Starting preview server..."
    npm run preview
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
