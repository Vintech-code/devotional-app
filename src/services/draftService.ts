import AsyncStorage from '@react-native-async-storage/async-storage';
import { getActiveUid } from './storageService';

function draftKey(scope: string): string {
  const uid = getActiveUid();
  return uid ? `@devotional/draft/${scope}/${uid}` : `@devotional/draft/${scope}`;
}

export async function loadDraft<T>(scope: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(draftKey(scope));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function saveDraft<T>(scope: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(draftKey(scope), JSON.stringify(value));
  } catch {
    // Ignore draft save failures so journaling never blocks.
  }
}

export async function clearDraft(scope: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(draftKey(scope));
  } catch {
    // Ignore draft clear failures.
  }
}

export async function hasAnyDraft(): Promise<boolean> {
  try {
    const uid = getActiveUid();
    const keys = await AsyncStorage.getAllKeys();
    if (uid) {
      return keys.some((k) => k.startsWith('@devotional/draft/') && k.endsWith(`/${uid}`));
    }
    return keys.some((k) => k.startsWith('@devotional/draft/'));
  } catch {
    return false;
  }
}
