import { SyncStatus } from './sync';

export interface Habit {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  streakCount: number;
  lastCompletedAt?: string;
  completionHistory: string[];
  clientUpdatedAt: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: SyncStatus;
}

export interface CreateHabitPayload {
  title: string;
  description?: string;
  clientUpdatedAt: string;
}

export interface UpdateHabitPayload {
  title?: string;
  description?: string;
  clientUpdatedAt?: string;
}

export interface CheckInPayload {
  clientUpdatedAt: string;
}
