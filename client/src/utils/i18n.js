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
      fast: "Fast",

      // Additional Translations
      search: "Search",
      cancel: "Cancel",
      delete: "Delete",
      save: "Save",
      edit: "Edit",
      update: "Update",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      back: "Back",
      next: "Next",
      finish: "Finish",
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      retry: "Retry",
      submit: "Submit",
      close: "Close",
      viewDetails: "View Details",
      help: "Help",
      about: "About",
      contactUs: "Contact Us",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      logoutConfirmation: "Are you sure you want to logout?",
    }
  },
  es: {
    translation: {
      selectLanguage: "Seleccione su idioma",
      continue: "Continuar",
      login: "Iniciar sesión",
      signup: "Regístrate",
      email: "Correo electrónico",
      password: "Contraseña",
      name: "Nombre",
      loginButton: "Iniciar sesión",
      signupButton: "Crear cuenta",
      continueWithGoogle: "Continuar con Google",
      noAccount: "¿No tienes una cuenta?",
      haveAccount: "¿Ya tienes una cuenta?",

      // User Details
      userDetails: "Cuéntanos sobre ti",
      age: "Edad",
      healthConditions: "Condiciones de salud",
      diabetes: "Diabetes",
      bloodPressure: "Presión arterial",
      heartDisease: "Enfermedad cardíaca",
      arthritis: "Artritis",
      saveDetails: "Guardar detalles",

      // Home
      welcome: "Hola {{name}}",
      blog: "Sección de blog",
      reminders: "Recordatorios",
      emergency: "Emergencia",
      askQueries: "Hacer consultas",

      // Navigation
      home: "Inicio",
      voiceAssistant: "Asistente de voz",
      profile: "Perfil",
      // Blog Section
      blog: "Blog",
      blogSection: "Sección de blog",
      refreshNews: "Actualizar noticias",
      noArticlesFound: "No se encontraron artículos. Intenta actualizar tus intereses o refrescar la página.",

      planYourDay: "Planifica tu día",
      typeOrSpeak: "Escribe tu mensaje o habla...",

      // Reminders
      addReminder: "Agregar recordatorio",
      reminderTitle: "Título",
      reminderTime: "Hora",
      reminderDate: "Fecha",
      reminderDescription: "Descripción",
      saveReminder: "Guardar recordatorio",
      upcomingReminders: "Próximos recordatorios",
      noReminders: "No hay recordatorios aún",

      // Emergency
      emergencyContacts: "Contactos de emergencia",
      addEmergencyContact: "Agregar contacto",
      contactName: "Nombre del contacto",
      contactPhone: "Número de teléfono",
      contactRelationship: "Relación",
      saveContact: "Guardar contacto",
      callNow: "Llamar ahora",
      emergencyServices: "Servicios de emergencia",
      police: "Policía",
      ambulance: "Ambulancia",
      fire: "Bomberos",

      // Voice Assistant
      listening: "Estoy escuchando...",
      tapToSpeak: "Toca para hablar",
      holdToSpeak: "Mantén presionado para hablar",
      releaseToStop: "Suelta para detener",

      // Queries
      askAnything: "Pregúntame cualquier cosa",
      sampleQueries: "Consultas de muestra",
      weatherQuery: "¿Cómo está el clima hoy?",
      medicationQuery: "¿Cuándo debo tomar mi medicamento?",
      newsQuery: "¿Qué está pasando en las noticias?",
      typeMessage: "Escribe tu mensaje...",
      healthQuestions: "¡Hola! Soy tu asistente de salud. Puedo ayudar a responder preguntas sobre salud, bienestar y vida diaria. ¿Qué te gustaría saber?",

      // Profile
      yourProfile: "Tu perfil",
      editProfile: "Editar perfil",
      logout: "Cerrar sesión",
      darkMode: "Modo oscuro",
      fontSize: "Tamaño de fuente",
      language: "Idioma",

      // Settings
      settings: "Configuraciones",
      notifications: "Notificaciones",
      enableNotifications: "Habilitar notificaciones",
      accessibility: "Accesibilidad",
      highContrast: "Alto contraste",
      voiceSpeed: "Velocidad de voz",
      slow: "Lento",
      normal: "Normal",
      fast: "Rápido",

      // Additional Translations
      search: "Buscar",
      cancel: "Cancelar",
      delete: "Eliminar",
      save: "Guardar",
      edit: "Editar",
      update: "Actualizar",
      confirm: "Confirmar",
      yes: "Sí",
      no: "No",
      back: "Atrás",
      next: "Siguiente",
      finish: "Finalizar",
      loading: "Cargando...",
      error: "Ocurrió un error",
      success: "Éxito",
      retry: "Reintentar",
      submit: "Enviar",
      close: "Cerrar",
      viewDetails: "Ver detalles",
      help: "Ayuda",
      about: "Acerca de",
      contactUs: "Contáctenos",
      privacyPolicy: "Política de privacidad",
      termsOfService: "Términos de servicio",
      logoutConfirmation: "¿Estás seguro de que deseas cerrar sesión?",
    }
  },
  fr: {
    translation: {
      selectLanguage: "Sélectionnez votre langue",
      continue: "Continuer",
      login: "Connexion",
      signup: "S'inscrire",
      email: "E-mail",
      password: "Mot de passe",
      name: "Nom",
      loginButton: "Connexion",
      signupButton: "Créer un compte",
      continueWithGoogle: "Continuer avec Google",
      noAccount: "Vous n'avez pas de compte?",
      haveAccount: "Vous avez déjà un compte?",

      // User Details
      userDetails: "Parlez-nous de vous",
      age: "Âge",
      healthConditions: "Conditions de santé",
      diabetes: "Diabète",
      bloodPressure: "Tension artérielle",
      heartDisease: "Maladie cardiaque",
      arthritis: "Arthrite",
      saveDetails: "Enregistrer les détails",

      // Home
      welcome: "Bonjour {{name}}",
      blog: "Section blog",
      reminders: "Rappels",
      emergency: "Urgence",
      askQueries: "Poser des questions",

      // Navigation
      home: "Accueil",
      voiceAssistant: "Assistant vocal",
      profile: "Profil",
      // Blog Section
      blog: "Blog",
      blogSection: "Section blog",
      refreshNews: "Actualiser les nouvelles",
      noArticlesFound: "Aucun article trouvé. Essayez de mettre à jour vos intérêts ou de rafraîchir la page.",

      planYourDay: "Planifiez votre journée",
      typeOrSpeak: "Tapez votre message ou parlez...",

      // Reminders
      addReminder: "Ajouter un rappel",
      reminderTitle: "Titre",
      reminderTime: "Heure",
      reminderDate: "Date",
      reminderDescription: "Description",
      saveReminder: "Enregistrer le rappel",
      upcomingReminders: "Rappels à venir",
      noReminders: "Aucun rappel pour le moment",

      // Emergency
      emergencyContacts: "Contacts d'urgence",
      addEmergencyContact: "Ajouter un contact",
      contactName: "Nom du contact",
      contactPhone: "Numéro de téléphone",
      contactRelationship: "Relation",
      saveContact: "Enregistrer le contact",
      callNow: "Appeler maintenant",
      emergencyServices: "Services d'urgence",
      police: "Police",
      ambulance: "Ambulance",
      fire: "Pompiers",

      // Voice Assistant
      listening: "J'écoute...",
      tapToSpeak: "Appuyez pour parler",
      holdToSpeak: "Maintenez pour parler",
      releaseToStop: "Relâchez pour arrêter",

      // Queries
      askAnything: "Demandez-moi n'importe quoi",
      sampleQueries: "Exemples de requêtes",
      weatherQuery: "Quel temps fait-il aujourd'hui?",
      medicationQuery: "Quand devrais-je prendre mon médicament?",
      newsQuery: "Quoi de neuf dans les nouvelles?",
      typeMessage: "Tapez votre message...",
      healthQuestions: "Bonjour! Je suis votre assistant santé. Je peux aider à répondre à des questions sur la santé, le bien-être et la vie quotidienne. Que voudriez-vous savoir?",

      // Profile
      yourProfile: "Votre profil",
      editProfile: "Modifier le profil",
      logout: "Se déconnecter",
      darkMode: "Mode sombre",
      fontSize: "Taille de la police",
      language: "Langue",

      // Settings
      settings: "Paramètres",
      notifications: "Notifications",
      enableNotifications: "Activer les notifications",
      accessibility: "Accessibilité",
      highContrast: "Contraste élevé",
      voiceSpeed: "Vitesse de la voix",
      slow: "Lent",
      normal: "Normal",
      fast: "Rapide",

      // Additional Translations
      search: "Rechercher",
      cancel: "Annuler",
      delete: "Supprimer",
      save: "Enregistrer",
      edit: "Modifier",
      update: "Mettre à jour",
      confirm: "Confirmer",
      yes: "Oui",
      no: "Non",
      back: "Retour",
      next: "Suivant",
      finish: "Terminer",
      loading: "Chargement...",
      error: "Une erreur s'est produite",
      success: "Succès",
      retry: "Réessayer",
      submit: "Soumettre",
      close: "Fermer",
      viewDetails: "Voir les détails",
      help: "Aide",
      about: "À propos",
      contactUs: "Contactez-nous",
      privacyPolicy: "Politique de confidentialité",
      termsOfService: "Conditions d'utilisation",
      logoutConfirmation: "Êtes-vous sûr de vouloir vous déconnecter?",
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
      loginButton: "लॉग इन करें",
      signupButton: "खाता बनाएं",
      continueWithGoogle: "गूगल के साथ जारी रखें",
      noAccount: "क्या आपके पास खाता नहीं है?",
      haveAccount: "क्या आपके पास खाता है?",

      // User Details
      userDetails: "हमारे बारे में बताएं",
      age: "उम्र",
      healthConditions: "स्वास्थ्य संबंधी स्थितियाँ",
      diabetes: "मधुमेह",
      bloodPressure: "रक्तचाप",
      heartDisease: "दिल की बीमारी",
      arthritis: "गठिया",
      saveDetails: "विवरण सहेजें",

      // Home
      welcome: "नमस्ते {{name}}",
      blog: "ब्लॉग अनुभाग",
      reminders: "याद दिलाने वाले",
      emergency: "आपातकालीन",
      askQueries: "पूछें",

      // Navigation
      home: "मुख्य पृष्ठ",
      voiceAssistant: "वॉयस असिस्टेंट",
      profile: "प्रोफ़ाइल",
      // Blog Section
      blog: "ब्लॉग",
      blogSection: "ब्लॉग अनुभाग",
      refreshNews: "समाचार ताज़ा करें",
      noArticlesFound: "कोई लेख नहीं मिला। कृपया अपने रुचियों को अपडेट करने या पृष्ठ को रिफ्रेश करने की कोशिश करें।",

      planYourDay: "अपने दिन की योजना बनाएं",
      typeOrSpeak: "अपना संदेश टाइप करें या बोलें...",

      // Reminders
      addReminder: "याददाश्त जोड़ें",
      reminderTitle: "शीर्षक",
      reminderTime: "समय",
      reminderDate: "तारीख",
      reminderDescription: "विवरण",
      saveReminder: "याददाश्त सहेजें",
      upcomingReminders: "आगामी याददाश्त",
      noReminders: "अभी तक कोई याददाश्त नहीं",

      // Emergency
      emergencyContacts: "आपातकालीन संपर्क",
      addEmergencyContact: "संपर्क जोड़ें",
      contactName: "संपर्क का नाम",
      contactPhone: "फोन नंबर",
      contactRelationship: "रिश्ता",
      saveContact: "संपर्क सहेजें",
      callNow: "अभी कॉल करें",
      emergencyServices: "आपातकालीन सेवाएँ",
      police: "पुलिस",
      ambulance: "एंबुलेंस",
      fire: "अग्निशामक",

      // Voice Assistant
      listening: "मैं सुन रहा हूँ...",
      tapToSpeak: "बोलने के लिए टैप करें",
      holdToSpeak: "बोलने के लिए दबाए रखें",
      releaseToStop: "रोकने के लिए छोड़ें",

      // Queries
      askAnything: "मुझसे कुछ भी पूछें",
      sampleQueries: "नमूना प्रश्न",
      weatherQuery: "आज मौसम कैसा है?",
      medicationQuery: "मुझे अपना मेडिकेशन कब लेना चाहिए?",
      newsQuery: "समाचारों में क्या हो रहा है?",
      typeMessage: "अपना संदेश टाइप करें...",
      healthQuestions: "नमस्ते! मैं आपका स्वास्थ्य सहायक हूँ। मैं स्वास्थ्य, कल्याण, और दैनिक जीवन के बारे में प्रश्नों के उत्तर देने में मदद कर सकता हूँ। आपको क्या जानना है?",

      // Profile
      yourProfile: "आपकी प्रोफ़ाइल",
      editProfile: "प्रोफ़ाइल संपादित करें",
      logout: "लॉगआउट",
      darkMode: "डार्क मोड",
      fontSize: "फॉन्ट का आकार",
      language: "भाषा",

      // Settings
      settings: "सेटिंग्स",
      notifications: "सूचनाएँ",
      enableNotifications: "सूचनाएँ सक्षम करें",
      accessibility: "सुगम्यता",
      highContrast: "उच्च विपरीत",
      voiceSpeed: "वॉयस स्पीड",
      slow: "धीमा",
      normal: "सामान्य",
      fast: "तेज",

      // Additional Translations
      search: "खोजें",
      cancel: "रद्द करें",
      delete: "हटाएं",
      save: "सहेजें",
      edit: "संपादित करें",
      update: "अपडेट करें",
      confirm: "पुष्टि करें",
      yes: "हाँ",
      no: "नहीं",
      back: "वापस",
      next: "अगला",
      finish: "समाप्त करें",
      loading: "लोड हो रहा है...",
      error: "एक त्रुटि हुई",
      success: "सफलता",
      retry: "पुनः प्रयास करें",
      submit: "जमा करें",
      close: "बंद करें",
      viewDetails: "विवरण देखें",
      help: "मदद",
      about: "के बारे में",
      contactUs: "हमसे संपर्क करें",
      privacyPolicy: "गोपनीयता नीति",
      termsOfService: "सेवा की शर्तें",
      logoutConfirmation: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
    }
  },
  mr: {
    translation: {
      selectLanguage: "आपली भाषा निवडा",
      continue: "सुरू ठेवा",
      login: "लॉगिन",
      signup: "साइन अप करा",
      email: "ईमेल",
      password: "पासवर्ड",
      name: "नाव",
      loginButton: "लॉगिन",
      signupButton: "खाते तयार करा",
      continueWithGoogle: "गुगलसह सुरू ठेवा",
      noAccount: "तुमच्याकडे खाते नाही?",
      haveAccount: "तुमच्याकडे खाते आहे?",

      // User Details
      userDetails: "आपल्या बारेत सांगा",
      age: "वय",
      healthConditions: "आरोग्याच्या समस्या",
      diabetes: "मधुमेह",
      bloodPressure: "रक्तदाब",
      heartDisease: "हृदय रोग",
      arthritis: "आर्थरायटिस",
      saveDetails: "तपशील जतन करा",

      // Home
      welcome: "नमस्कार {{name}}",
      blog: "ब्लॉग विभाग",
      reminders: "स्मरणपत्रे",
      emergency: "आपत्कालीन",
      askQueries: "प्रश्न विचारा",

      // Navigation
      home: "मुखपृष्ठ",
      voiceAssistant: "व्हॉइस असिस्टंट",
      profile: "प्रोफाइल",
      // Blog Section
      blog: "ब्लॉग",
      blogSection: "ब्लॉग विभाग",
      refreshNews: "ताज्या बातम्या",
      noArticlesFound: "कोणतेही लेख सापडले नाहीत. कृपया आपल्या आवडी अपडेट करण्याचा किंवा पृष्ठ ताजे करण्याचा प्रयत्न करा.",

      planYourDay: "आपला दिवस योजना",
      typeOrSpeak: "आपला संदेश टाइप करा किंवा बोला...",

      // Reminders
      addReminder: "स्मरणपत्र जोडा",
      reminderTitle: "शीर्षक",
      reminderTime: "वेळ",
      reminderDate: "तारीख",
      reminderDescription: "वर्णन",
      saveReminder: "स्मरणपत्र जतन करा",
      upcomingReminders: "उपcoming स्मरणपत्रे",
      noReminders: "अजून काही स्मरणपत्रे नाहीत",

      // Emergency
      emergencyContacts: "आपत्कालीन संपर्क",
      addEmergencyContact: "संपर्क जोडा",
      contactName: "संपर्काचे नाव",
      contactPhone: "फोन नंबर",
      contactRelationship: "संबंध",
      saveContact: "संपर्क जतन करा",
      callNow: "आता कॉल करा",
      emergencyServices: "आपत्कालीन सेवा",
      police: "पोलीस",
      ambulance: "अॅम्बुलन्स",
      fire: "आग विझवणारे",

      // Voice Assistant
      listening: "मी ऐकत आहे...",
      tapToSpeak: "बोलण्यासाठी टॅप करा",
      holdToSpeak: "बोलण्यासाठी धरून ठेवा",
      releaseToStop: "थांबवण्यासाठी सोडा",

      // Queries
      askAnything: "माझ्याकडे काहीही विचारा",
      sampleQueries: "नमुना प्रश्न",
      weatherQuery: "आज हवामान कसे आहे?",
      medicationQuery: "माझे औषध कधी घ्यावे?",
      newsQuery: "बातम्यांमध्ये काय चालले आहे?",
      typeMessage: "आपला संदेश टाइप करा...",
      healthQuestions: "नमस्कार! मी तुमचा आरोग्य सहाय्यक आहे. मी आरोग्य, कल्याण, आणि दैनिक जीवनाबद्दल प्रश्नांची उत्तरे देण्यात मदत करू शकतो. तुम्हाला काय माहित असावे लागेल?",

      // Profile
      yourProfile: "तुमची प्रोफाइल",
      editProfile: "प्रोफाइल संपादित करा",
      logout: "लॉगआउट",
      darkMode: "गडद मोड",
      fontSize: "फॉन्ट आकार",
      language: "भाषा",

      // Settings
      settings: "सेटिंग्ज",
      notifications: "सूचना",
      enableNotifications: "सूचना सक्षम करा",
      accessibility: "सुगम्यता",
      highContrast: "उच्च विरोधाभास",
      voiceSpeed: "व्हॉइस स्पीड",
      slow: "हळू",
      normal: "सामान्य",
      fast: "जलद",

      // Additional Translations
      search: "शोधा",
      cancel: "रद्द करा",
      delete: "हटवा",
      save: "जतन करा",
      edit: "संपादित करा",
      update: "अपडेट करा",
      confirm: "पुष्टी करा",
      yes: "होय",
      no: "नाही",
      back: "मागे",
      next: "पुढे",
      finish: "समाप्त",
      loading: "लोड होत आहे...",
      error: "त्रुटी आली",
      success: "यशस्वी",
      retry: "पुन्हा प्रयत्न करा",
      submit: "सबमिट करा",
      close: "बंद करा",
      viewDetails: "तपशील पहा",
      help: "मदत",
      about: "बद्दल",
      contactUs: "आमच्याशी संपर्क साधा",
      privacyPolicy: "गोपनीयता धोरण",
      termsOfService: "सेवेच्या अटी",
      logoutConfirmation: "तुम्हाला खात्री आहे की तुम्ही लॉगआउट करू इच्छिता?",
    }
  },
  bn: {
    translation: {
      selectLanguage: "আপনার ভাষা নির্বাচন করুন",
      continue: "চালিয়ে যান",
      login: "লগইন",
      signup: "সাইন আপ করুন",
      email: "ইমেল",
      password: "পাসওয়ার্ড",
      name: "নাম",
      loginButton: "লগইন",
      signupButton: "অ্যাকাউন্ট তৈরি করুন",
      continueWithGoogle: "গুগলের সাথে চালিয়ে যান",
      noAccount: "আপনার কি অ্যাকাউন্ট নেই?",
      haveAccount: "আপনার কি অ্যাকাউন্ট আছে?",

      // User Details
      userDetails: "আমাদের সম্পর্কে বলুন",
      age: "বয়স",
      healthConditions: "স্বাস্থ্য সম্পর্কিত অবস্থান",
      diabetes: "ডায়াবেটিস",
      bloodPressure: "রক্তচাপ",
      heartDisease: "হৃদরোগ",
      arthritis: "আর্থ্রাইটিস",
      saveDetails: "বিস্তারিত সংরক্ষণ করুন",

      // Home
      welcome: "হ্যালো {{name}}",
      blog: "ব্লগ বিভাগ",
      reminders: "স্মরণিকারক",
      emergency: "জরুরি",
      askQueries: "প্রশ্ন জিজ্ঞাসা করুন",

      // Navigation
      home: "হোম",
      voiceAssistant: "ভয়েস অ্যাসিস্ট্যান্ট",
      profile: "প্রোফাইল",
      // Blog Section
      blog: "ব্লগ",
      blogSection: "ব্লগ বিভাগ",
      refreshNews: "সংবাদ রিফ্রেশ করুন",
      noArticlesFound: "কোনো নিবন্ধ পাওয়া যায়নি। দয়া করে আপনার আগ্রহগুলি আপডেট করার বা পৃষ্ঠাটি রিফ্রেশ করার চেষ্টা করুন।",

      planYourDay: "আপনার দিনের পরিকল্পনা করুন",
      typeOrSpeak: "আপনার বার্তা টাইপ করুন বা বলুন...",

      // Reminders
      addReminder: "স্মরণিকা যোগ করুন",
      reminderTitle: "শিরোনাম",
      reminderTime: "সময়",
      reminderDate: "তারিখ",
      reminderDescription: "বর্ণনা",
      saveReminder: "স্মরণিকা সংরক্ষণ করুন",
      upcomingReminders: "আসন্ন স্মরণিকা",
      noReminders: "এখনো কোনো স্মরণিকা নেই",

      // Emergency
      emergencyContacts: "জরুরি যোগাযোগ",
      addEmergencyContact: "যোগাযোগ যোগ করুন",
      contactName: "যোগাযোগের নাম",
      contactPhone: "ফোন নম্বর",
      contactRelationship: "সম্পর্ক",
      saveContact: "যোগাযোগ সংরক্ষণ করুন",
      callNow: "এখনই কল করুন",
      emergencyServices: "জরুরি সেবা",
      police: "পুলিশ",
      ambulance: "এম্বুলেন্স",
      fire: "অগ্নি নির্বাপক",

      // Voice Assistant
      listening: "আমি শুনছি...",
      tapToSpeak: "বলার জন্য ট্যাপ করুন",
      holdToSpeak: "বলার জন্য ধরে রাখুন",
      releaseToStop: "থামানোর জন্য ছেড়ে দিন",

      // Queries
      askAnything: "আমাকে কিছু জিজ্ঞাসা করুন",
      sampleQueries: "নমুনা প্রশ্ন",
      weatherQuery: "আজ আবহাওয়া কেমন?",
      medicationQuery: "আমার ওষুধ কখন নিতে হবে?",
      newsQuery: "সংবাদে কী ঘটছে?",
      typeMessage: "আপনার বার্তা টাইপ করুন...",
      healthQuestions: "হ্যালো! আমি আপনার স্বাস্থ্য সহায়ক। আমি স্বাস্থ্য, সুস্থতা, এবং দৈনিক জীবনের বিষয়ে প্রশ্নের উত্তর দিতে সাহায্য করতে পারি। আপনি কী জানতে চান?",

      // Profile
      yourProfile: "আপনার প্রোফাইল",
      editProfile: "প্রোফাইল সম্পাদনা করুন",
      logout: "লগআউট",
      darkMode: "ডার্ক মোড",
      fontSize: "ফন্টের আকার",
      language: "ভাষা",

      // Settings
      settings: "সেটিংস",
      notifications: "বিজ্ঞপ্তি",
      enableNotifications: "বিজ্ঞপ্তি সক্ষম করুন",
      accessibility: "অ্যাক্সেসযোগ্যতা",
      highContrast: "উচ্চ বিপরীততা",
      voiceSpeed: "ভয়েস স্পিড",
      slow: "ধীরে",
      normal: "সাধারণ",
      fast: "দ্রুত",

      // Additional Translations
      search: "অনুসন্ধান",
      cancel: "বাতিল করুন",
      delete: "মুছে ফেলুন",
      save: "সংরক্ষণ করুন",
      edit: "সম্পাদনা করুন",
      update: "আপডেট করুন",
      confirm: "নিশ্চিত করুন",
      yes: "হ্যাঁ",
      no: "না",
      back: "পেছনে",
      next: "পরবর্তী",
      finish: "শেষ করুন",
      loading: "লোড হচ্ছে...",
      error: "একটি ত্রুটি ঘটেছে",
      success: "সফলতা",
      retry: "পুনরায় চেষ্টা করুন",
      submit: "জমা দিন",
      close: "বন্ধ করুন",
      viewDetails: "বিস্তারিত দেখুন",
      help: "সাহায্য",
      about: "সম্পর্কে",
      contactUs: "আমাদের সাথে যোগাযোগ করুন",
      privacyPolicy: "গোপনীয়তা নীতি",
      termsOfService: "পরিষেবার শর্তাবলী",
      logoutConfirmation: "আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?",
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