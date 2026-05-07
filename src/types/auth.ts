export interface User {
  id: string;
  email: string;
  isEmailVerified?: boolean;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface SignupPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupResponse {
  id: string;
  email: string;
}
