import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { me } from '../services/authService';

const clearLocalSession = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
};

const ProtectedRoute = () => {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        clearLocalSession();
        setIsAuthenticated(false);
        setIsCheckingSession(false);
        return;
      }

      try {
        const user = await me();
        localStorage.setItem('user_data', JSON.stringify(user));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Sesion local invalida o expirada:', error);
        clearLocalSession();
        setIsAuthenticated(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    validateSession();
  }, []);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Validando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
