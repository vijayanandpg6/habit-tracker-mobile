import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'habit-tracker' });

export function storageGet<T>(key: string): T | null {
  const raw = storage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageSet<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function storageDelete(key: string): void {
  storage.remove(key);
}
