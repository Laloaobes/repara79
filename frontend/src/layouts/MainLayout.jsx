import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Settings, 
  Plus, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  GraduationCap 
} from 'lucide-react';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí irá la lógica de authService.logout()
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { id: 'tickets', label: 'Tickets', icon: <ClipboardList size={20} />, path: '/tickets' },
    { id: 'ajustes', label: 'Ajustes', icon: <Settings size={20} />, path: '/ajustes' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] font-sans overflow-hidden">
      
      {/* =========================================
          1. SIDEBAR (Solo Desktop)
      ========================================= */}
      <aside className="hidden md:flex flex-col w-[260px] bg-gradient-to-b from-[#163d2a] to-[#1e4535] text-white border-r border-white/5 shadow-2xl z-20">
        
        {/* Branding */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#52b788] to-[#2d6a4f] flex items-center justify-center shadow-lg shadow-[#52b788]/20">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[0.65rem] text-[#e8f5ee]/50 uppercase tracking-widest font-bold">CBTa Zinacantepec</p>
              <h1 className="text-xl font-black tracking-wide">REPARA <span className="text-[#52b788]">79</span></h1>
            </div>
          </div>
          <div className="h-px w-full bg-white/10" />
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 flex flex-col gap-2">
          <p className="text-[0.65rem] text-[#e8f5ee]/40 uppercase tracking-widest px-3 mb-2 font-bold">Menú Principal</p>
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-[#52b788]/20 text-[#52b788] font-bold border border-[#52b788]/30' 
                  : 'text-[#e8f5ee]/70 hover:bg-white/5 hover:text-white font-medium border border-transparent'}
              `}
            >
              {item.icon}
              <span className="text-[0.9rem]">{item.label}</span>
            </NavLink>
          ))}

          {/* Botón CTA */}
          <div className="mt-4 pt-4 border-t border-white/10 px-2">
            <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[#52b788] to-[#2d9e6b] text-white rounded-xl font-bold text-[0.9rem] shadow-lg shadow-[#52b788]/30 hover:opacity-90 transition-opacity active:scale-95">
              <Plus size={18} strokeWidth={2.5} />
              Nuevo Reporte
            </button>
          </div>
        </nav>

        {/* Perfil y Logout */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#52b788] to-[#2d6a4f] flex items-center justify-center font-bold text-sm border-2 border-white/10">
              ÁG
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.85rem] font-bold text-white truncate">Ángel García</p>
              <p className="text-[0.7rem] text-[#e8f5ee]/50">Administrador</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#c0392b]/10 text-[#e07b72] border border-[#c0392b]/20 rounded-xl font-bold text-[0.85rem] hover:bg-[#c0392b]/20 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* =========================================
          2. ÁREA DE CONTENIDO PRINCIPAL
      ========================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Top Header (Desktop & Mobile) */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-10">
          
          {/* Lado Izquierdo (Móvil) */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[1.1rem] font-black tracking-wide text-slate-800 leading-tight">REPARA <span className="text-[#2d6a4f]">79</span></h1>
              <p className="text-[0.55rem] text-slate-400 uppercase tracking-widest font-bold leading-tight">CBTa Zinacantepec</p>
            </div>
          </div>

          {/* Breadcrumb (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium">
            <GraduationCap size={18} />
            <span>CBTa Zinacantepec</span>
          </div>

          {/* Acciones Header */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Search size={20} />
            </button>
            
            {/* Campana Notificaciones */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-xl transition-colors relative ${notificationsOpen ? 'bg-green-50 text-[#2d6a4f]' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Bell size={22} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ef4444] text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center border-2 border-white">3</span>
              </button>

              {/* Popover de Notificaciones */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Notificaciones</h3>
                    <span className="text-xs text-[#2d6a4f] font-semibold cursor-pointer">Marcar todo leído</span>
                  </div>
                  <div className="p-4 flex flex-col gap-4 text-sm">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0"><Bell size={14}/></div>
                      <div>
                        <p className="font-bold text-slate-800 text-[0.8rem]">Reporte urgente: Fuga de agua</p>
                        <p className="text-slate-500 text-[0.75rem] leading-snug mt-0.5">El ticket TK-001 fue marcado como URGENTE.</p>
                        <p className="text-slate-400 text-[0.65rem] mt-1 font-medium">Hace 5 min</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-3 text-center text-[0.8rem] text-[#2d6a4f] font-bold border-t border-slate-100 hover:bg-slate-50">
                    Ver historial completo &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Avatar (Desktop) */}
            <div className="hidden md:flex w-9 h-9 rounded-full bg-gradient-to-br from-[#52b788] to-[#2d6a4f] items-center justify-center font-bold text-white text-sm shadow-sm cursor-pointer border-2 border-green-100">
              ÁG
            </div>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO (Aquí va el DashboardPage) */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* =========================================
          3. DRAWER MÓVIL (Menú lateral overlay)
      ========================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          {/* Drawer Panel */}
          <div className="w-[280px] h-full bg-[#163d2a] text-white flex flex-col relative shadow-2xl z-10 animate-in slide-in-from-left-4 duration-200">
            <div className="p-5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#52b788] flex items-center justify-center"><GraduationCap size={18} /></div>
                <div>
                  <h1 className="text-sm font-black tracking-wide">REPARA 79</h1>
                  <p className="text-[0.55rem] text-white/50 uppercase">CBTa Zinacantepec</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-white/50"><X size={20}/></button>
            </div>
            
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#52b788] flex items-center justify-center font-bold">ÁG</div>
              <div>
                <p className="text-[0.85rem] font-bold">Ángel García</p>
                <p className="text-[0.7rem] text-white/50">Administrador</p>
              </div>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-[0.9rem]
                    ${isActive ? 'bg-[#52b788]/20 text-[#52b788]' : 'text-white/70'}
                  `}
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
              <button className="mt-4 flex items-center gap-2 w-full py-3.5 bg-[#52b788] text-white rounded-xl font-bold justify-center">
                <Plus size={18} /> Nuevo Reporte
              </button>
            </nav>

            <div className="p-5 border-t border-white/10">
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl w-full font-bold text-[0.85rem]">
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          4. BOTTOM NAV MÓVIL
      ========================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-between px-2 pb-safe pt-1 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-1/4 py-2 gap-1
              ${isActive ? 'text-[#2d6a4f]' : 'text-slate-400'}
            `}
          >
            {item.icon}
            <span className="text-[0.6rem] font-bold">{item.label}</span>
          </NavLink>
        ))}
        {/* FAB flotante de Nuevo Reporte */}
        <button className="w-1/4 flex flex-col items-center justify-center py-2 gap-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#52b788] to-[#2d6a4f] text-white flex items-center justify-center shadow-lg shadow-[#52b788]/40 -mt-4 border-4 border-white">
            <Plus size={20} strokeWidth={3} />
          </div>
          <span className="text-[0.6rem] font-bold text-[#2d6a4f]">Nuevo</span>
        </button>
      </nav>

    </div>
  );
};

export default MainLayout;