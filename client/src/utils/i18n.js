import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Language Selection
      selectLanguage: "Select Your Language",
      continue: "Continue",

      // Authentication
      login: "Login",
      signup: "Sign Up",
      email: "Email",
      password: "Password",
      name: "Name",
      loginButton: "Login",
      signupButton: "Create Account",
      continueWithGoogle: "Continue with Google",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",

      // User Details
      userDetails: "Tell Us About Yourself",
      age: "Age",
      healthConditions: "Health Conditions",
      diabetes: "Diabetes",
      bloodPressure: "Blood Pressure",
      heartDisease: "Heart Disease",
      arthritis: "Arthritis",
      saveDetails: "Save Details",

      // Home
      welcome: "Hello {{name}}",
      blog: "Blog Section",
      reminders: "Reminders",
      emergency: "Emergency",
      askQueries: "Ask Queries",

      // Navigation
      home: "Home",
      voiceAssistant: "Voice Assistant",
      profile: "Profile",
      // Blog Section
      blog: "Blog",
      blogSection: "Blog Section",
      refreshNews: "Refresh News",
      noArticlesFound: "No articles found. Try updating your interests or refreshing the page.",

      planYourDay: "Entertain Your Day",
      typeOrSpeak: "Type your message or speak...",

      // Reminders
      addReminder: "Add Reminder",
      reminderTitle: "Title",
      reminderTime: "Time",
      reminderDate: "Date",
      reminderDescription: "Description",
      saveReminder: "Save Reminder",
      upcomingReminders: "Upcoming Reminders",
      noReminders: "No reminders yet",

      // Emergency
      emergencyContacts: "Emergency Contacts",
      addEmergencyContact: "Add Contact",
      contactName: "Contact Name",
      contactPhone: "Phone Number",
      contactRelationship: "Relationship",
      saveContact: "Save Contact",
      callNow: "Call Now",
      emergencyServices: "Emergency Services",
      police: "Police",
      ambulance: "Ambulance",
      fire: "Fire Department",

      // Voice Assistant
      listening: "I'm listening...",
      tapToSpeak: "Tap to speak",
      holdToSpeak: "Hold to speak",
      releaseToStop: "Release to stop",

      // Queries
      askAnything: "Ask me anything",
      sampleQueries: "Sample Queries",
      weatherQuery: "What's the weather like today?",
      medicationQuery: "When should I take my medication?",
      newsQuery: "What's happening in the news?",
      typeMessage: "Type your message...",
      healthQuestions: "Hello! I'm your health assistant. I can help answer questions about health, wellness, and daily living. What would you like to know?",

      // Profile
      yourProfile: "Your Profile",
      editProfile: "Edit Profile",
      logout: "Logout",
      darkMode: "Dark Mode",
      fontSize: "Font Size",
      language: "Language",

      // Settings
      settings: "Settings",
      notifications: "Notifications",
      enableNotifications: "Enable Notifications",
      accessibility: "Accessibility",
      highContrast: "High Contrast",
      voiceSpeed: "Voice Speed",
      slow: "Slow",
      normal: "Normal",
      fast: "Fast"
    }
  },
  es: {
    translation: {
      selectLanguage: "Seleccione su idioma",
      continue: "Continuar",
      // More translations would go here...
    }
  },
  hi: {
    translation: {
      selectLanguage: "अपनी भाषा चुनें",
      continue: "जारी रखें",
      // More translations would go here...
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
