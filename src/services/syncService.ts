/**
 * Cloud sync service.
 *
 * Architecture:
 *  - PRIMARY store  = AsyncStorage (UID-scoped via storageService) — always works offline.
 *  - SECONDARY store = Firestore — cloud backup / cross-device restore.
 *
 * Writes to Firestore are fire-and-forget.  The Firebase JS SDK queues them
 * internally when the device is offline and flushes automatically once the
 * connection is restored (within the same app session).
 *
 * On every app startup the local snapshot is pushed to Firestore so any
 * entries saved while offline (previous session) are eventually synced.
 *
 * On first sign-in to a NEW device (local is empty), we pull from Firestore
 * to restore the user's data.
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  exportUserData,
  importUserData,
  LocalUserData,
} from './storageService';

// Firestore document path: users/{uid}
function userRef(uid: string) {
  return doc(db, 'users', uid);
}

/** Push the current user's local data to Firestore (fire-and-forget). */
export async function pushToCloud(uid: string): Promise<void> {
  const data = await exportUserData();
  await setDoc(userRef(uid), { ...data, _updatedAt: Date.now() }, { merge: false });
}

/** Pull user data from Firestore and write it to local AsyncStorage. */
export async function pullFromCloud(uid: string): Promise<LocalUserData | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  const { _updatedAt, ...data } = snap.data() as LocalUserData & { _updatedAt?: number };
  return data;
}

/**
 * Called on every successful sign-in /app startup.
 *
 * Strategy:
 *  1. Check if local entries are empty (new device).
 *  2. If yes — pull from Firestore and restore local data.
 *  3. Always push local snapshot to Firestore after hydration so any
 *     offline writes from the previous session are synced up.
 */
export async function syncOnLogin(
  uid: string,
  localIsEmpty: boolean,
  updateStore: (data: LocalUserData) => void,
): Promise<void> {
  try {
    if (localIsEmpty) {
      // New device — try restoring from cloud first
      const cloud = await pullFromCloud(uid);
      if (cloud) {
        await importUserData(cloud);
        updateStore(cloud);
        return; // cloud data is now authoritative; no need to push
      }
    }
    // Always push local → cloud (sends any pending offline writes)
    await pushToCloud(uid);
  } catch {
    // Network unavailable — fail silently; local data is always safe
  }
}

/**
 * Lightweight push after a single write (e.g. new journal entry).
 * Runs async; never throws so it never blocks the UI.
 */
export function syncWrite(uid: string | null): void {
  if (!uid) return;
  pushToCloud(uid).catch(() => {});
}
