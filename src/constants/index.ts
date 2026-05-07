export const API_BASE_URL = 'https://habit-tracker-api-hiis.onrender.com/api/v1';

export const QUERY_KEYS = {
  tasks: ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,
  habits: ['habits'] as const,
  habit: (id: string) => ['habits', id] as const,
  me: ['me'] as const,
};

export const STORAGE_KEYS = {
  AUTH_SESSION: 'auth_session',
  TASKS_CACHE: 'tasks_cache',
  HABITS_CACHE: 'habits_cache',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNCED_TASKS: 'last_synced_tasks',
  LAST_SYNCED_HABITS: 'last_synced_habits',
};

export const SYNC_MAX_RETRIES = 3;
export const SYNC_RETRY_DELAY_MS = 2000;
