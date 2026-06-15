import React from 'react';
import { 
  Wrench, 
  User, 
  Briefcase, 
  ClipboardList, 
  Building 
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'solicitante' | 'subdirector' | 'mantenimiento';
  setActiveTab: (tab: 'solicitante' | 'subdirector' | 'mantenimiento') => void;
  getRoleLabel: () => string;
}

export default function Sidebar({ activeTab, setActiveTab, getRoleLabel }: SidebarProps) {
  return (
    <nav 
      aria-label="Navegación del Sistema REPARA - 79" 
      className="w-full lg:w-80 bg-slate-900 text-slate-200 flex flex-col justify-between border-r border-slate-800 shrink-0 shadow-xl"
    >
      <div>
        {/* Cabecera del Sidebar con Nombre de Sistema */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/15 rounded-xl border border-blue-500/20 text-blue-450 shadow-inner group-hover:scale-105 transition-transform duration-200">
              <Wrench className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white m-0">REPARA - 79</h2>
              <p className="text-xs text-slate-400 font-medium m-0">Gestión de Control Físico</p>
            </div>
          </div>
        </div>

        {/* Bloque de Perfil de Usuario Sesión Actual */}
        <div className="p-5 border-b border-slate-850 bg-slate-950/20">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-lg border-2 border-slate-700/60 shrink-0 select-none hover:rotate-6 transition-transform">
              IM
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-slate-100 truncate">Ismael Montalvo López</div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/15">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                {getRoleLabel()}
              </div>
            </div>
          </div>
        </div>

        {/* Menú de Configuración de Roles */}
        <div className="p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">
            Roles del Sistema
          </h3>
          <ul className="space-y-2 list-none p-0 m-0">
            <li>
              <button
                type="button"
                aria-current={activeTab === 'solicitante' ? 'page' : undefined}
                onClick={() => setActiveTab('solicitante')}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === 'solicitante'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/55'
                }`}
              >
                <User className="w-4.5 h-4.5 shrink-0" />
                <span>1. Dashboard del Solicitante</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                aria-current={activeTab === 'subdirector' ? 'page' : undefined}
                onClick={() => setActiveTab('subdirector')}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === 'subdirector'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/55'
                }`}
              >
                <Briefcase className="w-4.5 h-4.5 shrink-0" />
                <span>2. Panel del Subdirector</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                aria-current={activeTab === 'mantenimiento' ? 'page' : undefined}
                onClick={() => setActiveTab('mantenimiento')}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === 'mantenimiento'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/55'
                }`}
              >
                <ClipboardList className="w-4.5 h-4.5 shrink-0" />
                <span>3. Panel de Mantenimiento</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer del Sidebar */}
      <div className="p-6 border-t border-slate-850 bg-slate-950/20">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Building className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Unidad Educativa IPN</span>
        </div>
        <p className="text-xs text-slate-400 m-0 leading-relaxed font-medium">
          © 2026 REPARA - 79.<br />
          <span className="text-slate-500 text-[10px]">Dirección de Administración</span>
        </p>
      </div>
    </nav>
  );
}
