import { Habit } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { storageGet, storageSet, storageDelete } from './mmkv';

export const habitsStorage = {
  getAll(): Habit[] {
    return storageGet<Habit[]>(STORAGE_KEYS.HABITS_CACHE) ?? [];
  },

  saveAll(habits: Habit[]): void {
    storageSet(STORAGE_KEYS.HABITS_CACHE, habits);
  },

  upsert(habit: Habit): void {
    const existing = this.getAll();
    const idx = existing.findIndex((h) => h._id === habit._id);
    if (idx >= 0) {
      existing[idx] = habit;
    } else {
      existing.unshift(habit);
    }
    this.saveAll(existing);
  },

  remove(id: string): void {
    const existing = this.getAll();
    this.saveAll(existing.filter((h) => h._id !== id));
  },

  getLastSynced(): string | null {
    return storageGet<string>(STORAGE_KEYS.LAST_SYNCED_HABITS);
  },

  setLastSynced(iso: string): void {
    storageSet(STORAGE_KEYS.LAST_SYNCED_HABITS, iso);
  },

  clear(): void {
    storageDelete(STORAGE_KEYS.HABITS_CACHE);
    storageDelete(STORAGE_KEYS.LAST_SYNCED_HABITS);
  },
};
