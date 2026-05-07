import { tasksApi, habitsApi } from '@/api';
import { syncQueueStorage, tasksStorage, habitsStorage } from '@/storage';
import { QueuedAction, CreateTaskPayload, UpdateTaskPayload, CreateHabitPayload, UpdateHabitPayload, CheckInPayload } from '@/types';
import { SYNC_MAX_RETRIES } from '@/constants';
import { queryClient } from '@/query';
import { QUERY_KEYS } from '@/constants';

let isSyncing = false;

function cast<T>(value: unknown): T {
  return value as T;
}

async function executeAction(action: QueuedAction): Promise<void> {
  const { type } = action;
  const p = action.payload as unknown;

  switch (type) {
    case 'task:create': {
      const res = await tasksApi.create(cast<CreateTaskPayload>(p));
      tasksStorage.upsert(res.data.data!);
      break;
    }
    case 'task:update': {
      const { id, ...rest } = cast<{ id: string } & UpdateTaskPayload>(p);
      const res = await tasksApi.update(id, rest);
      tasksStorage.upsert(res.data.data!);
      break;
    }
    case 'task:delete': {
      const { id } = cast<{ id: string }>(p);
      await tasksApi.delete(id);
      tasksStorage.remove(id);
      break;
    }
    case 'habit:create': {
      const res = await habitsApi.create(cast<CreateHabitPayload>(p));
      habitsStorage.upsert(res.data.data!);
      break;
    }
    case 'habit:update': {
      const { id, ...rest } = cast<{ id: string } & UpdateHabitPayload>(p);
      const res = await habitsApi.update(id, rest);
      habitsStorage.upsert(res.data.data!);
      break;
    }
    case 'habit:delete': {
      const { id } = cast<{ id: string }>(p);
      await habitsApi.delete(id);
      habitsStorage.remove(id);
      break;
    }
    case 'habit:check-in': {
      const { id, ...rest } = cast<{ id: string } & CheckInPayload>(p);
      const res = await habitsApi.checkIn(id, rest);
      habitsStorage.upsert(res.data.data!);
      break;
    }
    default:
      break;
  }
}

export async function runSyncQueue(): Promise<void> {
  if (isSyncing) return;

  const queue = syncQueueStorage.getAll();
  if (queue.length === 0) return;

  isSyncing = true;

  try {
    for (const action of queue) {
      if (action.retryCount >= SYNC_MAX_RETRIES) {
        syncQueueStorage.dequeue(action.id);
        continue;
      }

      try {
        await executeAction(action);
        syncQueueStorage.dequeue(action.id);
      } catch {
        syncQueueStorage.incrementRetry(action.id);
      }
    }
  } finally {
    isSyncing = false;
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits });
  }
}

export function getPendingCount(): number {
  return syncQueueStorage.size();
}
