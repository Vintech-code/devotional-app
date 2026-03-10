/**
 * Accountability Partner Service — multi-partner + friend-request flow
 *
 * Firestore structure:
 *   publicProfiles/{uid}            -- public stats (readable by anyone)
 *   partnerRequests/{fromUid_toUid} -- one pending request per pair
 *   partnerConnections/{uid}        -- { partners: PartnerConnection[] }
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function genCode(len = 6): string {
  return Array.from({ length: len }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
}

export interface PublicProfile {
  userId: string; displayName: string; code: string;
  streakCount: number; completedCount: number; lastActivity: number;
  avatarUri?: string;
}

export interface PartnerRequest {
  id: string; fromUid: string; fromName: string; toUid: string; createdAt: number;
}

export interface PartnerConnection {
  uid: string; name: string; connectedAt: number;
}

export async function getOrCreatePartnerCode(userId: string, displayName: string): Promise<string> {
  const ref = doc(db, 'publicProfiles', userId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().code) return snap.data().code as string;
  const code = genCode();
  await setDoc(ref, { userId, displayName, code, streakCount: 0, completedCount: 0, lastActivity: Date.now() }, { merge: true });
  return code;
}

export async function getPartnerStats(partnerUid: string): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(db, 'publicProfiles', partnerUid));
  return snap.exists() ? (snap.data() as PublicProfile) : null;
}

export async function syncPublicStats(userId: string, streakCount: number, completedCount: number, avatarUri?: string): Promise<void> {
  await setDoc(doc(db, 'publicProfiles', userId), { streakCount, completedCount, lastActivity: Date.now(), ...(avatarUri !== undefined ? { avatarUri } : {}) }, { merge: true });
}

export async function sendPartnerRequest(fromUid: string, fromName: string, toCode: string): Promise<'ok'|'not_found'|'already_sent'|'self'|'already_partners'> {
  const q = query(collection(db, 'publicProfiles'), where('code', '==', toCode.trim().toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return 'not_found';
  const toUid = snap.docs[0].data().userId as string;
  if (toUid === fromUid) return 'self';
  const myConns = await getMyPartners(fromUid);
  if (myConns.some((c) => c.uid === toUid)) return 'already_partners';
  const reqRef = doc(db, 'partnerRequests', fromUid + '_' + toUid);
  const reqSnap = await getDoc(reqRef);
  if (reqSnap.exists()) return 'already_sent';
  await setDoc(reqRef, { fromUid, fromName, toUid, createdAt: Date.now() });
  return 'ok';
}

export async function getIncomingRequests(uid: string): Promise<PartnerRequest[]> {
  const q = query(collection(db, 'partnerRequests'), where('toUid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PartnerRequest));
}

export async function acceptRequest(request: PartnerRequest, myName: string): Promise<void> {
  const now = Date.now();
  await Promise.all([
    _addPartner(request.toUid,   { uid: request.fromUid, name: request.fromName, connectedAt: now }),
    _addPartner(request.fromUid, { uid: request.toUid,   name: myName,           connectedAt: now }),
    deleteDoc(doc(db, 'partnerRequests', request.id)),
  ]);
}

export async function rejectRequest(id: string): Promise<void> {
  await deleteDoc(doc(db, 'partnerRequests', id));
}

async function _addPartner(uid: string, conn: PartnerConnection): Promise<void> {
  const ref = doc(db, 'partnerConnections', uid);
  const snap = await getDoc(ref);
  const existing: PartnerConnection[] = snap.exists() ? (snap.data().partners ?? []) : [];
  if (!existing.some((p) => p.uid === conn.uid)) {
    await setDoc(ref, { partners: [...existing, conn] }, { merge: true });
  }
}

export async function getMyPartners(uid: string): Promise<PartnerConnection[]> {
  const snap = await getDoc(doc(db, 'partnerConnections', uid));
  if (!snap.exists()) return [];
  return (snap.data().partners ?? []) as PartnerConnection[];
}

export async function removePartner(myUid: string, partnerUid: string): Promise<void> {
  const ref = doc(db, 'partnerConnections', myUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const updated = (snap.data().partners as PartnerConnection[]).filter((p) => p.uid !== partnerUid);
  await setDoc(ref, { partners: updated }, { merge: true });
}
