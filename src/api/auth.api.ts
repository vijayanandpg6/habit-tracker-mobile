import { apiClient } from './client';
import {
  ApiResponse,
  SignupPayload,
  LoginPayload,
  VerifyEmailPayload,
  LoginResponse,
  SignupResponse,
  User,
} from '@/types';

export const authApi = {
  signup(payload: SignupPayload) {
    return apiClient.post<ApiResponse<SignupResponse>>('/auth/signup', payload);
  },

  login(payload: LoginPayload) {
    return apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
  },

  verifyEmail(payload: VerifyEmailPayload) {
    return apiClient.post<ApiResponse<{ email: string }>>('/auth/verify-email', payload);
  },

  getMe() {
    return apiClient.get<ApiResponse<User>>('/auth/me');
  },
};
