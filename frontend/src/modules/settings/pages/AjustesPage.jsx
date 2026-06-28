const AjustesPage = () => {
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
            JA
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Juan andres</h2>
            <p className="text-sm text-slate-600">Administrador del sistema</p>
            <p className="text-sm font-medium text-emerald-900">
              angel.garcia@cbta79.edu.mx
            </p>
          </div>
        </div>

        <button
          type="button"
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
          className="w-full bg-red-50 border border-red-200 rounded-2xl px-6 py-5 flex items-center justify-between text-left hover:bg-red-100 transition"
        >
          <div className="flex items-center gap-4">
            <LogoutIcon />

            <div>
              <h4 className="font-bold text-red-600">Cerrar sesión</h4>
              <p className="text-sm text-red-500 mt-1">
                Salir del sistema REPARA 79
              </p>
            </div>
          </div>

          <span className="text-red-400 text-xl">›</span>
        </button>
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
    <button
      type="button"
      className="w-full px-6 py-5 flex items-center justify-between text-left border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition"
    >
      <div className="flex items-center gap-4">
        <div className="text-emerald-800">{icon}</div>

        <div>
          <h4 className="font-bold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
      </div>

      <span className="text-slate-500 text-xl">›</span>
    </button>
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