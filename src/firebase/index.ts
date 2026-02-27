'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Initializes Firebase SDKs for the application.
 * Ensures initialization happens only once.
 */
export function initializeFirebase() {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;
  try {
    // Attempt to initialize via environment variables (App Hosting)
    firebaseApp = initializeApp();
  } catch (e) {
    // Fallback to local config for development
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

/**
 * Returns strongly typed SDK instances.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
