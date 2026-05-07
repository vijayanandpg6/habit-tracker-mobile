import { apiClient } from './client';
import { ApiResponse, Task, CreateTaskPayload, UpdateTaskPayload } from '@/types';

export const tasksApi = {
  list() {
    return apiClient.get<ApiResponse<Task[]>>('/tasks');
  },

  create(payload: CreateTaskPayload) {
    return apiClient.post<ApiResponse<Task>>('/tasks', payload);
  },

  update(id: string, payload: UpdateTaskPayload) {
    return apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
  },

  delete(id: string) {
    return apiClient.delete<ApiResponse<null>>(`/tasks/${id}`);
  },
};
