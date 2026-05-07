import { SyncStatus } from './sync';

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  clientUpdatedAt: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: SyncStatus;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  clientUpdatedAt: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  clientUpdatedAt?: string;
}
