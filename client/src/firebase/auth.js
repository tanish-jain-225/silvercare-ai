import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);

export const signUpWithEmailPassword = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(userCredential.user, { displayName: name });
  }
  return userCredential.user;
};

export const loginWithEmailPassword = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logout = async () => {
  await signOut(auth);
};
