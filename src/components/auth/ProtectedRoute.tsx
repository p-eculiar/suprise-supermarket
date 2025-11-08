import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader } from '../common';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: 'user' | 'admin';
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'user',
  requireAdmin = false
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Set a timeout to prevent indefinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn('Authentication loading timeout reached after 10s');
        setTimeoutReached(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Determine redirect path based on user state
  useEffect(() => {
    // Don't redirect while still loading and timeout hasn't been reached
    if (isLoading && !timeoutReached) {
      return;
    }

    // If timeout reached and still no user, redirect to login
    if (timeoutReached && !user) {
      console.warn('Authentication timeout - will redirect to login');
      setRedirectPath('/login');
      return;
    }

    // If user is null/undefined and not loading, redirect to login
    if (!user && !isLoading) {
      console.log('No user and not loading - will redirect to login');
      setRedirectPath('/login');
      return;
    }

    // Check if user has the required role
    if (user && (requireAdmin || requiredRole === 'admin')) {
      const userRole = user.role || 'customer';
      if (userRole !== 'admin') {
        console.warn(`User role '${userRole}' does not have admin access - will redirect to home`);
        setRedirectPath('/');
        return;
      }
    }

    // User is authenticated and has required role
    setRedirectPath(null);
  }, [user, isLoading, timeoutReached, requireAdmin, requiredRole]);

  // Show loader while loading, but not if timeout is reached
  if (isLoading && !timeoutReached) {
    return <Loader fullPage />;
  }

  // Perform redirect if needed
  if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children;
};