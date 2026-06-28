import React, { useState } from 'react';
import { Settings, User, Lock, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import apiClient from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const AjustesPage = () => {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);
    try {
      await apiClient.put('/profile', profileData);
      setProfileSuccess('Perfil actualizado correctamente.');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msgs = e?.response?.data?.errors;
      setProfileError(msgs ? Object.values(msgs).flat().join(' ') : (e?.response?.data?.message ?? 'Error al guardar el perfil.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    if (passwordData.password.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await apiClient.put('/password', passwordData);
      setPasswordSuccess('Contraseña actualizada correctamente.');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msgs = e?.response?.data?.errors;
      setPasswordError(msgs ? Object.values(msgs).flat().join(' ') : (e?.response?.data?.message ?? 'Error al cambiar la contraseña.'));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#2d6a4f]/10 flex items-center justify-center text-[#2d6a4f]">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Ajustes</h1>
          <p className="text-sm text-slate-500 font-medium">Configura tu perfil y seguridad</p>
        </div>
      </div>

      {/* Perfil */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <User size={16} className="text-[#2d6a4f]" /> Información personal
        </div>

        {profileError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle2 size={15} className="shrink-0" /> {profileSuccess}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Nombre completo</label>
            <input
              type="text" value={profileData.name} onChange={e => setProfileData(d => ({ ...d, name: e.target.value }))} required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Correo electrónico</label>
            <input
              type="email" value={profileData.email} onChange={e => setProfileData(d => ({ ...d, email: e.target.value }))} required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Rol</label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-500">
              {user?.rol ?? '—'}
            </div>
          </div>
          <button
            type="submit" disabled={isSavingProfile}
            className="self-end px-6 py-3 bg-[#163d2a] hover:bg-[#1e4535] disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-md"
          >
            {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Contraseña */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Lock size={16} className="text-[#2d6a4f]" /> Cambiar contraseña
          </div>
          <button
            type="button" onClick={() => setShowPasswords(v => !v)}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium"
          >
            {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPasswords ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {passwordError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle2 size={15} className="shrink-0" /> {passwordSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Contraseña actual</label>
            <input
              type={showPasswords ? 'text' : 'password'} value={passwordData.current_password}
              onChange={e => setPasswordData(d => ({ ...d, current_password: e.target.value }))} required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Nueva contraseña</label>
            <input
              type={showPasswords ? 'text' : 'password'} value={passwordData.password}
              onChange={e => setPasswordData(d => ({ ...d, password: e.target.value }))} required minLength={8}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Confirmar nueva contraseña</label>
            <input
              type={showPasswords ? 'text' : 'password'} value={passwordData.password_confirmation}
              onChange={e => setPasswordData(d => ({ ...d, password_confirmation: e.target.value }))} required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
            />
          </div>
          <button
            type="submit" disabled={isSavingPassword}
            className="self-end px-6 py-3 bg-[#163d2a] hover:bg-[#1e4535] disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-md"
          >
            {isSavingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AjustesPage;
