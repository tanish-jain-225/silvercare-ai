import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { app } from "./firebase";

// user authentication functions using Firebase Authentication
const auth = getAuth(app);

// Ensure persistence is set to local (default, but explicit for reliability)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set auth persistence:", error);
});

export const signUpWithEmailPassword = async (email, password, name) => {
  try {
    console.log("Attempting to create user with email:", email);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log("User created successfully:", userCredential.user.uid);
    
    if (name) {
      console.log("Updating user profile with name:", name);
      await updateProfile(userCredential.user, { displayName: name });
      console.log("User profile updated successfully");
    }
    return userCredential.user;
  } catch (error) {
    console.error("Signup error:", error);
    
    // Provide more specific error messages for network issues
    if (error.code === 'auth/network-request-failed') {
      const networkError = new Error("Network connection failed. Please check your internet connection and try again.");
      networkError.code = 'network-request-failed';
      throw networkError;
    } else if (error.code === 'auth/too-many-requests') {
      const rateLimitError = new Error("Too many signup attempts. Please wait a moment and try again.");
      rateLimitError.code = 'too-many-requests';
      throw rateLimitError;
    } else if (error.code === 'auth/email-already-in-use') {
      const emailError = new Error("This email is already registered. Please use a different email or try logging in.");
      emailError.code = 'email-already-in-use';
      throw emailError;
    } else if (error.code === 'auth/weak-password') {
      const passwordError = new Error("Password is too weak. Please use at least 6 characters.");
      passwordError.code = 'weak-password';
      throw passwordError;
    } else if (error.code === 'auth/invalid-email') {
      const emailFormatError = new Error("Invalid email address. Please enter a valid email.");
      emailFormatError.code = 'invalid-email';
      throw emailFormatError;
    }
    
    throw error;
  }
};

export const loginWithEmailPassword = async (email, password) => {
  try {
    console.log("Attempting to login with email:", email);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log("Login successful:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    
    // Provide more specific error messages for network issues
    if (error.code === 'auth/network-request-failed') {
      const networkError = new Error("Network connection failed. Please check your internet connection and try again.");
      networkError.code = 'network-request-failed';
      throw networkError;
    } else if (error.code === 'auth/user-not-found') {
      const userError = new Error("No account found with this email. Please sign up first.");
      userError.code = 'user-not-found';
      throw userError;
    } else if (error.code === 'auth/wrong-password') {
      const passwordError = new Error("Incorrect password. Please try again.");
      passwordError.code = 'wrong-password';
      throw passwordError;
    } else if (error.code === 'auth/invalid-email') {
      const emailError = new Error("Invalid email address. Please enter a valid email.");
      emailError.code = 'invalid-email';
      throw emailError;
    } else if (error.code === 'auth/too-many-requests') {
      const rateLimitError = new Error("Too many login attempts. Please wait a moment and try again.");
      rateLimitError.code = 'too-many-requests';
      throw rateLimitError;
    } else if (error.code === 'auth/user-disabled') {
      const disabledError = new Error("This account has been disabled. Please contact support.");
      disabledError.code = 'user-disabled';
      throw disabledError;
    }
    
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Add additional scopes if needed
    provider.addScope("profile");
    provider.addScope("email");
    
    // Set custom parameters to force account selection (helps with popup issues)
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google login error:", error);
    
    // Provide more specific error messages for different failure scenarios
    if (error.code === 'auth/network-request-failed') {
      const networkError = new Error("Network connection failed. Please check your internet connection and try again.");
      networkError.code = 'network-request-failed';
      throw networkError;
    } else if (error.code === 'auth/popup-blocked') {
      const popupError = new Error("Popup was blocked by your browser. Please allow popups for this site and try again.");
      popupError.code = 'popup-blocked';
      throw popupError;
    } else if (error.code === 'auth/popup-closed-by-user') {
      const popupClosedError = new Error("Sign-in was cancelled. Please try again.");
      popupClosedError.code = 'popup-closed-by-user';
      throw popupClosedError;
    } else if (error.code === 'auth/cancelled-popup-request') {
      const cancelledError = new Error("Another sign-in request is in progress. Please wait and try again.");
      cancelledError.code = 'cancelled-popup-request';
      throw cancelledError;
    } else if (error.code === 'auth/internal-error' || error.message.includes('INTERNAL ASSERTION FAILED')) {
      const internalError = new Error("A temporary authentication error occurred. Please try again in a moment.");
      internalError.code = 'internal-error';
      throw internalError;
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      const accountError = new Error("An account already exists with this email using a different sign-in method. Please try signing in with email/password.");
      accountError.code = 'account-exists-with-different-credential';
      throw accountError;
    } else if (error.code === 'auth/too-many-requests') {
      const rateLimitError = new Error("Too many sign-in attempts. Please wait a moment and try again.");
      rateLimitError.code = 'too-many-requests';
      throw rateLimitError;
    }
    
    // For any other errors, provide a generic message
    const genericError = new Error("Google sign-in failed. Please try again or use email/password sign-in.");
    genericError.code = error.code || 'unknown-error';
    genericError.originalError = error;
    throw genericError;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
