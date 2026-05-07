import { authApi } from '@/api';
import { authStorage, tasksStorage, habitsStorage, syncQueueStorage } from '@/storage';
import { AuthSession, LoginPayload, SignupPayload, VerifyEmailPayload } from '@/types';
import { queryClient } from '@/query';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const response = await authApi.login(payload);
    const data = response.data.data!;
    const session: AuthSession = { token: data.token, user: data.user };
    authStorage.saveSession(session);
    return session;
  },

  async signup(payload: SignupPayload) {
    const response = await authApi.signup(payload);
    return response.data.data!;
  },

  async verifyEmail(payload: VerifyEmailPayload) {
    const response = await authApi.verifyEmail(payload);
    return response.data.data!;
  },

  async getMe() {
    const response = await authApi.getMe();
    return response.data.data!;
  },

  logout() {
    authStorage.clearSession();
    tasksStorage.clear();
    habitsStorage.clear();
    syncQueueStorage.clear();
    queryClient.clear();
  },

  getSession(): AuthSession | null {
    return authStorage.getSession();
  },
};
