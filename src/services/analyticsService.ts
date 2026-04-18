import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveUid } from './storageService';

const KEY = '@devotional/analytics_events';
const MAX_EVENTS = 300;

export type AnalyticsEventName =
  | 'create_note'
  | 'save_success'
  | 'save_fail'
  | 'sync_fail'
  | 'partner_connect_fail'
  | 'method_open'
  | 'method_dropoff';

export interface AnalyticsEvent {
  id: string;
  uid: string | null;
  name: AnalyticsEventName;
  method?: string;
  context?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: number;
}

function mkId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readEvents(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

async function writeEvents(events: AnalyticsEvent[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // Never block UX for analytics writes.
  }
}

export async function trackEvent(
  name: AnalyticsEventName,
  payload?: {
    method?: string;
    context?: string;
    metadata?: Record<string, string | number | boolean>;
  },
): Promise<void> {
  const events = await readEvents();
  events.push({
    id: mkId(),
    uid: getActiveUid(),
    name,
    method: payload?.method,
    context: payload?.context,
    metadata: payload?.metadata,
    createdAt: Date.now(),
  });
  await writeEvents(events);
}

export async function getAnalyticsSummary(): Promise<{
  totalEvents: number;
  createCount: number;
  saveSuccessCount: number;
  saveFailCount: number;
  syncFailCount: number;
  partnerConnectFailCount: number;
  methodDropoff: Record<string, number>;
}> {
  const events = await readEvents();
  const opens: Record<string, number> = {};
  const saves: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.method) return;
    if (e.name === 'method_open') opens[e.method] = (opens[e.method] ?? 0) + 1;
    if (e.name === 'save_success') saves[e.method] = (saves[e.method] ?? 0) + 1;
  });
  const methodDropoff: Record<string, number> = {};
  const methods = new Set<string>([...Object.keys(opens), ...Object.keys(saves)]);
  methods.forEach((m) => {
    methodDropoff[m] = Math.max(0, (opens[m] ?? 0) - (saves[m] ?? 0));
  });

  return {
    totalEvents: events.length,
    createCount: events.filter((e) => e.name === 'create_note').length,
    saveSuccessCount: events.filter((e) => e.name === 'save_success').length,
    saveFailCount: events.filter((e) => e.name === 'save_fail').length,
    syncFailCount: events.filter((e) => e.name === 'sync_fail').length,
    partnerConnectFailCount: events.filter((e) => e.name === 'partner_connect_fail').length,
    methodDropoff,
  };
}
