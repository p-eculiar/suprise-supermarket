import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import toast from '../components/common/Toast';

export interface User extends SupabaseUser {
  full_name?: string;
  avatar_url?: string;
  role?: string;
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

  // Function to check if email is in admin list
  const isAdminEmail = (email: string): boolean => {
    const adminEmails = [
      process.env.REACT_APP_ADMIN_EMAIL_1,
      process.env.REACT_APP_ADMIN_EMAIL_2,
      // Add more admin emails as needed
    ].filter(Boolean); // Remove undefined/null values
    
    return adminEmails.includes(email);
  };

  // Improved function to get user role with better error handling
  const getUserRole = async (userId: string): Promise<string> => {
    try {
      console.log('🔍 Fetching role for user ID:', userId);
      
      // Check localStorage cache first for immediate role availability
      const cachedRole = localStorage.getItem(`user_role_${userId}`);
      if (cachedRole) {
        console.log('✅ Using cached role:', cachedRole);
        // Still fetch from DB in background to keep cache fresh
        (async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .single();
              
            if (!error && data?.role && data.role !== cachedRole) {
              localStorage.setItem(`user_role_${userId}`, data.role);
              // Update user context if needed
              setUser(prevUser => prevUser ? { ...prevUser, role: data.role } as User : prevUser);
            }
          } catch (err) {
            console.warn('Background role update failed:', err);
          }
        })();
        return cachedRole;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user role:', error);
        // If we can't fetch the role, check if the user's email is in the admin list
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (!userError && userData?.user?.email) {
          const isAdmin = isAdminEmail(userData.user.email);
          const role = isAdmin ? 'admin' : 'customer';
          console.log('ℹ️ Fallback to email check - isAdmin:', isAdmin);
          localStorage.setItem(`user_role_${userId}`, role);
          return role;
        }
        return 'customer';
      }

