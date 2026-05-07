export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed';

export type QueuedActionType =
  | 'task:create'
  | 'task:update'
  | 'task:delete'
  | 'habit:create'
  | 'habit:update'
  | 'habit:delete'
  | 'habit:check-in';

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  entity: 'task' | 'habit';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

export type GlobalSyncStatus = 'idle' | 'syncing' | 'error';
