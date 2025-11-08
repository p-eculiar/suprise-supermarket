import React from 'react';
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

  if (isLoading) {
    return <Loader fullPage />;
  }

  if (!user) {
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (requireAdmin || requiredRole === 'admin') {
    if (user.role !== 'admin') {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  return children;
};

// Usage example:
// <Route
//   path="/profile"
//   element={
//     <ProtectedRoute>
//       <ProfilePage />
//     </ProtectedRoute>
//   }
// />
