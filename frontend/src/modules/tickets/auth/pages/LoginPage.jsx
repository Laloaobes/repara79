import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Wrench, 
  ShieldCheck, 
  FileText, 
  GraduationCap,
  User
} from 'lucide-react';

const LoginPage = () => {
  // Estados para controlar la UI
  const [activeTab, setActiveTab] = useState('register'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para el formulario de registro
  const [selectedRole, setSelectedRole] = useState('Alumno');

  // Función para manejar el envío del formulario (Preparado para producción)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Aquí recolectamos los datos del formulario de manera segura
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (activeTab === 'register') {
      data.role = selectedRole; // Añadimos el rol seleccionado manualmente
      
      // Validación básica de contraseñas
      if (data.password !== data.confirmPassword) {
        // En producción aquí usarías una librería de notificaciones (toast)
        console.error("Las contraseñas no coinciden");
        return;
      }
      console.log('Datos listos para enviar al servicio de Registro:', data);
    } else {
      console.log('Datos listos para enviar al servicio de Login:', data);
    }
    
    // TODO: Conectar con src/modules/auth/services/authService.ts
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] p-4 font-sans">
      
      {/* Contenedor Principal (Tarjeta) */}
      <div className="flex flex-col md:flex-row w-full max-w-[1000px] bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        
        {/* === PANEL IZQUIERDO (Verde Oscuro) === */}
        <div className="w-full md:w-[45%] bg-[#1a4731] text-white p-10 md:p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          
          {/* Decoración de fondo suave */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Logo y Marca */}
          <div className="flex items-center gap-3 mb-10 z-10">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <GraduationCap size={20} className="text-green-300" />
            </div>
            <div>
              <p className="text-[0.65rem] text-green-200/80 uppercase tracking-widest font-semibold">CBTa Zinacantepec</p>
              <h1 className="text-xl font-bold tracking-wide">REPARA 79</h1>
            </div>
          </div>

          {/* Textos Principales */}
          <div className="z-10 mb-10">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Sistema de Gestión de Mantenimiento
            </h2>
            <p className="text-green-100/80 text-sm leading-relaxed mb-8">
              Registra, da seguimiento y resuelve incidencias de infraestructura escolar de manera eficiente.
            </p>

            {/* Lista de características */}
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-green-50">
                <div className="p-1.5 bg-white/10 rounded-lg"><Wrench size={16} className="text-green-300" /></div>
                Gestión centralizada de tickets
              </li>
              <li className="flex items-center gap-3 text-sm text-green-50">
                <div className="p-1.5 bg-white/10 rounded-lg"><ShieldCheck size={16} className="text-green-300" /></div>
                Acceso por roles y permisos
              </li>
              <li className="flex items-center gap-3 text-sm text-green-50">
                <div className="p-1.5 bg-white/10 rounded-lg"><FileText size={16} className="text-green-300" /></div>
                Reportes por área y edificio
              </li>
            </ul>
          </div>

          {/* Pill Inferior */}
          <div className="z-10 inline-block">
            <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 inline-flex flex-col backdrop-blur-sm">
              <span className="text-[0.65rem] text-green-200/80 uppercase tracking-wider mb-0.5">Ciclo escolar</span>
              <span className="text-sm font-bold">2025 – 2026</span>
            </div>
          </div>
        </div>

        {/* === PANEL DERECHO (Blanco - Formulario) === */}
        <div className="w-full md:w-[55%] p-8 md:p-12 lg:p-14 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {/* Header del formulario */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'login' 
                ? 'Ingresa tus credenciales para acceder al sistema.' 
                : 'Completa el formulario para solicitar acceso.'}
            </p>
          </div>

          {/* Toggle de Pestañas (Pills) */}
          <div className="flex bg-slate-50 border border-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                activeTab === 'login' 
                  ? 'bg-white text-[#1a4731] border-slate-200 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 border-transparent'
              }`}
            >
              Inicio de sesión
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                activeTab === 'register' 
                  ? 'bg-white text-[#1a4731] border-slate-200 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 border-transparent'
              }`}
            >
              Registro
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="space-y-4">
              
              {/* === CAMPOS EXCLUSIVOS DE REGISTRO === */}
              {activeTab === 'register' && (
                <>
                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        name="fullName"
                        placeholder="Ej. Ángel García Martínez" 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Correo (Registro) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                      Correo institucional
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        name="email"
                        placeholder="usuario@cbta79.edu.mx" 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Selector de Rol (Segmented Control) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                      Rol
                    </label>
                    <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl gap-1">
                      {['Alumno', 'Docente', 'Administrativo'].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSelectedRole(role)}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                            selectedRole === role 
                              ? 'bg-[#2d6a4f] text-white shadow-md' 
                              : 'text-slate-500 hover:bg-slate-200/50'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* === CAMPOS EXCLUSIVOS DE LOGIN === */}
              {activeTab === 'login' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    Correo institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      name="email"
                      placeholder="usuario@cbta79.edu.mx" 
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* === CAMPO CONTRASEÑA (Compartido) === */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none transition-all text-sm font-medium tracking-wider"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* === CAMPO CONFIRMAR CONTRASEÑA (Solo Registro) === */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      name="confirmPassword"
                      placeholder="••••••••" 
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none transition-all text-sm font-medium tracking-wider"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Link de recuperación (Solo Login) */}
            {activeTab === 'login' && (
              <div className="flex justify-end mt-3 mb-6">
                <button type="button" className="text-xs font-semibold text-[#2d6a4f] hover:text-[#1a4731] transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Botón de Acción Principal */}
            <div className={`mt-auto ${activeTab === 'register' ? 'pt-8' : 'pt-6'}`}>
              <button 
                type="submit" 
                className="w-full bg-[#2d6a4f] hover:bg-[#1a4731] text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-green-900/20"
              >
                {activeTab === 'login' ? 'Ingresar al sistema' : 'Solicitar acceso'}
              </button>
            </div>
          </form>

          {/* Footer Text */}
          <div className="mt-8 text-center shrink-0">
            <p className="text-[0.65rem] font-medium text-slate-400 uppercase tracking-widest">
              CBTa No. 79 — Zinacantepec · Sistema interno 2026
            </p>
          </div>

        </div>
      </div>

      {/* Estilos para el scrollbar interno en caso de pantallas pequeñas */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
};

export default LoginPage;