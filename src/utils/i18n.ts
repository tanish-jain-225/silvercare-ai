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
      welcome: "Hello {{name}} 👋",
      dailyPlanner: "Daily Planner",
      reminders: "Reminders",
      emergency: "Emergency",
      askQueries: "Ask Queries",
      
      // Navigation
      home: "Home",
      voiceAssistant: "Voice Assistant",
      profile: "Profile",
      
      // Daily Planner
      planYourDay: "Plan Your Day",
      typeOrSpeak: "Type your message or speak...",
      
      // Reminders
      myReminders: "My Reminders",
      addReminder: "Add Reminder",
      reminderTitle: "Reminder Title",
      reminderTime: "Time",
      reminderDate: "Date",
      
      // Emergency
      emergencyHelp: "Emergency Help",
      helpNow: "Help Now",
      emergencyContacts: "Emergency Contacts",
      
      // Ask Queries
      askQuestion: "Ask a Question",
      healthQuestions: "I can help with health questions, daily activities, and app guidance",
      
      // Profile
      personalInfo: "Personal Information",
      healthInfo: "Health Information",
      settings: "Settings",
      changeLanguage: "Change Language",
      
      // Common
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      back: "Back",
      yes: "Yes",
      no: "No"
    }
  },
  hi: {
    translation: {
      selectLanguage: "अपनी भाषा चुनें",
      continue: "जारी रखें",
      login: "लॉग इन करें",
      signup: "साइन अप करें",
      email: "ईमेल",
      password: "पासवर्ड",
      name: "नाम",
      welcome: "नमस्ते {{name}} 👋",
      dailyPlanner: "दैनिक योजनाकार",
      reminders: "रिमाइंडर",
      emergency: "आपातकाल",
      askQueries: "प्रश्न पूछें"
    }
  },
  mr: {
    translation: {
      selectLanguage: "तुमची भाषा निवडा",
      continue: "सुरू ठेवा",
      login: "लॉगिन करा",
      signup: "साइन अप करा",
      email: "ईमेल",
      password: "पासवर्ड",
      name: "नाव",
      welcome: "नमस्कार {{name}} 👋",
      dailyPlanner: "दैनिक नियोजक",
      reminders: "आठवणी",
      emergency: "आणीबाणी",
      askQueries: "प्रश्न विचारा"
    }
  },
  gu: {
    translation: {
      selectLanguage: "તમારી ભાષા પસંદ કરો",
      continue: "ચાલુ રાખો",
      login: "લોગિન કરો",
      signup: "સાઇન અપ કરો",
      email: "ઇમેઇલ",
      password: "પાસવર્ડ",
      name: "નામ",
      welcome: "નમસ્તે {{name}} 👋",
      dailyPlanner: "દૈનિક આયોજક",
      reminders: "રીમાઇન્ડર",
      emergency: "કટોકટી",
      askQueries: "પ્રશ્નો પૂછો"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;