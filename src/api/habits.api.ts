import { apiClient } from './client';
import { ApiResponse, Habit, CreateHabitPayload, UpdateHabitPayload, CheckInPayload } from '@/types';

export const habitsApi = {
  list() {
    return apiClient.get<ApiResponse<Habit[]>>('/habits');
  },

  create(payload: CreateHabitPayload) {
    return apiClient.post<ApiResponse<Habit>>('/habits', payload);
  },

  update(id: string, payload: UpdateHabitPayload) {
    return apiClient.patch<ApiResponse<Habit>>(`/habits/${id}`, payload);
  },

  delete(id: string) {
    return apiClient.delete<ApiResponse<null>>(`/habits/${id}`);
  },

  checkIn(id: string, payload: CheckInPayload) {
    return apiClient.post<ApiResponse<Habit>>(`/habits/${id}/check-in`, payload);
  },
};
