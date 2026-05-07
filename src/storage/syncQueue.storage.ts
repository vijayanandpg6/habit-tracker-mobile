import { QueuedAction } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { storageGet, storageSet } from './mmkv';

export const syncQueueStorage = {
  getAll(): QueuedAction[] {
    return storageGet<QueuedAction[]>(STORAGE_KEYS.SYNC_QUEUE) ?? [];
  },

  enqueue(action: QueuedAction): void {
    const queue = this.getAll();
    queue.push(action);
    storageSet(STORAGE_KEYS.SYNC_QUEUE, queue);
  },

  dequeue(id: string): void {
    const queue = this.getAll().filter((a) => a.id !== id);
    storageSet(STORAGE_KEYS.SYNC_QUEUE, queue);
  },

  incrementRetry(id: string): void {
    const queue = this.getAll().map((a) =>
      a.id === id ? { ...a, retryCount: a.retryCount + 1 } : a,
    );
    storageSet(STORAGE_KEYS.SYNC_QUEUE, queue);
  },

  clear(): void {
    storageSet(STORAGE_KEYS.SYNC_QUEUE, []);
  },

  size(): number {
    return this.getAll().length;
  },
};
