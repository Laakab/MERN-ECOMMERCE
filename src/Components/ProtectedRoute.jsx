// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    // User not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User doesn't have required role, redirect to home or unauthorized page
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required role
  return <Outlet />;
};

export default ProtectedRoute;