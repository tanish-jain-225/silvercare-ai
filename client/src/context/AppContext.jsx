import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "../utils/storage";
import { voiceService } from "../utils/voice";
import {
  loginWithEmailPassword,
  loginWithGoogle,
  signUpWithEmailPassword,
  logout as firebaseLogout,
} from "../firebase/auth.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState(
    storage.get("silvercare_language") || "en"
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          let userData = {
            id: firebaseUser.uid,
            name:
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "User",
            email: firebaseUser.email,
          };
          // Fetch extra user details from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            userData = { ...userData, ...userDoc.data() };
          }
          setUser(userData);
          setIsAuthenticated(true);
          storage.set("silvercare_user", userData);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          storage.remove("silvercare_user");
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        setUser(null);
        setIsAuthenticated(false);
        storage.remove("silvercare_user");
      }
      setLoading(false);
    });

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("Error unsubscribing from auth state:", error);
      }
    };
  }, []);

  useEffect(() => {
    // On mount, check local storage for user
    const storedUser = storage.get("silvercare_user");
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const user = await loginWithEmailPassword(email, password);
      const userData = {
        id: user.uid,
        name: user.displayName || email.split("@")[0],
        email: user.email,
      };
      setUser(userData);
      setIsAuthenticated(true);
      storage.set("silvercare_user", userData);
      setTimeout(() => {
        voiceService.speak(`Welcome back, ${userData.name}!`);
      }, 500);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const user = await signUpWithEmailPassword(email, password, name);
      const userData = {
        id: user.uid,
        name: name,
        email: user.email,
        healthConditions: [],
      };
      setUser(userData);
      setIsAuthenticated(true);
      storage.set("silvercare_user", userData);
      setTimeout(() => {
        voiceService.speak(`Welcome to SilverCare AI, ${name}!`);
      }, 500);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const loginWithGoogleHandler = async () => {
    try {
      const user = await loginWithGoogle();
      const userData = {
        id: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
      };
      setUser(userData);
      setIsAuthenticated(true);
      storage.set("silvercare_user", userData);
      setTimeout(() => {
        voiceService.speak(`Welcome back, ${userData.name}!`);
      }, 500);
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    storage.remove("silvercare_user");
    firebaseLogout();
    voiceService.speak("Goodbye! Take care.");
  };

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    storage.set("silvercare_language", newLanguage);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        language,
        setLanguage: updateLanguage,
        isAuthenticated,
        login,
        logout,
        signup,
        loginWithGoogle: loginWithGoogleHandler,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
