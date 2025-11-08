/**
 * This file is not currently used - we use Supabase directly via AuthContext
 * Keeping for potential future REST API integration
 */

import { User } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
    // Use Supabase instead
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return { data: { token: data.session?.access_token || '', user: data.user as User } };
  },

  // Register new user
  register: async (userData: RegisterData): Promise<{ data: AuthResponse }> => {
    // Use Supabase instead
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    if (error) throw error;
    return { data: { token: data.session?.access_token || '', user: data.user as User } };
  },

  // Get current user
  getCurrentUser: async (token: string): Promise<{ data: User }> => {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return { data: data.user as User };
  },

  // Update user profile
  updateProfile: async (
    userId: string, 
    userData: Partial<RegisterData>, 
    token: string
  ): Promise<{ data: User }> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: userData.name })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return { data: data as unknown as User };
  },

  // Change password
  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string,
    token: string
  ): Promise<void> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<void> => {
    // Supabase handles email verification automatically
    console.log('Email verification handled by Supabase');
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
  },

  // Logout (client-side only)
  logout: (): void => {
    // This is handled client-side by removing the token
  },
};
