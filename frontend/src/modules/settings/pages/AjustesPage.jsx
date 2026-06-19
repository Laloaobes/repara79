import { useState } from 'react';

const tabs = [
  {
    id: 'perfil',
    title: 'Perfil',
    description: 'Datos generales del usuario',
  },
  {
    id: 'cuenta',
    title: 'Cuenta',
    description: 'Rol y estado de la cuenta',
  },
  {
    id: 'notificaciones',
    title: 'Notificaciones',
    description: 'Avisos del sistema',
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    description: 'Acceso y contraseña',
  },
  {
    id: 'sistema',
    title: 'Sistema',
    description: 'Configuración general',
  },
];

const AjustesPage = () => {
  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Ajustes</h1>
        <p className="text-slate-500 mt-2">
          Página de configuración del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Configuración
          </h2>

          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left rounded-xl px-4 py-3 transition border ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <span className="block font-bold">{tab.title}</span>
                <span className="block text-sm mt-1 opacity-80">
                  {tab.description}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {activeTab === 'perfil' && <PerfilTab />}
          {activeTab === 'cuenta' && <CuentaTab />}
          {activeTab === 'notificaciones' && <NotificacionesTab />}
          {activeTab === 'seguridad' && <SeguridadTab />}
          {activeTab === 'sistema' && <SistemaTab />}
        </section>
      </div>
    </div>
  );
};

const PerfilTab = () => {
  return (
    <div>
      <SectionTitle
        title="Perfil"
        description="Administra la información principal del usuario."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input label="Nombre completo" placeholder="Administrador General" />
        <Input label="Correo electrónico" placeholder="admin@repara79.com" />
        <Input label="Teléfono" placeholder="238 000 0000" />
        <Input label="Área" placeholder="Soporte técnico" />
      </div>

      <SaveButton text="Guardar perfil" />
    </div>
  );
};

const CuentaTab = () => {
  return (
    <div>
      <SectionTitle
        title="Cuenta"
        description="Configura el rol, permisos y estado de la cuenta."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Select
          label="Rol del usuario"
          options={['Administrador', 'Técnico', 'Recepción', 'Cliente']}
        />

        <Select
          label="Estado de la cuenta"
          options={['Activa', 'Inactiva', 'Pendiente']}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <InfoCard title="Último acceso" description="Hoy a las 10:30 AM" />
        <InfoCard
          title="Permisos"
          description="Acceso a dashboard, tickets y ajustes"
        />
      </div>

      <SaveButton text="Actualizar cuenta" />
    </div>
  );
};

const NotificacionesTab = () => {
  return (
    <div>
      <SectionTitle
        title="Notificaciones"
        description="Selecciona los avisos que recibirá el usuario."
      />

      <div className="space-y-4">
        <ToggleOption
          title="Nuevos tickets"
          description="Recibir aviso cuando se registre un nuevo ticket."
        />

        <ToggleOption
          title="Cambio de estado"
          description="Recibir aviso cuando un ticket cambie de pendiente a en proceso o finalizado."
        />

        <ToggleOption
          title="Solicitud de materiales"
          description="Recibir aviso cuando se soliciten piezas o refacciones."
        />

        <ToggleOption
          title="Resumen diario"
          description="Recibir un resumen de los tickets registrados durante el día."
        />
      </div>

      <SaveButton text="Guardar notificaciones" />
    </div>
  );
};

const SeguridadTab = () => {
  return (
    <div>
      <SectionTitle
        title="Seguridad"
        description="Administra contraseña y opciones de acceso."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Contraseña actual"
          placeholder="********"
          type="password"
        />
        <Input
          label="Nueva contraseña"
          placeholder="********"
          type="password"
        />
        <Input
          label="Confirmar contraseña"
          placeholder="********"
          type="password"
        />
      </div>

      <div className="space-y-4 mt-6">
        <ToggleOption
          title="Verificación en dos pasos"
          description="Agregar una capa extra de seguridad al iniciar sesión."
        />

        <ToggleOption
          title="Cerrar sesión en otros dispositivos"
          description="Forzar nuevo inicio de sesión en dispositivos externos."
        />
      </div>

      <SaveButton text="Actualizar seguridad" />
    </div>
  );
};

const SistemaTab = () => {
  return (
    <div>
      <SectionTitle
        title="Sistema"
        description="Configura las preferencias generales de REPARA 79."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Select label="Tema visual" options={['Claro', 'Oscuro', 'Automático']} />
        <Select label="Idioma" options={['Español', 'Inglés']} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <InfoCard title="Versión del sistema" description="REPARA 79 v1.0.0" />
        <InfoCard title="Institución" description="CBTa Zinacantepec" />
      </div>

      <SaveButton text="Guardar configuración" />
    </div>
  );
};

const SectionTitle = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-slate-500 mt-1">{description}</p>
    </div>
  );
};

const Input = ({ label, placeholder, type = 'text' }) => {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
};

const Select = ({ label, options }) => {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>

      <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

const InfoCard = ({ title, description }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
};

const ToggleOption = ({ title, description }) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div>
        <h3 className="font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`relative h-7 w-12 rounded-full transition ${
          enabled ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
};

const SaveButton = ({ text }) => {
  return (
    <div className="mt-8 flex justify-end">
      <button
        type="button"
        className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-600"
      >
        {text}
      </button>
    </div>
  );
};

export default AjustesPage;