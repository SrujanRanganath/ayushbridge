import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-400"></div>
          <span className="absolute text-lg">🌱</span>
        </div>
        <p className="mt-4 text-emerald-300/80 text-sm font-medium animate-pulse">
          Validating clinical credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
