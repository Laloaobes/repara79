import React, { useState } from 'react';
import { 
  Wrench, 
  User, 
  ClipboardList, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  UploadCloud, 
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Building,
  Image as ImageIcon
} from 'lucide-react';

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<'solicitante' | 'subdirector' | 'mantenimiento'>('solicitante');

  // Estado para la simulación de materiales requeridos
  const [materials, setMaterials] = useState<Array<{ name: string; code: string; qty: number; cost: number }>>([
    { name: 'Teflón para tuberías de alta presión 3/4"', code: 'TEF-GAS-01', qty: 1, cost: 22.00 },
    { name: 'Manguera flexible tramada para gas 1.5m', code: 'MAG-FLEX-03', qty: 1, cost: 180.00 }
  ]);

  const [newMaterial, setNewMaterial] = useState({ name: '', code: '', qty: 1, cost: 0 });

  // Estados simples para almacenar nombres de archivos cargados ficticiamente (mejora de experiencia de usuario en dropzones)
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: e.target.files![0].name
      }));
    }
  };

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.code) {
      setMaterials([...materials, {
        name: newMaterial.name,
        code: newMaterial.code,
        qty: Number(newMaterial.qty),
        cost: Number(newMaterial.cost)
      }]);
      setNewMaterial({ name: '', code: '', qty: 1, cost: 0 });
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  // Retorna el rol actual de manera amigable
  const getRoleLabel = () => {
    switch (activeTab) {
      case 'solicitante':
        return 'Usuario Solicitante';
      case 'subdirector':
        return 'Subdirector Administrativo';
      case 'mantenimiento':
        return 'Personal Técnico de Mantenimiento';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* 
        SPA SIDEBAR NAVIGATION 
        Estructura de panel lateral izquierdo fijo en pantallas grandes y responsivo.
      */}
      <nav 
        aria-label="Navegación del Sistema REPARA - 79" 
        className="w-full lg:w-80 bg-slate-900 text-slate-200 flex flex-col justify-between border-r border-slate-800 shrink-0"
      >
        <div>
          {/* Cabecera del Sidebar con Nombre de Sistema */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/10 rounded-xl border border-blue-500/20 text-blue-400">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white m-0">REPARA - 79</h2>
                <p className="text-xs text-slate-400 font-medium m-0">Sistema de Gestión de Tickets</p>
              </div>
            </div>
          </div>

          {/* Bloque de Perfil de Usuario Sesión Actual */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/20">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center shadow-lg border-2 border-slate-700 shrink-0 select-none">
                IM
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold text-white truncate">Ismael Montalvo López</div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  {getRoleLabel()}
                </div>
              </div>
            </div>
          </div>

          {/* Menú de Configuración de Roles */}
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">
              Roles del Sistema
            </h3>
            <ul className="space-y-1.5 list-none p-0 m-0">
              <li>
                <button
                  type="button"
                  aria-current={activeTab === 'solicitante' ? 'page' : undefined}
                  onClick={() => setActiveTab('solicitante')}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'solicitante'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <User className="w-5 h-5 shrink-0" />
                  <span>1. Dashboard del Solicitante</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  aria-current={activeTab === 'subdirector' ? 'page' : undefined}
                  onClick={() => setActiveTab('subdirector')}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'subdirector'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Briefcase className="w-5 h-5 shrink-0" />
                  <span>2. Panel del Subdirector</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  aria-current={activeTab === 'mantenimiento' ? 'page' : undefined}
                  onClick={() => setActiveTab('mantenimiento')}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'mantenimiento'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/10 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ClipboardList className="w-5 h-5 shrink-0" />
                  <span>3. Panel de Mantenimiento</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer del Sidebar */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Building className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider">Unidad Educativa IPN</span>
          </div>
          <p className="text-xs text-slate-400 m-0 leading-relaxed">
            © 2026 REPARA - 79.<br />
            <span className="text-slate-500 text-[10px]">Dirección de Administración y Servicios</span>
          </p>
        </div>
      </nav>

      {/* 
        MAIN CONTENT AREA
        Renderizado dinámico de la sección correspondiente al rol activo, con scroll independiente.
      */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        
        {/* ==================================================================== */}
        {/* 1. DASHBOARD DEL SOLICITANTE                                         */}
        {/* ==================================================================== */}
        {activeTab === 'solicitante' && (
          <section aria-labelledby="solicitante-title" className="space-y-8">
            {/* Encabezado */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0 hidden sm:block">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h1 id="solicitante-title" className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Dashboard del Solicitante
                  </h1>
                  <p className="text-slate-500 mt-1.5 leading-relaxed max-w-3xl">
                    Bienvenido, Ismael. En este portal podrás reportar inmediatamente cualquier desperfecto en las instalaciones públicas del plantel y comprobar el avance exacto de tus solicitudes vigentes.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario para Reportar un Desperfecto */}
            <article aria-labelledby="form-report-title" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 id="form-report-title" className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Reportar Nuevo Desperfecto en la Unidad
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Por favor, proporcione descripciones minuciosas y cargue la fotografía de evidencia inicial para agilizar la asignación de materiales por el equipo técnico.
                </p>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); alert('Reporte enviado con éxito (Maquetación Premium).'); }} 
                className="p-6 md:p-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Selector de Área */}
                  <div className="space-y-2">
                    <label htmlFor="area-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Área o Departamento <span className="text-red-500">*</span>
                    </label>
                    <select 
                      id="area-select" 
                      name="area" 
                      required 
                      defaultValue=""
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder-slate-400 cursor-pointer appearance-none"
                    >
                      <option value="" disabled>-- Seleccione un sector del plantel --</option>
                      <option value="sistemas">Sistemas / Laboratorio de Cómputo</option>
                      <option value="recursos_humanos">Recursos Humanos / Oficinas</option>
                      <option value="aulas">Aulas / Salones de Clase</option>
                      <option value="laboratorios">Laboratorios de Química y Física</option>
                      <option value="biblioteca">Biblioteca General</option>
                      <option value="exterior">Jardines y Fachada Exterior</option>
                      <option value="servicios_generales">Baños y Sanitarios Públicos</option>
                    </select>
                  </div>

                  {/* Tipo de Desperfecto */}
                  <div className="space-y-2">
                    <label htmlFor="desperfecto-type" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tipo de desperfecto o Falla <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="desperfecto-type" 
                      name="type" 
                      placeholder="Ej. Cortocircuito, Fuga de agua, Cerradura trabada, Cristal astillado" 
                      required 
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Ubicación Exacta */}
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ubicación exacta de la anomalía <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="location" 
                    name="location" 
                    placeholder="Ej. Aula 102, segunda fila de bancos pegada a la ventana izquierda" 
                    required 
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder-slate-400"
                  />
                  <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Sea lo más explícito posible para guiar eficientemente al electricista, pintor o plomero.
                  </p>
                </div>

                {/* Descripción Detallada */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Descripción detallada del problema <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="description" 
                    name="description" 
                    rows={4} 
                    placeholder="Escriba a fondo todas las características del desperfecto físico. ¿Desde cuándo se presenta? ¿Provoca algún riesgo inmediato?"
                    required 
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder-slate-400 resize-none"
                  />
                </div>

                {/* Carga del Archivo (Fotografía Inicial) - Dropzone Estilizado con Label */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fotografía Inicial de Evidencia de Falla <span className="text-red-500">*</span>
                  </span>
                  
                  <div className="relative">
                    <label 
                      htmlFor="initial-photo" 
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 rounded-2xl cursor-pointer p-8 transition-all text-center group"
                    >
                      <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors mb-3" />
                      <span className="text-sm font-semibold text-slate-700 block mb-0.5">
                        {uploadedFiles['initial-photo'] ? '¡Archivo seleccionado!' : 'Haga clic para cargar o arrastre la fotografía aquí'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {uploadedFiles['initial-photo'] ? uploadedFiles['initial-photo'] : 'Se permiten formatos PNG y JPG (resolución recomendada superior a 720p)'}
                      </span>
                      
                      <input 
                        type="file" 
                        id="initial-photo" 
                        name="photo" 
                        accept="image/*" 
                        required 
                        onChange={(e) => handleFileChange(e, 'initial-photo')}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* Botón de Enviar */}
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Enviar Reporte de Desperfecto e Iniciar Ticket
                  </button>
                </div>
              </form>
            </article>

            {/* List/Tabla con Historial de Tickets Reportados */}
            <section aria-labelledby="history-table-title" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 id="history-table-title" className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  Historial de Tickets Emitidos
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Registre el estado operativo en tiempo real de cada una de sus solicitudes elevadas a la administración.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">Relación de solicitudes presentadas en el ciclo administrativo actual</caption>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th scope="col" className="p-5">Folio</th>
                      <th scope="col" className="p-5">Fecha Reporte</th>
                      <th scope="col" className="p-5">Detalle / Tipo de Desperfecto</th>
                      <th scope="col" className="p-5">Área / Ubicación</th>
                      <th scope="col" className="p-5 text-right">Estatus Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Fila 1 */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-bold text-slate-900">#REP-7901</td>
                      <td className="p-5 text-slate-500 font-medium">12/06/2026</td>
                      <td className="p-5">
                        <div className="font-semibold text-slate-800">Fuga de gas en cocina escolar</div>
                        <div className="text-xs text-slate-400 mt-0.5">Nivel crítico bajo sospecha de agrietmiento</div>
                      </td>
                      <td className="p-5 text-slate-600">Cafetería Central (Cocina 1)</td>
                      <td className="p-5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          En Inspección Técnica
                        </span>
                      </td>
                    </tr>
                    {/* Fila 2 */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-bold text-slate-900">#REP-7902</td>
                      <td className="p-5 text-slate-500 font-medium">08/06/2026</td>
                      <td className="p-5">
                        <div className="font-semibold text-slate-800">Contacto de corriente roto</div>
                        <div className="text-xs text-slate-400 mt-0.5">Dos tomacorrientes dañados en aula grupal</div>
                      </td>
                      <td className="p-5 text-slate-600">Aula de Cómputo C (Muro Norte)</td>
                      <td className="p-5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Material Presupuestado
                        </span>
                      </td>
                    </tr>
                    {/* Fila 3 */}
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-bold text-slate-900">#REP-7903</td>
                      <td className="p-5 text-slate-500 font-medium">04/06/2026</td>
                      <td className="p-5">
                        <div className="font-semibold text-slate-800">Foco fundido en pasillo exterior</div>
                        <div className="text-xs text-slate-400 mt-0.5">Sustitución física de tubo LED dañado</div>
                      </td>
                      <td className="p-5 text-slate-600">Pasillo B (Sección Alumnos)</td>
                      <td className="p-5 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Reparación Completada
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </section>
        )}

        {/* ==================================================================== */}
        {/* 2. PANEL DEL SUBDIRECTOR ADMINISTRATIVO                              */}
        {/* ==================================================================== */}
        {activeTab === 'subdirector' && (
          <section aria-labelledby="subdirector-title" className="space-y-8">
            {/* Encabezado */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0 hidden sm:block">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h1 id="subdirector-title" className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Panel de Subdirección Administrativa
                  </h1>
                  <p className="text-slate-500 mt-1.5 leading-relaxed max-w-3xl">
                    Gestión presupuestal, administrativa y dictamen de obra. Revise con detenimiento las anomalías entrantes de personal autorizado y decida sobre las compras de material sugeridas por campo.
                  </p>
                </div>
              </div>
            </div>

            {/* Revisión de Tickets Entrantes (Autorizar / Rechazar con Motivo) */}
            <section aria-labelledby="revision-tickets-title" className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 id="revision-tickets-title" className="text-lg font-bold text-slate-800">
                  Tickets Pendientes de Dictamen Inicial
                </h2>
                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">1 Solicitud Pendiente</span>
              </div>

              {/* Fila de ticket de ejemplo a autorizar */}
              <article aria-labelledby="item-title-revisar" className="bg-white rounded-2xl border border-amber-200 shadow-md shadow-amber-900/5 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-amber-50/20">
                  <header>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 font-bold text-xs px-2 py-0.5 rounded-md">Urgente</span>
                      <span className="text-slate-400 font-semibold text-xs tracking-wider">TICKET #REP-7901</span>
                    </div>
                    <h3 id="item-title-revisar" className="text-lg font-bold text-slate-900 mt-1">
                      Fuga de gas LP en red de distribución central
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" /> Cafetería Central (Zona Cocina)</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 shrink-0" /> Emisor: Ismael Montalvo</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 shrink-0" /> Recibido: 12/06/2026</span>
                    </p>
                  </header>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-3 py-1 rounded-full text-xs">
                      <Clock className="w-3.5 h-3.5 shrink-0 animate-spin" />
                      Esperando Aprobación
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Descripción del Mal Funcionamiento</div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      "Se percibe un aroma penetrante a gas licuado de petróleo por las mañanas al abrir las áreas comunes. El personal operativo tiene temor fundado de encender los quemadores principales de mangueras y hornos. Se requiere inspección del herraje de inmediato."
                    </p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label htmlFor="reasons-textarea" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Especifique el motivo en caso de RECHAZAR la solicitud <span className="text-slate-400 font-normal">(Obligatorio únicamente en rechazo)</span>
                      </label>
                      <textarea
                        id="reasons-textarea"
                        name="rejection_reason"
                        rows={3}
                        placeholder="Ej. El herraje cuenta con seguro de instalación vigente del fabricante / Ya se ha canalizado una obra mayor por constructora externa..."
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder-slate-400 resize-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => alert('¡Ticket Autorizado con éxito!')} 
                        className="w-full sm:w-auto px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
                      >
                        Autorizar Orden de Trabajo #REP-7901
                      </button>
                      <button 
                        type="button" 
                        onClick={() => alert('¡El ticket ha sido RECHAZADO administrativamente!')} 
                        className="w-full sm:w-auto px-5 py-3.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        Rechazar Solicitud
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            </section>

            {/* Aprobar / Rechazar Lista de Materiales y Costos Estimados por Técnico */}
            <section aria-labelledby="materials-approval-title" className="space-y-5">
              <h2 id="materials-approval-title" className="text-lg font-bold text-slate-800">
                Presupuestos y Requisiciones de Insumos Técnicos
              </h2>

              {/* Item de presupuesto de materiales */}
              <article aria-labelledby="material-budget-title" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <header className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                  <div className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">
                    Corte de Presupuesto Técnico
                  </div>
                  <h3 id="material-budget-title" className="text-lg font-bold text-slate-900">
                    Requisición de Insumos para Cierre Dieléctrico de Tomacorrientes
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4">
                    <span><strong>Asociado al Folio:</strong> #REP-7902 - Contacto roto</span>
                    <span>•</span>
                    <span><strong>Técnico Evaluador:</strong> Ing. Manuel Ortiz</span>
                    <span>•</span>
                    <span><strong>Elaborado el:</strong> 14/06/2026</span>
                  </p>
                </header>

                <div className="p-6 md:p-8">
                  {/* Tabla de desglose de materiales */}
                  <div className="overflow-x-auto border border-slate-100 rounded-xl mb-6">
                    <table className="w-full border-collapse text-left text-sm">
                      <caption className="sr-only">Materiales requeridos para corrección dieléctrica en Aula C</caption>
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th scope="col" className="p-4">Material Sugerido</th>
                          <th scope="col" className="p-4">Código Técnico</th>
                          <th scope="col" className="p-4 text-center">Cantidad</th>
                          <th scope="col" className="p-4 text-right">Costo Unidad</th>
                          <th scope="col" className="p-4 text-right">Monto Estimado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-4 font-semibold text-slate-800">Contacto doble Leviton con placa blanca de PVC</td>
                          <td className="p-4"><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">CONT-002</code></td>
                          <td className="p-4 text-center font-medium">2 pzas</td>
                          <td className="p-4 text-right text-slate-600">$45.00</td>
                          <td className="p-4 text-right font-bold text-slate-900">$90.00</td>
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-800">Cable conductor calibre 12 cobre (Rollo 10 metros)</td>
                          <td className="p-4"><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">CAB-C12</code></td>
                          <td className="p-4 text-center font-medium">1 rollo</td>
                          <td className="p-4 text-right text-slate-600">$125.00</td>
                          <td className="p-4 text-right font-bold text-slate-900">$125.00</td>
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-800">Cinta aislante aisladora 3M Super 33 negra dieléctrica</td>
                          <td className="p-4"><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">CINT-3M</code></td>
                          <td className="p-4 text-center font-medium">1 pza</td>
                          <td className="p-4 text-right text-slate-600">$35.00</td>
                          <td className="p-4 text-right font-bold text-slate-900">$35.00</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50/70 font-semibold border-t-2 border-slate-200">
                          <th scope="row" colSpan={4} className="p-4 text-right text-slate-600 uppercase tracking-widest text-xs font-bold">Importe Total Cotizado:</th>
                          <td className="p-4 text-right text-lg font-extrabold text-blue-700">$250.00 MXN</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Acciones de aprobación del presupuesto */}
                  <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="budget-justification" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Anotaciones de Suministro Administrativo <span className="text-slate-400 font-normal">(Opcional)</span>
                      </label>
                      <input 
                        type="text" 
                        id="budget-justification" 
                        placeholder="Ej. Liquidación autorizada con cargo a partida presupuestal 401 de servicios preventivos..." 
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder-slate-400" 
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => alert('Lista de materiales autorizada. Se ha enviado órden de aprovisionamiento de almacén.')}
                        className="w-full sm:w-auto px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Aprobar y Comprar Material
                      </button>
                      <button 
                        type="button" 
                        onClick={() => alert('Presupuesto denegado. Se solicita al técnico cotizar componentes genéricos alternos.')}
                        className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 border border-slate-200 cursor-pointer"
                      >
                        Rechazar Presupuesto de Compra
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            </section>
          </section>
        )}

        {/* ==================================================================== */}
        {/* 3. PANEL DEL PERSONAL DE MANTENIMIENTO                              */}
        {/* ==================================================================== */}
        {activeTab === 'mantenimiento' && (
          <section aria-labelledby="mantenimiento-title" className="space-y-8">
            {/* Encabezado */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0 hidden sm:block">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h1 id="mantenimiento-title" className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Panel del Personal Técnico de Mantenimiento
                  </h1>
                  <p className="text-slate-500 mt-1.5 leading-relaxed max-w-3xl">
                    Herramientas de campo. Ingrese los materiales requeridos obtenidos tras realizar una inspección física reglamentaria y asocie evidencia visual contundente (Antes, Durante y Después) al momento de corregir el desperfecto.
                  </p>
                </div>
              </div>
            </div>

            {/* Inspección y Requisición de Materiales Requeridos */}
            <section aria-labelledby="inspection-materials-title" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 id="inspection-materials-title" className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  1. Registro de Inspección y Requisición de Materiales
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Relacione minuciosamente cada herraje, empaque o refacción extraída de su diagnóstico preliminar de campo para aprobación del Subdirector Administrativo.
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Metadatos del Ticket */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Inspección Asociada a:</span>
                    <strong className="text-slate-800 text-sm">Ticket #REP-7901 - Fuga alarmante de gas LP</strong>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Ubicación Registrada:</span>
                    <strong className="text-slate-800 text-sm">Cafetería Central — Cocina principal de estufa</strong>
                  </div>
                </div>

                {/* Tabla Dinámica de Materiales */}
                <div className="space-y-4">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Insumos anexados a la solicitud de abastecimiento
                  </span>

                  {materials.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No se han registrado materiales para este ticket.</p>
                      <p className="text-xs text-slate-400 mt-1">Utilice el formulario inferior para agregar insumos requeridos.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full border-collapse text-left text-sm">
                        <caption className="sr-only">Insumos anexados preliminarmente para la cotización de este ticket</caption>
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th scope="col" className="p-4">Material</th>
                            <th scope="col" className="p-4">Código Catálogo</th>
                            <th scope="col" className="p-4 text-center">Cantidad</th>
                            <th scope="col" className="p-4 text-right">Costo Est. Unitario</th>
                            <th scope="col" className="p-4 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {materials.map((mat, index) => (
                            <tr key={index} className="hover:bg-slate-50/20 transition-colors">
                              <td className="p-4 font-semibold text-slate-800">{mat.name}</td>
                              <td className="p-4"><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">{mat.code}</code></td>
                              <td className="p-4 text-center font-medium text-slate-600">{mat.qty} pzas</td>
                              <td className="p-4 text-right font-medium text-slate-700">${mat.cost.toFixed(2)}</td>
                              <td className="p-4 text-right">
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveMaterial(index)}
                                  className="p-1 px-2.5 rounded-lg text-xs bg-red-50 hover:bg-red-105 border border-red-100 text-red-600 font-semibold cursor-pointer transition-colors"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Formulario Interno para añadir items */}
                  <fieldset className="border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
                    <legend className="bg-slate-100 text-slate-700 px-3 py-1 text-xs font-extrabold uppercase tracking-widest rounded-full border border-slate-200">
                      Identificación de Nuevo Insumo
                    </legend>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Nombre Material */}
                      <div className="space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-1">
                        <label htmlFor="insumo-name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Nombre del Insumo / Refacción
                        </label>
                        <input 
                          type="text" 
                          id="insumo-name" 
                          value={newMaterial.name} 
                          onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                          placeholder="Ej. Cinta teflón de alta presión" 
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder-slate-400"
                        />
                      </div>

                      {/* Código de Inventario */}
                      <div className="space-y-1.5">
                        <label htmlFor="insumo-code" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Código de Inventario o Catálogo
                        </label>
                        <input 
                          type="text" 
                          id="insumo-code" 
                          value={newMaterial.code}
                          onChange={(e) => setNewMaterial({ ...newMaterial, code: e.target.value })}
                          placeholder="Ej. TEF-GAS-01" 
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder-slate-400"
                        />
                      </div>

                      {/* Cantidad */}
                      <div className="space-y-1.5">
                        <label htmlFor="insumo-qty" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Cantidad Requerida
                        </label>
                        <input 
                          type="number" 
                          id="insumo-qty" 
                          min="1"
                          value={newMaterial.qty}
                          onChange={(e) => setNewMaterial({ ...newMaterial, qty: Number(e.target.value) })}
                          placeholder="Ej. 2" 
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder-slate-400"
                        />
                      </div>

                      {/* Costo Unitario */}
                      <div className="space-y-1.5">
                        <label htmlFor="insumo-cost" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                          Costo Unitario ($)
                        </label>
                        <input 
                          type="number" 
                          id="insumo-cost" 
                          min="0"
                          step="0.01"
                          value={newMaterial.cost}
                          onChange={(e) => setNewMaterial({ ...newMaterial, cost: Number(e.target.value) })}
                          placeholder="Ej. 22.50" 
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="button" 
                        onClick={handleAddMaterial} 
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Anexar a la Lista
                      </button>
                    </div>
                  </fieldset>

                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => alert('¡Presupuesto y requisición presentados formalmente ante subdirección!')} 
                      className="w-full sm:w-auto px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      Enviar Requisición de Materiales Completa
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Formulario de Ejecución de la Reparación (Con Tres Inputs de Carga Especializada) */}
            <section aria-labelledby="execution-materials-title" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 id="execution-materials-title" className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  2. Cierre Técnico de Ticket y Reporte de Evidencias de Campo
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete los siguientes requisitos para corroborar la realización material del servicio de restauración en las instalaciones.
                </p>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); alert('Servicio técnico cerrado y archivado de forma exitosa (Estructura de Tres Evidencias).'); }} 
                className="p-6 md:p-8 space-y-6"
              >
                {/* Rejilla de Cargas Visuales Especializadas */}
                <div className="space-y-4">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fotografías Obligatorias de Evidencia de Campo <span className="text-red-500">*</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Input 1: ANTES */}
                    <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
                      <label htmlFor="photo-before" className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-center py-2 border-b border-slate-100">
                        1. Fotografía: "Antes"
                      </label>
                      <div className="relative mt-2">
                        <label 
                          htmlFor="photo-before" 
                          className="flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/5 rounded-xl cursor-pointer p-4 transition-all text-center h-44 group"
                        >
                          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
                          <span className="text-xs font-bold text-slate-700 block max-w-full truncate">
                            {uploadedFiles['photo-before'] ? '¡Cargado!' : 'Cargue Foto Inicial'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 truncate max-w-full">
                            {uploadedFiles['photo-before'] ? uploadedFiles['photo-before'] : 'Desperfecto original'}
                          </span>
                        </label>
                        <input 
                          type="file" 
                          id="photo-before" 
                          name="photoBefore" 
                          accept="image/*" 
                          required 
                          onChange={(e) => handleFileChange(e, 'photo-before')}
                          className="hidden" 
                        />
                      </div>
                    </div>

                    {/* Input 2: DURANTE */}
                    <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
                      <label htmlFor="photo-during" className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-center py-2 border-b border-slate-100">
                        2. Fotografía: "Durante"
                      </label>
                      <div className="relative mt-2">
                        <label 
                          htmlFor="photo-during" 
                          className="flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/5 rounded-xl cursor-pointer p-4 transition-all text-center h-44 group"
                        >
                          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
                          <span className="text-xs font-bold text-slate-700 block max-w-full truncate">
                            {uploadedFiles['photo-during'] ? '¡Cargado!' : 'Cargue Foto Proceso'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 truncate max-w-full">
                            {uploadedFiles['photo-during'] ? uploadedFiles['photo-during'] : 'Ejecución/Mano de obra'}
                          </span>
                        </label>
                        <input 
                          type="file" 
                          id="photo-during" 
                          name="photoDuring" 
                          accept="image/*" 
                          required 
                          onChange={(e) => handleFileChange(e, 'photo-during')}
                          className="hidden" 
                        />
                      </div>
                    </div>

                    {/* Input 3: DESPUÉS */}
                    <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
                      <label htmlFor="photo-after" className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-center py-2 border-b border-slate-100">
                        3. Fotografía: "Después"
                      </label>
                      <div className="relative mt-2">
                        <label 
                          htmlFor="photo-after" 
                          className="flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/5 rounded-xl cursor-pointer p-4 transition-all text-center h-44 group"
                        >
                          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-2" />
                          <span className="text-xs font-bold text-slate-700 block max-w-full truncate">
                            {uploadedFiles['photo-after'] ? '¡Cargado!' : 'Cargue Foto Final'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 truncate max-w-full">
                            {uploadedFiles['photo-after'] ? uploadedFiles['photo-after'] : 'Solución terminada'}
                          </span>
                        </label>
                        <input 
                          type="file" 
                          id="photo-after" 
                          name="photoAfter" 
                          accept="image/*" 
                          required 
                          onChange={(e) => handleFileChange(e, 'photo-after')}
                          className="hidden" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas Técnicas / Bitácora de Campo */}
                <div className="space-y-2">
                  <label htmlFor="technical-notes" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Notas Técnicas de Entrega (Bitácora de Campo) <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="technical-notes" 
                    name="execution_notes" 
                    rows={4} 
                    placeholder="Detalle de forma técnica los procedimientos implementados. Ejemplo: Se sustituyó manguera flexible de 1.5 metros para gas, se aplicó cinta teflón industrial a alta presión para tubería de gas LP en la acometida central y se realizaron verificaciones con medidor y agua jabonosa liberando la instalación con cero fugas." 
                    required 
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder-slate-400 resize-none"
                  />
                </div>

                {/* Botón de Submit del Cierre de Obra */}
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full sm:w-auto px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    Registrar Evidencias de Ejecución y Cerrar Ticket de Servicio
                  </button>
                </div>
              </form>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}
