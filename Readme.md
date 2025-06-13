# VoiceBuddy AI Assistant

## Overview
VoiceBuddy is an AI-powered voice assistant designed specifically to address the technological challenges faced by senior citizens. This web application provides a user-friendly interface that enables seniors to perform various tasks through voice commands.

## Target Audience
- Senior Citizens
- Individuals with limited tech proficiency
- People with visual or motor impairments

## Problem Statement
Senior citizens often face numerous challenges when interacting with technology:
- Limited technological proficiency
- Vision issues (difficulty with low-contrast interfaces)
- Reduced motor control affecting device navigation
- Difficulties with manual app navigation and task execution
- Challenges with reading digital content
- Problems remembering daily schedules and appointments

## Solution
VoiceBuddy addresses these challenges through:
- **Accessible Web Application**: Easy access through any web browser
- **Intuitive Design**: Features both Dark and Light Mode for visual comfort
- **Voice-First Interaction**: Minimizes the need for typing or complex navigation
- **Automated Task Execution**: Uses various APIs to perform tasks automatically
- **AI-Powered Learning**: Provides information on any topic through conversational AI
- **Smart Scheduling**: Manages tasks and provides timely reminders

## Tech Stack
- **Frontend**: React (JavaScript/JSX), Tailwind CSS
- **Backend**: Node.js, Express
- **AI Components**: 
  - Large Language Model (LLM) for natural language understanding
  - Speech-to-Text (STT) for voice command processing
  - Text-to-Speech (TTS) for audible responses
  - Various APIs for extended functionalities

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/voicebuddy-ai-assistant.git
cd voicebuddy-ai-assistant
```

2. Install client dependencies
```bash
cd client
npm install
```

3. Install server dependencies
```bash
cd ../server
npm install
```

### Running the Application

#### Option 1: Using the development script (Windows)
For Windows users, a PowerShell script is provided to start both client and server:
```powershell
./start-dev.ps1
```

#### Option 2: Manual startup
1. Start the server
```bash
cd server
npm run dev  # For development with auto-reload
# or
npm start    # For production mode
```

2. In a new terminal, start the client
```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Features
- Voice command recognition
- Personalized responses and assistance
- Task scheduling and reminders
- Information retrieval on various topics
- Accessibility options (contrast settings, text size)
- Both dark and light theme options

## Future Enhancements
- Mobile application version
- Integration with smart home devices
- Personalized health monitoring and reminders
- Community features for connecting seniors

## Contributing
Contributions to improve VoiceBuddy are welcome! Please feel free to submit a pull request.

## Contact
For questions or feedback about VoiceBuddy, please reach out to the project team through [GitHub issues](https://github.com/yourusername/voicebuddy-ai-assistant/issues) or contact the project maintainer.
