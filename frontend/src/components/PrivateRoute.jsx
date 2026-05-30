import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * PrivateRoute — wraps a component and redirects to /login if not authenticated.
 * Optionally accepts `allowedRoles` array to further restrict by role.
 *
 * Usage:
 *   <PrivateRoute><Dashboard /></PrivateRoute>
 *   <PrivateRoute allowedRoles={['ADMIN']}><AdminOnly /></PrivateRoute>
 */
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait for auth context to finish loading from localStorage
  if (loading) return null;

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Role restriction: if allowedRoles provided, ensure user has one of them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
