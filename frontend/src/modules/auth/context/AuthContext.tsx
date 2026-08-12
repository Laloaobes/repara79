import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { me as fetchMe, logout as logoutRequest } from '../services/authService';
import { disconnectEcho } from '../../../realtime/echo';
import {
  clearLocalSession,
  ensureSessionTracking,
  getExpirationReason,
  storeSessionNotice,
  touchSession,
  type SessionExpirationReason,
} from '../session/sessionManager';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  rol: string;
  telefono?: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  areas?: Array<{
    id: number;
    nombre: string;
    ubicacion?: string | null;
    sede?: { id: number; nombre: string } | null;
  }>;
}

interface AuthContextValue {
  user: AuthUser | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  logoutUser: () => Promise<void>;
}

const getStoredUser = (): AuthUser | null => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || 'null');
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await fetchMe();
      setUser(freshUser);
      localStorage.setItem('user_data', JSON.stringify(freshUser));
      return freshUser;
    } catch (error) {
      console.error('No fue posible obtener el usuario autenticado:', error);
      setUser(null);
      clearLocalSession();
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    ensureSessionTracking();
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const logoutUser = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error('No fue posible cerrar sesion en el backend:', error);
    } finally {
      disconnectEcho();
      setUser(null);
      clearLocalSession();
    }
  }, []);

  const expireSession = useCallback(async (reason: SessionExpirationReason) => {
    try {
      await logoutRequest();
    } catch {
      // Un token vencido o una API desconectada no debe impedir el cierre local.
    } finally {
      storeSessionNotice(reason);
      disconnectEcho();
      clearLocalSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!user || !localStorage.getItem('auth_token')) return;

    let lastTrackedActivity = 0;
    let expiring = false;

    const checkExpiration = () => {
      const reason = getExpirationReason();
      if (reason && !expiring) {
        expiring = true;
        void expireSession(reason);
      }
      return reason;
    };

    const registerActivity = () => {
      if (checkExpiration()) return;
      const now = Date.now();
      if (now - lastTrackedActivity >= 15_000) {
        lastTrackedActivity = now;
        touchSession();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkExpiration();
    };
    const handleInvalidSession = () => {
      disconnectEcho();
      setUser(null);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'auth_token' && event.newValue === null) {
        storeSessionNotice('invalid');
        disconnectEcho();
        setUser(null);
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = ['keydown', 'pointerdown', 'touchstart'];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, registerActivity, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('auth:session-invalid', handleInvalidSession);
    window.addEventListener('storage', handleStorage);
    const interval = window.setInterval(checkExpiration, 30_000);
    checkExpiration();

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, registerActivity));
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('auth:session-invalid', handleInvalidSession);
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(interval);
    };
  }, [user, expireSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.rol ?? null,
      isLoading,
      isAuthenticated: !!user,
      refreshUser,
      logoutUser,
    }),
    [user, isLoading, refreshUser, logoutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }

  return context;
};
