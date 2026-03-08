/**
 * Authentication service — wraps Firebase Auth and expo-auth-session Google OAuth.
 *
 * Google Sign-In setup:
 *  1. In your Firebase console → Authentication → Sign-in method → Google → Enable it.
 *  2. In Google Cloud Console → OAuth 2.0 Client IDs, copy your Web, Android, and iOS client IDs.
 *  3. Paste them into GOOGLE_CONFIG below.
 *  4. In app.json, make sure `expo.scheme` is set (e.g. "devotionalapp") — it is used as the OAuth redirect.
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
  type User,
} from 'firebase/auth';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { auth } from './firebase';

// ─── Must be called once at app startup so the in-app browser can close itself ─
WebBrowser.maybeCompleteAuthSession();

// ─── Replace with your Google OAuth client IDs ───────────────────────────────
export const GOOGLE_CONFIG = {
  webClientId:     'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_GOOGLE_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  iosClientId:     'YOUR_GOOGLE_IOS_CLIENT_ID.apps.googleusercontent.com',
} as const;
// ─────────────────────────────────────────────────────────────────────────────

// Re-export the hook so screens can simply import it from here
export { Google };

/** Sign in with email + password. Throws a Firebase AuthError on failure. */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/** Create account with email + password and set the display name. */
export async function createUserWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential.user;
}

/** Exchange a Google ID token (from expo-auth-session) for a Firebase User. */
export async function signInWithGoogleIdToken(idToken: string): Promise<User> {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const credential = await signInWithCredential(auth, googleCredential);
  return credential.user;
}

/** Sign the current user out. */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Returns a human-readable message from a Firebase AuthError code.
 * Falls back to the raw message if the code is unrecognised.
 */
export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/user-not-found':        'No account found with that email.',
    'auth/wrong-password':        'Incorrect password. Please try again.',
    'auth/invalid-email':         'That email address is not valid.',
    'auth/email-already-in-use':  'An account with that email already exists.',
    'auth/weak-password':         'Password must be at least 6 characters.',
    'auth/too-many-requests':     'Too many attempts. Please try again later.',
    'auth/network-request-failed':'Network error. Check your connection.',
    'auth/invalid-credential':    'Incorrect email or password.',
  };
  return map[code] ?? (error as Error)?.message ?? 'Something went wrong. Please try again.';
}

// ─── Redirect URI helper (used by expo-auth-session internally) ──────────────
export const googleRedirectUri = makeRedirectUri({ scheme: 'devotionalapp' });
