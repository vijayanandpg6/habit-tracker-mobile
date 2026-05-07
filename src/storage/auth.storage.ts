import { AuthSession } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { storageGet, storageSet, storageDelete } from './mmkv';

export const authStorage = {
  getSession(): AuthSession | null {
    return storageGet<AuthSession>(STORAGE_KEYS.AUTH_SESSION);
  },

  saveSession(session: AuthSession): void {
    storageSet(STORAGE_KEYS.AUTH_SESSION, session);
  },

  clearSession(): void {
    storageDelete(STORAGE_KEYS.AUTH_SESSION);
  },

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  },
};
