import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import toast from '../components/common/Toast';

export interface User extends SupabaseUser {
  full_name?: string;
  avatar_url?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, emailNotifications?: boolean) => Promise<void>;
  logout: () => void;
  updateProfile: (userId: string, userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      // Extract full_name from user_metadata when loading session
      if (data.session?.user) {
        setUser({
          ...data.session.user,
          full_name: data.session.user.user_metadata?.full_name,
          avatar_url: data.session.user.user_metadata?.avatar_url
        } as User);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ? { ...session.user, full_name: session.user.user_metadata.full_name, avatar_url: session.user.user_metadata.avatar_url } : null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
      
      // Show specific toast for email not confirmed
      if (error.message.includes('Email not confirmed')) {
        toast.emailNotConfirmed();
      } else {
        toast.error(error.message);
      }
      
      throw error;
    }
    
    // Success toast with user name
    const userName = data.user?.user_metadata?.full_name;
    toast.loginSuccess(userName);
    
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string, emailNotifications: boolean = true) => {
    setIsLoading(true);
    setError(null);
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email, 
      password, 
      options: { 
        data: { 
          full_name: name,
          email_notifications: emailNotifications 
        } 
      }
    });
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
      toast.error(error.message);
      throw error;
    }
    
    // Create profile in database if user was created
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: name,
            email_notifications: emailNotifications,
          }
        ]);
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw here - user is created, just log the error
      }
      
      // Update local user state with full_name
      setUser({ 
        ...data.user, 
        full_name: name,
        avatar_url: undefined 
      } as User);
      
      // Show success toast with email verification reminder
      toast.registerSuccess(name);
    }
    
    setIsLoading(false);
  };

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    toast.logoutSuccess();
  }, []);

  // Refresh user data from Supabase
  const refreshUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (data.user) {
        setUser({
          ...data.user,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url
        } as User);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Update profile (updates both auth metadata and local state)
  const updateProfile = async (userId: string, userData: Partial<User>) => {
    if (!user) return;
    // Just update local state - actual update should be done by calling component
    setUser({ ...user, ...userData });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Implementation for changing password
    return Promise.resolve();
  };

  const requestPasswordReset = async (email: string) => {
    // Implementation for requesting password reset
    return Promise.resolve();
  };

  const resetPassword = async (token: string, newPassword: string) => {
    // Implementation for resetting password
    return Promise.resolve();
  };

  const verifyEmail = async (token: string) => {
    // Implementation for email verification
    return Promise.resolve();
  };

  const resendVerificationEmail = async (email: string) => {
    // Implementation for resending verification email
    return Promise.resolve();
  };

  const value = {
    user,
    session,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    isAuthenticated: !!user,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
