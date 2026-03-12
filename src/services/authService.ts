/**
 * Authentication service — wraps Firebase Auth and native Google Sign-In.
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  getAdditionalUserInfo,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { auth } from './firebase';

// ─── Configure once at module load ───────────────────────────────────────────
// Wrapped in try-catch: GoogleSignin requires a native binary and is not
// available in Expo Go. The app functions normally for email auth in Expo Go;
// Google Sign-In only works in a custom dev-client / production build.
try {
  GoogleSignin.configure({
    webClientId: '1072445897574-hqq0krh696nuoehh21th8p6llpu29n3r.apps.googleusercontent.com',
  });
} catch {
  // Native module unavailable (Expo Go) — Google Sign-In will be disabled.
}

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

/** Exchange a Google ID token for a Firebase User. */
export async function signInWithGoogleIdToken(idToken: string): Promise<User> {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const credential = await signInWithCredential(auth, googleCredential);
  return credential.user;
}

/**
 * Full native Google Sign-In flow.
 * Always shows the account picker (signs out of the Google native client first).
 * Returns { user, isNewUser } on success, or null if the user cancelled.
 * Throws on network error or misconfiguration.
 */
export async function signInWithGoogle(): Promise<{ user: User; isNewUser: boolean } | null> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Clear the cached Google account so the account picker always appears.
    try { await GoogleSignin.signOut(); } catch { /* ignore — native client may not have an account */ }
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null; // user cancelled
    const idToken = response.data.idToken;
    if (!idToken) throw new Error('No ID token returned from Google.');
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const credential = await signInWithCredential(auth, googleCredential);
    const additionalInfo = getAdditionalUserInfo(credential);
    return { user: credential.user, isNewUser: additionalInfo?.isNewUser ?? false };
  } catch (err) {
    if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) return null;
    // Re-throw real errors (network, misconfiguration, etc)
    throw err;
  }
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

export { isErrorWithCode, statusCodes };
