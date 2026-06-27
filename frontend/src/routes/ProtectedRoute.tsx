import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Rol = 'Administrador' | 'Subdirector Administrativo' | 'Personal de Mantenimiento' | 'Responsable del Lugar';

interface ProtectedRouteProps {
  roles?: Rol[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4]">
        <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && user && !roles.includes(user.rol as Rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
