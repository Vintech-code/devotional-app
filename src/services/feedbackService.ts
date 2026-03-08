/**
 * Feedback & Admin service — Firestore-backed.
 *
 * Collections:
 *  feedbacks/{id}  — user-submitted feedback messages + admin replies
 *  users/{uid}     — user metadata (email, name, disabled flag) merged with
 *                    local-data snapshots pushed by syncService
 *
 * Required Firestore security rules are defined in /firestore.rules.
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedbackCategory = 'bug' | 'suggestion' | 'question' | 'other';

export interface FeedbackItem {
  id: string;
  uid: string;
  userName: string;
  userEmail: string;
  category: FeedbackCategory;
  subject: string;
  message: string;
  createdAt: number;
  status: 'pending' | 'replied';
  adminReply: string | null;
  repliedAt: number | null;
}

export interface AdminUserRecord {
  uid: string;
  name: string;
  email: string;
  registeredAt: number;
  disabled: boolean;
  /** Derived from the synced profile data stored by syncService. */
  entryCount: number;
}

// ─── Collection identifiers ───────────────────────────────────────────────────

const COL_FEEDBACKS = 'feedbacks';
const COL_USERS     = 'users';

// ─── User-facing ──────────────────────────────────────────────────────────────

/** Submit a new feedback message. Requires network connectivity. */
export async function submitFeedback(
  uid: string,
  userName: string,
  userEmail: string,
  category: FeedbackCategory,
  subject: string,
  message: string,
): Promise<void> {
  await addDoc(collection(db, COL_FEEDBACKS), {
    uid,
    userName,
    userEmail,
    category,
    subject:  subject.trim(),
    message:  message.trim(),
    createdAt: Date.now(),
    status:   'pending' as const,
    adminReply: null,
    repliedAt:  null,
  });
}

/**
 * Fetch all feedbacks for a given user, newest first.
 * No composite index needed — ordering is done client-side.
 */
export async function getUserFeedbacks(uid: string): Promise<FeedbackItem[]> {
  const q    = query(collection(db, COL_FEEDBACKS), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as FeedbackItem))
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Admin-facing ─────────────────────────────────────────────────────────────

/** Admin: fetch all feedbacks ordered by newest first. */
export async function getAllFeedbacks(): Promise<FeedbackItem[]> {
  const q    = query(collection(db, COL_FEEDBACKS), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FeedbackItem));
}

/** Admin: post a reply to a feedback message. */
export async function replyToFeedback(feedbackId: string, reply: string): Promise<void> {
  await updateDoc(doc(db, COL_FEEDBACKS, feedbackId), {
    adminReply: reply.trim(),
    repliedAt:  Date.now(),
    status:     'replied' as const,
  });
}

/** Admin: list all registered users. */
export async function getAllUsers(): Promise<AdminUserRecord[]> {
  const snap = await getDocs(collection(db, COL_USERS));
  return snap.docs
    .map((d) => {
      const data = d.data();
      // entryCount is derived from synced local-data snapshots
      const soap   = (data.soapEntries   as unknown[])?.length ?? 0;
      const mcpwa  = (data.mcpwaEntries  as unknown[])?.length ?? 0;
      const sword  = (data.swordEntries  as unknown[])?.length ?? 0;
      const sermon = (data.sermonNotes   as unknown[])?.length ?? 0;
      return {
        uid:          d.id,
        name:         (data.profile?.name as string)  ?? data.name  ?? 'Unknown',
        email:        (data.email as string) ?? '',
        registeredAt: (data.registeredAt as number) ?? (data._updatedAt as number) ?? 0,
        disabled:     data.disabled === true,
        entryCount:   soap + mcpwa + sword + sermon,
      } as AdminUserRecord;
    })
    .filter((u) => u.email !== '');
}

/** Admin: enable or disable a user account. */
export async function toggleUserDisabled(uid: string, disabled: boolean): Promise<void> {
  await updateDoc(doc(db, COL_USERS, uid), { disabled });
}

/**
 * Check if the user's account has been disabled by the admin.
 * Returns false on any error so a network failure never blocks sign-in.
 */
export async function checkIfDisabled(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, COL_USERS, uid));
    return snap.exists() && snap.data().disabled === true;
  } catch {
    return false;
  }
}

/**
 * Upsert user metadata so the admin can see a full user roster.
 * Should be called (fire-and-forget) on every successful sign-in.
 */
export async function registerOrUpdateUserMeta(
  uid: string,
  name: string,
  email: string,
): Promise<void> {
  await setDoc(
    doc(db, COL_USERS, uid),
    { name, email, registeredAt: Date.now() },
    { merge: true },
  );
}