      const role = data?.role || 'customer';
      console.log('✅ User role fetched:', role);
      // Cache the role for instant access
      localStorage.setItem(`user_role_${userId}`, role);
      return role;
    } catch (error) {
      console.error('💥 Get user role error:', error);
      // If we can't fetch the role, check if the user's email is in the admin list
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError && userData?.user?.email) {
        const isAdmin = isAdminEmail(userData.user.email);
        const role = isAdmin ? 'admin' : 'customer';
        console.log('ℹ️ Fallback to email check - isAdmin:', isAdmin);
        localStorage.setItem(`user_role_${userId}`, role);
        return role;
      }
      return 'customer';
    }
  };

  // Function to set user role during registration
  const setUserRole = async (userId: string, role: string = 'customer'): Promise<void> => {
    try {
      console.log('Setting role for user ID:', userId, 'to:', role);
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.error('Error setting user role:', error);
      } else {
        console.log('User role set successfully');
        // Update cache
        localStorage.setItem(`user_role_${userId}`, role);
      }
    } catch (error) {
      console.error('Set user role error:', error);
    }
  };

  // Improved session refresh function
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      setSession(session);
      
      if (session?.user) {
        // Get user role with caching
        const userRole = await getUserRole(session.user.id);
        
        setUser({
          ...session.user,
          full_name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url,
          role: userRole
        } as User);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error('Session refresh error:', err);
      setError(err.message || 'Failed to refresh session');
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a function to clear all auth-related caches
  const clearAuthCache = useCallback(() => {
    // Clear user role cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user_role_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear other auth-related caches
    localStorage.removeItem('products-cache');
    localStorage.removeItem('categories-cache');
    localStorage.removeItem('user-role-cache');
  }, []);

  useEffect(() => {
    // Initial session load
    refreshSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      setSession(session);
      
      if (session?.user) {
        // Get user role with caching
        getUserRole(session.user.id).then(userRole => {
          setUser({
            ...session.user,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            role: userRole
          } as User);
        });
      } else {
        setUser(null);
        // Clear auth cache when logging out
        clearAuthCache();
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession, clearAuthCache]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add timeout to prevent hanging
      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout')), 10000)
      );
      
      const { data, error } = await Promise.race([
        loginPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
        
        // Remove the email verification check during login
        // Allow users to login regardless of email verification status
        toast.error(error.message);
        throw error;
      }
      
      // Fetch role in parallel (extendable for additional parallel fetches) with timeout
      const userRolePromise = getUserRole(data.user.id);
      const timeoutPromise2 = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User role retrieval timeout')), 5000)
      );
      
      const [userRole] = await Promise.race([
        Promise.all([userRolePromise]),
        timeoutPromise2
      ]) as [string];
      
      // Update user state once
      setUser({
        ...data.user,
        full_name: data.user.user_metadata?.full_name,
        avatar_url: data.user.user_metadata?.avatar_url,
        role: userRole
      } as User);
      
      // Success toast with user name
      const userName = data.user?.user_metadata?.full_name;
      toast.loginSuccess(userName);
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      setIsLoading(false);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, emailNotifications: boolean = true) => {
    setIsLoading(true);
    setError(null);
    
    // Sign up the user (this doesn't automatically log them in)
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
      // Determine role based on email
      const role = isAdminEmail(email) ? 'admin' : 'customer';
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: name,
            email: email, // Add the email here
            email_notifications: emailNotifications,
            role: role // Set role based on email
          }
        ]);
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw here - user is created, just log the error
      } else {
        // Set the role in the profiles table
        await setUserRole(data.user.id, role);
      }
    }
    
    setIsLoading(false);
  };


  const logout = useCallback(async () => {
    // Clear role cache on logout
    if (user?.id) {
      localStorage.removeItem(`user_role_${user.id}`);
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast.logoutSuccess();
  }, [user]);

  // Refresh user data from Supabase
  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (data.user) {
        // Get user role from profiles table with fallback
        let userRole = 'customer';
        try {
          userRole = await getUserRole(data.user.id);
        } catch (roleError) {
          console.error('Error getting user role during refresh:', roleError);
          // Fallback to email check
          if (data.user.email && isAdminEmail(data.user.email)) {
            userRole = 'admin';
          }
        }
        
        const updatedUser = {
          ...data.user,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          role: userRole
        };
        
        console.log('✅ User refreshed:', updatedUser);
        setUser(updatedUser as User);
      }
    } catch (error) {
      console.error('💥 Error refreshing user:', error);
    }
  };

  // Update profile (persist to Supabase auth metadata and profiles table)
  const updateProfile = async (userId: string, userData: Partial<User>) => {
    if (!user) return;

    // Optimistically update local state for responsiveness
    setUser({ ...user, ...userData });

    // Persist to Supabase profiles table
    try {
      const profileUpdates: Record<string, any> = {};
      if (typeof userData.full_name !== 'undefined') {
        profileUpdates.full_name = userData.full_name;
      }
      if (typeof (userData as any).avatar_url !== 'undefined') {
        profileUpdates.avatar_url = (userData as any).avatar_url;
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            ...profileUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
        if (profileError) {
          console.error('Error updating profiles row:', profileError);
        }
      }

      // Also update auth user metadata so session reflects new data
      const authMetadataUpdates: Record<string, any> = {};
      if (typeof userData.full_name !== 'undefined') {
        authMetadataUpdates.full_name = userData.full_name;
      }
      if (typeof (userData as any).avatar_url !== 'undefined') {
        authMetadataUpdates.avatar_url = (userData as any).avatar_url;
      }
      if (Object.keys(authMetadataUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser({
          data: authMetadataUpdates,
        });
        if (authError) {
          console.error('Error updating auth metadata:', authError);
        }
      }
    } catch (e) {
      console.error('updateProfile persistence error:', e);
    }

    // Refresh from server to ensure consistency
    await refreshUser();
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Implementation for changing password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
      return Promise.resolve();
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error(error.message || 'Failed to change password');
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions sent to your email');
      return Promise.resolve();
    } catch (error: any) {
      console.error('Password reset request error:', error);
      setError(error.message || 'Failed to send reset instructions');
      toast.error(error.message || 'Failed to send reset instructions');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For password reset, we use updateUser with the new password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password reset successfully');
      return Promise.resolve();
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password');
      toast.error(error.message || 'Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      // For email verification, we typically don't need to call verifyOtp directly
      // The verification happens when the user clicks the link in their email
      // Supabase handles this automatically
      // We just need to refresh the user data to get the updated email confirmation status
      
      // Refresh the user data after verification
      await refreshUser();
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw error;
    }
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