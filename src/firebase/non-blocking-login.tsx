'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  UserCredential,
  signOut,
} from 'firebase/auth';

/** 
 * Note: These are non-blocking calls, but they return the promise 
 * so callers can catch errors and show UI feedback (like toasts).
 */

/** Initiate anonymous sign-in. */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** 
 * Initiate Google sign-in. 
 * Using Popup as a fallback if Redirect is failing in current environment.
 */
export function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential | void> {
  const provider = new GoogleAuthProvider();
  // We prefer popup in some dev environments as it avoids the 403 redirect URI issue
  return signInWithPopup(authInstance, provider).catch((error) => {
    if (error.code === 'auth/popup-blocked') {
      // Fallback to redirect if popup is blocked
      return signInWithRedirect(authInstance, provider);
    }
    throw error;
  });
}

/** Initiate email/password sign-up. */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate sign out. */
export function initiateSignOut(authInstance: Auth): Promise<void> {
  return signOut(authInstance);
}