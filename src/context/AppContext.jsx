import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { voiceService } from '../utils/voice';

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load saved user and language on app start
    const savedUser = storage.get('silvercare_user');
    const savedLanguage = storage.get('silvercare_language');
    
    if (savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const userData = {
        id: '1',
        name: email.split('@')[0],
        email: email,
        age: 65,
        healthConditions: []
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      storage.set('silvercare_user', userData);
      
      // Welcome voice message
      setTimeout(() => {
        voiceService.speak(`Welcome back, ${userData.name}!`);
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name, email, password) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: Date.now().toString(),
        name,
        email,
        healthConditions: []
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      storage.set('silvercare_user', userData);
      
      // Welcome voice message
      setTimeout(() => {
        voiceService.speak(`Welcome to SilverCare AI, ${name}!`);
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    storage.remove('silvercare_user');
    voiceService.speak('Goodbye! Take care.');
  };

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    storage.set('silvercare_language', newLanguage);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      language,
      setLanguage: updateLanguage,
      isAuthenticated,
      login,
      logout,
      signup
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}