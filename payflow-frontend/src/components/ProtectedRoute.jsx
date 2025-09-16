import React from 'react';
import { Navigate } from 'react-router-dom';

// roles: array of allowed roles, e.g. ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']
const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('role');

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed
  if (roles && !roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
