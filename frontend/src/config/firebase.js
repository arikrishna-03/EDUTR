import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Production Firebase Configuration for project: edutr1
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCKJeEGjorGjpsQsD3I_ngWikv7qnI4v60",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "edutr1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "edutr1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "edutr1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "261833398690",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:261833398690:web:3a6d146f43ebdc02383afb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K4QZ9C9X1Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Analytics support check
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Sign in using Firebase Google Auth Popup
 */
export const signInWithGooglePopup = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      user: {
        uid: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    console.error("Firebase Google Sign-In Error:", error);
    return {
      success: false,
      error: error.message || "Google sign-in failed",
      code: error.code,
    };
  }
};

/**
 * Sign in using Email & Password with automatic registration fallback
 */
export const loginWithEmailPassword = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    return {
      success: true,
      user: {
        uid: user.uid,
        name: user.displayName || email.split("@")[0],
        email: user.email,
      },
    };
  } catch (error) {
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
      try {
        const newResult = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = newResult.user;
        return {
          success: true,
          isNewAccount: true,
          user: {
            uid: newUser.uid,
            name: newUser.displayName || email.split("@")[0],
            email: newUser.email,
          },
        };
      } catch (signupErr) {
        return {
          success: false,
          error: signupErr.message || "Failed to authenticate or register user",
          code: signupErr.code,
        };
      }
    }
    return {
      success: false,
      error: error.message || "Authentication failed",
      code: error.code,
    };
  }
};

/**
 * Sign out current Firebase session
 */
export const logoutFirebase = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Firebase Logout Error:", error);
    return { success: false, error: error.message };
  }
};

export { app, auth, analytics, googleProvider };
