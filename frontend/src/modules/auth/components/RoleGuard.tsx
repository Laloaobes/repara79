import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza `children` solo si el rol del usuario autenticado está en `allowedRoles`.
 * Si no, renderiza `fallback` (por defecto nada).
 */
const RoleGuard = ({ allowedRoles, children, fallback = null }: RoleGuardProps) => {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
