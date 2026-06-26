import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, AlertTriangle, UserCircle, ToggleLeft, ToggleRight, KeyRound, Trash2, X, Eye, EyeOff } from 'lucide-react';
import userService, { Usuario, TipoUsuario, CreateUsuarioPayload, UpdateUsuarioPayload } from '../services/userService';

type ModalMode = 'create' | 'edit' | 'reset-password' | null;

const EMPTY_CREATE: CreateUsuarioPayload = {
  name: '', email: '', password: '', telefono: '', tipo_usuario_id: 1, zona_id: null,
};

const UsersPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [tiposUsuario, setTiposUsuario] = useState<TipoUsuario[]>([]);
  const [buscar, setBuscar] = useState('');
  const [debouncedBuscar, setDebouncedBuscar] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<CreateUsuarioPayload>(EMPTY_CREATE);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    userService.getTiposUsuario().then(setTiposUsuario).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBuscar(buscar), 300);
    return () => clearTimeout(t);
  }, [buscar]);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await userService.getAll({ buscar: debouncedBuscar || undefined });
      setUsuarios(result.data);
      setTotal(result.total);
    } catch {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedBuscar]);

  useEffect(() => { cargar(); }, [cargar]);

  const openCreate = () => {
    setFormData({ ...EMPTY_CREATE, tipo_usuario_id: tiposUsuario[0]?.id ?? 1 });
    setFormError('');
    setShowPassword(false);
    setModalMode('create');
  };

  const openEdit = (u: Usuario) => {
    setSelectedUser(u);
    setFormData({
      name: u.name, email: u.email, password: '',
      telefono: u.telefono ?? '',
      tipo_usuario_id: u.tipo_usuario_id,
      zona_id: u.zona_id,
    });
    setFormError('');
    setModalMode('edit');
  };

  const openResetPassword = (u: Usuario) => {
    setSelectedUser(u);
    setNewPassword('');
    setShowPassword(false);
    setFormError('');
    setModalMode('reset-password');
  };

  const handleToggle = async (u: Usuario) => {
    try {
      const updated = await userService.toggleEstatus(u.id);
      setUsuarios(prev => prev.map(x => x.id === u.id ? updated : x));
    } catch {
      setError('Error al cambiar estatus.');
    }
  };

  const handleDelete = async (u: Usuario) => {
    if (!confirm(`¿Eliminar al usuario "${u.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await userService.destroy(u.id);
      cargar();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Error al eliminar usuario.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        await userService.create(formData);
      } else if (modalMode === 'edit' && selectedUser) {
        const payload: UpdateUsuarioPayload = {
          name: formData.name,
          email: formData.email,
          telefono: formData.telefono,
          tipo_usuario_id: formData.tipo_usuario_id,
          zona_id: formData.zona_id,
        };
        await userService.update(selectedUser.id, payload);
      } else if (modalMode === 'reset-password' && selectedUser) {
        if (newPassword.length < 8) { setFormError('La contraseña debe tener al menos 8 caracteres.'); setIsSubmitting(false); return; }
        await userService.resetPassword(selectedUser.id, newPassword);
      }
      setModalMode(null);
      cargar();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msgs = e?.response?.data?.errors;
      setFormError(msgs ? Object.values(msgs).flat().join(' ') : (e?.response?.data?.message ?? 'Error inesperado.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {isLoading ? 'Cargando...' : `${total} usuario${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1e4535] text-white rounded-xl font-bold text-sm shadow-md transition-all"
        >
          <Plus size={16} strokeWidth={3} /> Nuevo Usuario
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text" value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="Buscar por nombre, email..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Tabla / Lista */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
        </div>
      ) : usuarios.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <UserCircle size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-700 font-bold">No hay usuarios</p>
          <p className="text-slate-500 text-sm mt-1">Crea el primer usuario con el botón de arriba.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-[0.7rem] font-black uppercase tracking-wider text-slate-400 px-6 py-4">Usuario</th>
                  <th className="text-left text-[0.7rem] font-black uppercase tracking-wider text-slate-400 px-4 py-4 hidden md:table-cell">Rol</th>
                  <th className="text-left text-[0.7rem] font-black uppercase tracking-wider text-slate-400 px-4 py-4 hidden lg:table-cell">Teléfono</th>
                  <th className="text-center text-[0.7rem] font-black uppercase tracking-wider text-slate-400 px-4 py-4">Estatus</th>
                  <th className="text-right text-[0.7rem] font-black uppercase tracking-wider text-slate-400 px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usuarios.map(u => {
                  const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#52b788] to-[#2d6a4f] flex items-center justify-center font-bold text-white text-sm shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="px-3 py-1.5 bg-[#2d6a4f]/10 text-[#163d2a] text-[0.7rem] font-bold rounded-lg">
                          {u.tipoUsuario?.nombre ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 hidden lg:table-cell">
                        {u.telefono ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleToggle(u)} title={u.estatus ? 'Desactivar' : 'Activar'}>
                          {u.estatus
                            ? <ToggleRight size={28} className="text-[#52b788]" />
                            : <ToggleLeft size={28} className="text-slate-300" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 text-slate-400 hover:text-[#2d6a4f] hover:bg-[#2d6a4f]/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <UserCircle size={18} />
                          </button>
                          <button
                            onClick={() => openResetPassword(u)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Cambiar contraseña"
                          >
                            <KeyRound size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setModalMode(null)}>
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {modalMode === 'create' ? 'Nuevo Usuario' : modalMode === 'edit' ? 'Editar Usuario' : 'Cambiar Contraseña'}
              </h2>
              <button onClick={() => setModalMode(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {formError}
                </div>
              )}

              {modalMode === 'reset-password' ? (
                <div>
                  <p className="text-sm text-slate-600 mb-4">Nueva contraseña para <strong>{selectedUser?.name}</strong>.</p>
                  <label className="text-xs font-bold text-slate-700 mb-2 block">Nueva contraseña *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      required minLength={8}
                      className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Nombre completo *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Correo electrónico *</label>
                    <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Teléfono</label>
                    <input type="tel" value={formData.telefono ?? ''} onChange={e => setFormData(f => ({ ...f, telefono: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Rol *</label>
                    <select value={formData.tipo_usuario_id} onChange={e => setFormData(f => ({ ...f, tipo_usuario_id: Number(e.target.value) }))} required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium">
                      {tiposUsuario.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                  {modalMode === 'create' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2 block">Contraseña *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                          required minLength={8}
                          className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
                        />
                        <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </form>

            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50/50 rounded-b-[2rem]">
              <button type="button" onClick={() => setModalMode(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#163d2a] hover:bg-[#1e4535] disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
