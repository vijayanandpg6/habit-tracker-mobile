import { Task } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { storageGet, storageSet, storageDelete } from './mmkv';

export const tasksStorage = {
  getAll(): Task[] {
    return storageGet<Task[]>(STORAGE_KEYS.TASKS_CACHE) ?? [];
  },

  saveAll(tasks: Task[]): void {
    storageSet(STORAGE_KEYS.TASKS_CACHE, tasks);
  },

  upsert(task: Task): void {
    const existing = this.getAll();
    const idx = existing.findIndex((t) => t._id === task._id);
    if (idx >= 0) {
      existing[idx] = task;
    } else {
      existing.unshift(task);
    }
    this.saveAll(existing);
  },

  remove(id: string): void {
    const existing = this.getAll();
    this.saveAll(existing.filter((t) => t._id !== id));
  },

  getLastSynced(): string | null {
    return storageGet<string>(STORAGE_KEYS.LAST_SYNCED_TASKS);
  },

  setLastSynced(iso: string): void {
    storageSet(STORAGE_KEYS.LAST_SYNCED_TASKS, iso);
  },

  clear(): void {
    storageDelete(STORAGE_KEYS.TASKS_CACHE);
    storageDelete(STORAGE_KEYS.LAST_SYNCED_TASKS);
  },
};
