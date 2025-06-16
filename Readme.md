# <img src="client/public/bot-image.png" alt="SilverCare AI Logo" width="60" style="vertical-align:middle;"> SilverCare AI

---

<p align="center">
  <img src="client/public/voice-search.png" alt="SilverCare AI" width="120" />
</p>

<p align="center">
  <b>Empowering Seniors with a Voice-First, Accessible AI Assistant</b><br>
  <i>Chat, Reminders, Onboarding, and Accessibility—All in One Place</i>
</p>

---

## 🌟 Overview

SilverCare AI is a full-stack, voice-first AI assistant designed specifically for senior citizens. It bridges the digital divide by making technology accessible, intuitive, and empowering for older adults. With step-by-step onboarding, voice-enabled chat, smart reminders, and a beautiful, accessible UI, SilverCare AI is more than a tool—it's a companion for independent living.

---

## 🖼️ Screenshots

<p align="center">
  <img src="screenshots/onboarding.png" alt="Step-by-step Onboarding" width="300" style="margin:10px;" />
  <img src="screenshots/chat.png" alt="Voice-First Chat" width="300" style="margin:10px;" />
  <img src="screenshots/reminders.png" alt="Reminders Page" width="300" style="margin:10px;" />
  <img src="screenshots/accessibility.png" alt="Accessibility Features" width="300" style="margin:10px;" />
</p>

> **Tip:** Place your screenshots in the `screenshots/` folder at the project root. Update the image paths above as needed.

---

## 🎯 Problem Statement

Seniors face unique challenges with technology:

- **Limited Tech Proficiency**: Complex interfaces are overwhelming.
- **Vision & Motor Impairments**: Small text and precise gestures are difficult.
- **Memory Issues**: Forgetting schedules and tasks is common.
- **Digital Overload**: Too much information, not enough clarity.

---

## 💡 Our Solution

- **Voice-First Interaction**: Use your voice everywhere—onboarding, chat, reminders.
- **Step-by-Step Onboarding**: A 6-step, mobile-friendly, voice-enabled form ensures every user is set up for success.
- **Smart Reminders**: Schedule, view, and get notified about tasks and medications.
- **Conversational AI**: Natural, human-like chat for queries and support.
- **Personalized Experience**: Learns user preferences and adapts.
- **Accessible UI**: High contrast, adjustable text, dark/light modes, and large touch targets.

---

## 🛠️ Tech Stack

### Frontend

- **React + Vite**: Fast, modern, and modular UI development.
- **Tailwind CSS**: Utility-first, accessible, and responsive styling.
- **React Context & Hooks**: State management and custom logic.
- **Speech Recognition & Synthesis APIs**: Voice input/output everywhere.

### Backend

- **Python (Flask)**: Lightweight, robust REST API for chat, reminders, and onboarding.
- **Firebase**: Authentication and user management.
- **Vercel**: Seamless deployment for both frontend and backend.

---

## ✨ Features

- **Step-by-Step Onboarding**: 6-step, voice-enabled, mobile-friendly form with validation and accessibility.
- **Voice-First Chat**: Ask anything, set reminders, or get help—just speak!
- **Smart Reminders**: Create, view, and get notified about reminders. Unique alarms, no duplicates, and reliable scheduling.
- **Chat History**: All conversations are saved and accessible.
- **Dynamic Routing**: Messages are routed to chat or reminders based on context.
- **Accessibility**: High-contrast themes, adjustable text, voice feedback, and large buttons.
- **Mobile-First Design**: Fully responsive and touch-friendly.
- **Personalization**: Learns and adapts to user interests and needs.

---

## ♿ Accessibility & Onboarding

- **Accessible by Design**: Every page and component is built for seniors—clear labels, voice feedback, and easy navigation.
- **Voice Input Everywhere**: All forms and chat fields support voice input, with clear buttons and feedback.
- **Step Progress**: Onboarding shows clear progress and prevents skipping required steps.
- **Screen Reader Friendly**: Uses semantic HTML and ARIA where needed.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16+)
- **npm** or **yarn**
- **Python 3.9+**
- **pip** (Python package manager)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/silvercare-ai.git
   cd silvercare-ai
   ```

2. **Install Client Dependencies**

   ```bash
   cd client
   npm install
   # or
   yarn install
   ```

3. **Install Server Dependencies**
   ```bash
   cd ../server
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Backend (Flask Server)**

   ```bash
   cd server
   python app.py
   # or use a process manager like flask run or gunicorn for production
   ```

2. **Start the Frontend (Vite/React)**

   ```bash
   cd client
   npm run dev
   # or
   yarn dev
   ```

3. **Access the App**
   Open your browser at [http://localhost:5173](http://localhost:5173) (default Vite port).

---

## 🔮 Future Enhancements

- **Mobile App**: Native iOS/Android support.
- **Smart Home Integration**: Voice control for IoT devices.
- **Health Monitoring**: Track vitals and provide insights.
- **Community & Social**: Connect seniors for social engagement.

---

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork the repo.
2. Create a feature branch.
3. Submit a pull request with a clear description.

---

## 📞 Contact

- **GitHub Issues**: [SilverCare AI Issues](https://github.com/yourusername/silvercare-ai/issues)
- **Email**: support@silvercare.com

---

## 🏆 Why SilverCare AI?

SilverCare AI is more than a hackathon project—it's a mission to empower seniors with technology that truly understands and supports them. Our focus on accessibility, usability, and real-world impact sets us apart. We believe every senior deserves a digital companion that is friendly, reliable, and empowering.

---

<p align="center">
  <b>Making Technology Human—For Everyone.</b>
</p>
