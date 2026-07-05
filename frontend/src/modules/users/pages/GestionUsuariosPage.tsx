import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import usersService, { AdminUser } from '../services/usersService';
import { useAuth } from '../../auth/context/AuthContext';
import { ROLES, Role } from '../../../constants/roles';

const ROLE_OPTIONS = Object.values(ROLES);

const GestionUsuariosPage = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsuarios = async () => {
    try {
      const data = await usersService.getUsers();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setError('No fue posible cargar la lista de usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleRoleChange = async (usuario: AdminUser, nuevoRol: Role) => {
    if (nuevoRol === usuario.rol) return;

    const rolAnterior = usuario.rol;
    setUpdatingId(usuario.id);
    setError(null);

    // Actualización optimista: refleja el cambio de inmediato y revierte si falla.
    setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, rol: nuevoRol } : u)));

    try {
      await usersService.updateUserRole(usuario.id, nuevoRol);
    } catch (err) {
      console.error(err);
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, rol: rolAnterior } : u)));
      setError(`No fue posible actualizar el rol de ${usuario.name}.`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm font-bold text-slate-500">Cargando usuarios...</div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500">{usuarios.length} cuentas registradas</p>
        </div>
      </div>

      {error && (
        <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Correo</th>
                <th className="px-6 py-3">Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const isSelf = usuario.id === currentUser?.id;
                const isUpdating = updatingId === usuario.id;

                return (
                  <tr key={usuario.id} className="border-b border-slate-50 last:border-b-0">
                    <td className="px-6 py-4 font-bold text-slate-800">{usuario.name}</td>
                    <td className="px-6 py-4 text-slate-500">{usuario.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={usuario.rol}
                        disabled={isSelf || isUpdating}
                        onChange={(e) => handleRoleChange(usuario, e.target.value as Role)}
                        title={isSelf ? 'No puedes cambiar tu propio rol' : undefined}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ROLE_OPTIONS.map((rol) => (
                          <option key={rol} value={rol}>
                            {rol}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuariosPage;
