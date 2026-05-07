import { useState, useCallback } from 'react';
import { authService } from '@/services';
import { AuthSession, LoginPayload, SignupPayload, VerifyEmailPayload } from '@/types';

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuthState() {
  const initial = authService.getSession();
  const [state, setState] = useState<AuthState>({
    session: initial,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (payload: LoginPayload) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const session = await authService.login(payload);
      setState({ session, isLoading: false, error: null });
      return session;
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Login failed';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const result = await authService.signup(payload);
      setState((s) => ({ ...s, isLoading: false }));
      return result;
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Signup failed';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, []);

  const verifyEmail = useCallback(async (payload: VerifyEmailPayload) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const result = await authService.verifyEmail(payload);
      setState((s) => ({ ...s, isLoading: false }));
      return result;
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Verification failed';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setState({ session: null, isLoading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    session: state.session,
    isAuthenticated: !!state.session,
    isLoading: state.isLoading,
    error: state.error,
    login,
    signup,
    verifyEmail,
    logout,
    clearError,
  };
}
