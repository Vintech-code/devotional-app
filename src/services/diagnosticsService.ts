import * as Updates from 'expo-updates';
import { auth } from './firebase';
import { getAnalyticsSummary } from './analyticsService';
import { useAppStore } from '../store/useAppStore';

export interface DiagnosticsSnapshot {
  appVersion: string;
  runtimeVersion: string;
  authState: 'signed-in' | 'signed-out';
  authUid: string;
  syncQueue: string;
  localCounts: {
    soap: number;
    mcpwa: number;
    sword: number;
    pray: number;
    acts: number;
    sermon: number;
  };
  analytics: {
    totalEvents: number;
    saveFailCount: number;
    syncFailCount: number;
    partnerConnectFailCount: number;
    methodDropoff: Record<string, number>;
  };
}

export async function getDiagnosticsSnapshot(): Promise<DiagnosticsSnapshot> {
  const s = useAppStore.getState();
  const analytics = await getAnalyticsSummary();

  return {
    appVersion: Updates.createdAt ? new Date(Updates.createdAt).toISOString().slice(0, 10) : 'unknown',
    runtimeVersion: String(Updates.runtimeVersion ?? 'unknown'),
    authState: auth.currentUser ? 'signed-in' : 'signed-out',
    authUid: auth.currentUser?.uid ?? '-',
    syncQueue: 'Firestore offline queue: managed internally',
    localCounts: {
      soap: s.soapEntries.length,
      mcpwa: s.mcpwaEntries.length,
      sword: s.swordEntries.length,
      pray: s.prayEntries.length,
      acts: s.actsEntries.length,
      sermon: s.sermonNotes.length,
    },
    analytics: {
      totalEvents: analytics.totalEvents,
      saveFailCount: analytics.saveFailCount,
      syncFailCount: analytics.syncFailCount,
      partnerConnectFailCount: analytics.partnerConnectFailCount,
      methodDropoff: analytics.methodDropoff,
    },
  };
}
