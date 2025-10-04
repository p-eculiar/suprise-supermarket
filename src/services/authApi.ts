import { api } from './api';
import { User } from '../contexts/AuthContext';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<{ data: AuthResponse }> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response;
  },

  // Register new user
  register: async (userData: RegisterData): Promise<{ data: AuthResponse }> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response;
  },

  // Get current user
  getCurrentUser: async (token: string): Promise<{ data: User }> => {
    const response = await api.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  },

  // Update user profile
  updateProfile: async (
    userId: string, 
    userData: Partial<RegisterData>, 
    token: string
  ): Promise<{ data: User }> => {
    const response = await api.put<User>(`/users/${userId}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  },

  // Change password
  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string,
    token: string
  ): Promise<void> => {
    await api.post(
      `/users/${userId}/change-password`,
      { currentPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<void> => {
    await api.post('/auth/resend-verification', { email });
  },

  // Logout (client-side only)
  logout: (): void => {
    // This is handled client-side by removing the token
  },
};
