import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../../auth/services/authService';
import { useAuth } from '../../auth/context/AuthContext';

const getInitials = (name) => {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0][0].toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

const AjustesPage = () => {
  const navigate = useNavigate();
  const { user: currentUser, refreshUser, logoutUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logoutUser();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const handleSaveProfile = async (formValues) => {
    setIsSaving(true);
    setError(null);

    try {
      await updateProfile(formValues);
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      console.error('No fue posible actualizar el perfil:', err);
      setError('No fue posible guardar los cambios. Revisa los datos e intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ajustes</h1>
        <p className="text-sm text-slate-600 mt-1">
          Configuración del sistema REPARA 79
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between mb-7 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
            {getInitials(currentUser?.name)}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentUser?.name || 'Usuario'}</h2>
            <p className="text-sm text-slate-600">{currentUser?.rol || 'Usuario'}</p>
            <p className="text-sm font-medium text-emerald-900">
              {currentUser?.email || ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold px-5 py-2 rounded-full transition"
        >
          Editar
        </button>
      </div>

      <SettingsSection title="Sistema">
        <SettingsItem
          icon={<BellIcon />}
          title="Notificaciones"
          description="Email y push activas para urgencias"
        />

        <SettingsItem
          icon={<SchoolIcon />}
          title="Datos del plantel"
          description="CBTa No. 79 — Zinacantepec, Edo. de México"
        />

        <SettingsItem
          icon={<WrenchIcon />}
          title="Gestión de técnicos"
          description="3 técnicos registrados activos"
        />
      </SettingsSection>

      <SettingsSection title="Datos">
        <SettingsItem
          icon={<ReportIcon />}
          title="Exportar reportes"
          description="Descargar historial en PDF o Excel"
        />

        <SettingsItem
          icon={<ClockIcon />}
          title="Historial de acciones"
          description="Log completo del sistema"
        />
      </SettingsSection>

      <div className="mt-7">
        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-red-700 mb-3">
          Zona de acceso
        </h3>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-red-50 border border-red-200 rounded-2xl px-6 py-5 flex items-center justify-between text-left hover:bg-red-100 transition disabled:opacity-60"
        >
          <div className="flex items-center gap-4">
            <LogoutIcon />

            <div>
              <h4 className="font-bold text-red-600">
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </h4>
              <p className="text-sm text-red-500 mt-1">
                Salir del sistema REPARA 79
              </p>
            </div>
          </div>

          <span className="text-red-400 text-xl">›</span>
        </button>
      </div>

      {isEditing && (
        <EditProfileModal
          user={currentUser}
          isSaving={isSaving}
          error={error}
          onCancel={() => {
            setIsEditing(false);
            setError(null);
          }}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
};

const EditProfileModal = ({ user, isSaving, error, onCancel, onSave }) => {
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    onSave({
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      telefono: String(formData.get('telefono') || ''),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Editar perfil</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Actualiza tus datos de cuenta</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 ml-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                defaultValue={user?.name || ''}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 ml-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                defaultValue={user?.email || ''}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 ml-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                defaultValue={user?.telefono || ''}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50 rounded-b-[2rem]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={isSaving}
            className="flex-1 py-3.5 bg-[#163d2a] hover:bg-[#1e4535] text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-[#163d2a]/20 text-sm disabled:opacity-60"
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsSection = ({ title, children }) => {
  return (
    <section className="mb-7">
      <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-900 mb-3">
        {title}
      </h3>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {children}
      </div>
    </section>
  );
};

const SettingsItem = ({ icon, title, description }) => {
  return (
    <div className="w-full px-6 py-5 flex items-center justify-between text-left border-b border-slate-200 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="text-emerald-800">{icon}</div>

        <div>
          <h4 className="font-bold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
      </div>

      <span className="text-[0.65rem] font-bold uppercase tracking-wide text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
        Próximamente
      </span>
    </div>
  );
};

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SchoolIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M22 10L12 5 2 10l10 5 10-5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 12v5c3 2 9 2 12 0v-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WrenchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M14.7 6.3a4 4 0 0 0-5 5L4 17v3h3l5.7-5.7a4 4 0 0 0 5-5L15 12l-3-3 2.7-2.7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ReportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 8h6M9 12h6M9 16h3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 7v5l3 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17l5-5-5-5M21 12H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default AjustesPage;
