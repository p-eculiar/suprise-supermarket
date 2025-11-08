import React from 'react';
import { Toaster, toast as hotToast } from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';

export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '14px',
          maxWidth: '500px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#6C9A7F',
            secondary: '#fff',
          },
          style: {
            border: '2px solid #6C9A7F',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#E74C3C',
            secondary: '#fff',
          },
          style: {
            border: '2px solid #E74C3C',
          },
        },
        loading: {
          iconTheme: {
            primary: '#FF9800',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

// Custom toast functions with consistent styling
export const toast = {
  success: (message: string) => {
    hotToast.success(message, {
      icon: '✅',
    });
  },
  
  error: (message: string) => {
    hotToast.error(message, {
      icon: '❌',
    });
  },
  
  loading: (message: string) => {
    return hotToast.loading(message, {
      icon: '⏳',
    });
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return hotToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
  
  info: (message: string) => {
    hotToast(message, {
      icon: 'ℹ️',
      style: {
        border: '2px solid #3498DB',
      },
    });
  },
  
  warning: (message: string) => {
    hotToast(message, {
      icon: '⚠️',
      style: {
        border: '2px solid #FF9800',
      },
    });
  },
  
  custom: (message: string, icon?: string) => {
    hotToast(message, {
      icon: icon || '🔔',
    });
  },
  
  // Dismiss a specific toast
  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId);
  },
  
  // Cart-specific toasts
  addedToCart: (productName: string, totalAmount?: number, quantity?: number, currencySymbol?: string) => {
    const suffix = typeof totalAmount === 'number' && typeof quantity === 'number'
      ? ` × ${quantity} • Total ${currencySymbol || '₦'}${totalAmount.toFixed(2)}`
      : '';
    hotToast.success(`${productName} added to cart!${suffix ? ` (${suffix})` : ''}`, {
      icon: '🛒',
      duration: 2500,
    });
  },
  
  removedFromCart: (productName: string) => {
    hotToast.success(`${productName} removed from cart`, {
      icon: '🗑️',
      duration: 2500,
    });
  },
  
  cartCleared: () => {
    hotToast.success('Cart cleared', {
      icon: '🧹',
      duration: 2500,
    });
  },
  
  // Wishlist toasts
  addedToWishlist: (productName: string) => {
    hotToast.success(`${productName} added to wishlist!`, {
      icon: '❤️',
      duration: 2500,
    });
  },
  
  removedFromWishlist: (productName: string) => {
    hotToast.success(`${productName} removed from wishlist`, {
      icon: '💔',
      duration: 2500,
    });
  },
  
  // Order toasts
  orderPlaced: () => {
    hotToast.success('Order placed successfully!', {
      icon: '🎉',
      duration: 4000,
    });
  },
  
  // Auth toasts
  loginSuccess: (userName?: string) => {
    hotToast.success(`Welcome back${userName ? `, ${userName}` : ''}!`, {
      icon: '👋',
      duration: 3000,
    });
  },
  
  logoutSuccess: () => {
    hotToast.success('Logged out successfully', {
      icon: '👋',
      duration: 2500,
    });
  },
  
  registerSuccess: (userName: string) => {
    hotToast.success(`Welcome, ${userName}! Please check your email to verify your account.`, {
      icon: '🎉',
      duration: 6000,
    });
  },
  
  emailVerificationSent: () => {
    hotToast.success('Verification email sent! Please check your inbox.', {
      icon: '📧',
      duration: 5000,
    });
  },
  
  emailNotConfirmed: () => {
    hotToast.error('Please verify your email address before logging in. Check your inbox for the verification link.', {
      icon: '📧',
      duration: 7000,
    });
  },
  
  // Profile toasts
  profileUpdated: () => {
    hotToast.success('Profile updated successfully!', {
      icon: '✨',
      duration: 3000,
    });
  },
  
  passwordChanged: () => {
    hotToast.success('Password changed successfully!', {
      icon: '🔒',
      duration: 3000,
    });
  },
};

export default toast;
