import { apiAuthPost } from '@/shared/api/client';
import type { User } from '@/shared/types';

interface AuthResponse {
   token: string;
   user: User;
}

interface MessageResponse {
   success: boolean;
   message: string;
}

export const login = (email: string, password: string) =>
   apiAuthPost<AuthResponse>('/api/auth/login', { email, password });

export const signup = (email: string, password: string) =>
   apiAuthPost<AuthResponse>('/api/auth/signup', { email, password });

export const loginWithGoogle = (idToken: string) =>
   apiAuthPost<AuthResponse>('/api/auth/google', { idToken });

export const forgotPassword = (email: string) =>
   apiAuthPost<MessageResponse>('/api/auth/forgot-password', { email });

export const resetPassword = (token: string, password: string) =>
   apiAuthPost<MessageResponse>('/api/auth/reset-password', {
      token,
      password,
   });
