import React, { useState } from 'react';
import { 
  Wrench, 
  User, 
  ClipboardList, 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  Building,
  Sparkles
} from 'lucide-react';

// Modular component imports
import Sidebar from '../../../components/Sidebar';
import StatusBadge from '../../../components/StatusBadge';
import EvidenceUploader from '../../../components/EvidenceUploader';
import Toast from '../../../components/Toast';
import EmptyState from '../../../components/EmptyState';
import TicketCard, { Ticket } from '../components/TicketCard';
import MaterialRow, { Material } from '../components/MaterialRow';

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<'solicitante' | 'subdirector' | 'mantenimiento'>('solicitante');

  // Dynamic ticket list for fully stateful simulation
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      folio: '#REP-7901',
      fecha: '12/06/2026',
      tipo: 'Fuga de gas en cocina escolar',
      descripcion: 'Se percibe un aroma penetrante a gas licuado de petróleo por las mañanas al abrir las áreas comunes. El personal operativo tiene temor fundado de encender los quemadores principales de mangueras y hornos. Se requiere inspección del herraje de inmediato.',
      ubicacion: 'Cafetería Central (Zona Cocina)',
      emisor: 'Ismael Montalvo López',
      estatus: 'inspeccion',
      urgencia: 'critica'
    },
    {
      folio: '#REP-7902',
      fecha: '08/06/2026',
      tipo: 'Contacto de corriente roto',
      descripcion: 'Dos tomacorrientes dañados con cables expuestos en aula grupal del laboratorio de computación.',
      ubicacion: 'Aula de Cómputo C (Muro Norte)',
      emisor: 'Ismael Montalvo López',
      estatus: 'presupuestado',
      urgencia: 'alta'
    },
    {
      folio: '#REP-7903',
      fecha: '04/06/2026',
      tipo: 'Foco fundido en pasillo exterior',
      descripcion: 'Sustitución física de tubo LED dañado en el pasillo principal que dificulta el tránsito nocturno.',
      ubicacion: 'Pasillo B (Sección Alumnos)',
      emisor: 'Ismael Montalvo López',
      estatus: 'completado',
      urgencia: 'baja'
    }
  ]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Material list state
  const [materials, setMaterials] = useState<Material[]>([
    { name: 'Teflón para tuberías de alta presión 3/4"', code: 'TEF-GAS-01', qty: 1, cost: 22.00 },
    { name: 'Manguera flexible tramada para gas 1.5m', code: 'MAG-FLEX-03', qty: 1, cost: 180.00 }
  ]);

  const [newMaterial, setNewMaterial] = useState({ name: '', code: '', qty: 1, cost: 0 });

  // Uploaded files track states
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: e.target.files![0].name
      }));
      setToast({
        message: `Archivo "${e.target.files[0].name}" listo para cargar.`,
        type: 'success'
      });
    }
  };

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.code) {
      setToast({
        message: 'Por favor, complete el nombre y código del insumo.',
        type: 'error'
      });
      return;
    }
    setMaterials(prev => [...prev, {
      name: newMaterial.name,
      code: newMaterial.code,
      qty: Number(newMaterial.qty),
      cost: Number(newMaterial.cost)
    }]);
    setNewMaterial({ name: '', code: '', qty: 1, cost: 0 });
    setToast({
      message: 'Insumo anexado temporalmente a la lista.',
      type: 'success'
    });
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
    setToast({
      message: 'Insumo eliminado del listado técnico.',
      type: 'success'
    });
  };

  // Create new ticket submission handle
  const handleCreateTicketSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const area = formData.get('area') as string;
    const type = formData.get('type') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;

    const newFolio = `#REP-790${tickets.length + 1}`;
    const newTicket: Ticket = {
      folio: newFolio,
      fecha: new Date().toLocaleDateString('es-MX'),
      tipo: type,
      descripcion: description,
      ubicacion: `${area.charAt(0).toUpperCase() + area.slice(1)} (${location})`,
      emisor: 'Ismael Montalvo López',
      estatus: 'inspeccion',
      urgencia: 'media'
    };

    setTickets(prev => [newTicket, ...prev]);
    setToast({
      message: `¡Ticket "${newFolio}" iniciado e ingresado a inspección técnica!`,
      type: 'success'
    });
    
    // Reset file form indicators
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy['initial-photo'];
      return copy;
    });
    e.currentTarget.reset();
  };

  // Authorize selected ticket state change
  const handleApproveTicket = (folio: string) => {
    setTickets(prev => prev.map(t => t.folio === folio ? { ...t, estatus: 'presupuestado' } : t));
    setToast({
      message: `Orden de trabajo ${folio} dictaminada y aprobada para presupuesto.`,
      type: 'success'
    });
  };

  // Reject selected ticket state change
  const handleRejectTicket = (folio: string, reason: string) => {
    setTickets(prev => prev.map(t => t.folio === folio ? { ...t, estatus: 'rechazado' } : t));
    setToast({
      message: `La solicitud ${folio} fue formalmente rechazada: "${reason || 'Sin justificación adicional'}".`,
      type: 'success'
    });
  };

  // Retorna el rol actual de manera amigable
  const getRoleLabel = () => {
    switch (activeTab) {
      case 'solicitante':
        return 'Usuario Solicitante';
      case 'subdirector':
        return 'Subdirector Administrativo';
      case 'mantenimiento':
        return 'Personal de Mantenimiento';
      default:
        return 'Usuario';
    }
  };

  // Calculations
  const totalCotizado = materials.reduce((acc, curr) => acc + (curr.qty * curr.cost), 0);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      
      {/* Dynamic Toast Container */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* RENDER SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        getRoleLabel={getRoleLabel} 
      />

      {/* RENDER MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        
        {/* ==================================================================== */}
        {/* 1. DASHBOARD DEL SOLICITANTE                                         */}
        {/* ==================================================================== */}
        {activeTab === 'solicitante' && (
          <section aria-labelledby="solicitante-title" className="space-y-8 animate-fade-in">
            {/* Encabezado */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-55 text-blue-600 rounded-2xl border border-blue-105 shrink-0 hidden sm:block">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h1 id="solicitante-title" className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    Dashboard del Solicitante
                    <Sparkles className="w-5 h-5 text-blue-550 animate-pulse" />
                  </h1>
                  <p className="text-slate-500 mt-1.5 leading-relaxed max-w-3xl font-medium text-sm">
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

              <form onSubmit={handleCreateTicketSubmit} className="p-6 md:p-8 space-y-6">
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
                      placeholder="Ej. Cortocircuito, Fuga de agua, Cerradura trabada" 
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
                  <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-1 font-medium">
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

                {/* Modular EvidenceUploader component */}
                <EvidenceUploader 
                  id="initial-photo"
                  label="Fotografía Inicial de Evidencia de Falla"
                  description="Se permiten formatos PNG y JPG (resolución recomendada superior a 720p)"
                  fileName={uploadedFiles['initial-photo']}
                  onChange={(e) => handleFileChange(e, 'initial-photo')}
                  required={true}
                />

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

              {tickets.length === 0 ? (
                <EmptyState 
                  title="No hay tickets emitidos" 
                  description="Aún no se han registrado desperfectos en el plantel. Use el formulario superior para crear el primero sugerido." 
                />
              ) : (
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
                      {tickets.map((t) => (
                        <tr key={t.folio} className="hover:bg-slate-55/60 transition-all duration-150">
                          <td className="p-5 font-bold text-slate-900">{t.folio}</td>
                          <td className="p-5 text-slate-500 font-semibold">{t.fecha}</td>
                          <td className="p-5">
                            <div className="font-bold text-slate-800">{t.tipo}</div>
                            <div className="text-xs text-slate-400 mt-1 line-clamp-1">{t.descripcion}</div>
                          </td>
                          <td className="p-5 text-slate-600 font-medium">{t.ubicacion}</td>
                          <td className="p-5 text-right">
                            <StatusBadge status={t.estatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </section>
        )}

        {/* ==================================================================== */}
        {/* 2. PANEL DEL SUBDIRECTOR ADMINISTRATIVO                              */}
        {/* ==================================================================== */}
        {activeTab === 'subdirector' && (
          <section aria-labelledby="subdirector-title" className="space-y-8 animate-fade-in">
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
                  <p className="text-slate-500 mt-1.5 leading-relaxed max-w-3xl font-medium text-sm">
                    Gestión presupuestal, administrativa y dictamen de obra. Revise con detenimiento las anomalías entrantes de personal autorizado y decida sobre las compras de material sugeridas por campo.
                  </p>
                </div>
              </div>
            </div>

            {/* Revisión de Tickets Entrantes utilizando el TicketCard modular */}
            <section aria-labelledby="revision-tickets-title" className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 id="revision-tickets-title" className="text-lg font-bold text-slate-800">
                  Tickets Pendientes de Dictamen Inicial
                </h2>
                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">
                  {tickets.filter(t => t.estatus === 'inspeccion').length} Pendientes
                </span>
              </div>

              {tickets.filter(t => t.estatus === 'inspeccion').length === 0 ? (
                <EmptyState 
                  title="Todos los tickets atendidos" 
                  description="No hay solicitudes pendientes de aprobación inicial por parte del subdirector." 
                />
              ) : (
                <div className="space-y-6">
                  {tickets.filter(t => t.estatus === 'inspeccion').map(ticket => (
                    <TicketCard 
                      key={ticket.folio}
                      ticket={ticket}
                      isAdminView={true}
                      onApprove={() => handleApproveTicket(ticket.folio)}
                      onReject={(reason) => handleRejectTicket(ticket.folio, reason)}
                    />
                  ))}
                </div>
              )}
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
                          <td className="p-4 text-center font-semibold text-slate-650">2 pzas</td>
                          <td className="p-4 text-right text-slate-600">$45.00</td>
                          <td className="p-4 text-right font-extrabold text-slate-900">$90.00</td>
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-800">Cable conductor calibre 12 cobre (Rollo 10 metros)</td>
                          <td className="p-4"><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">CAB-C12</code></td>
                          <td className="p-4 text-center font-semibold text-slate-650">1 rollo</td>
                          <td className="p-4 text-right text-slate-600">$125.00</td>
                          <td className="p-4 text-right font-extrabold text-slate-900">$125.00</td>
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-800">Cinta aislante aisladora 3M Super 33 negra dieléctrica</td>
                          <td className="p-4"><code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono">CINT-3M</code></td>
                          <td className="p-4 text-center font-semibold text-slate-650">1 pza</td>
                          <td className="p-4 text-right text-slate-600">$35.00</td>
                          <td className="p-4 text-right font-extrabold text-slate-900">$35.00</td>
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
                        onClick={() => {
                          setToast({
                            message: 'Lista de materiales autorizada. En almacén listan aprovisionamiento.',
                            type: 'success'
                          });
                        }}
                        className="w-full sm:w-auto px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Aprobar y Comprar Material
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={() => {
                          setToast({
                            message: 'Presupuesto suspendido temporalmente para redacción de cotizaciones alternas.',
                            type: 'error'
                          });
                        }}
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
          <section aria-labelledby="mantenimiento-title" className="space-y-8 animate-fade-in">
            {/* Encabezado */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shrink-0 hidden sm:block">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h1 id="mantenimiento-title" className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                    Panel de Mantenimiento Técnico
                  </h1>
                  <p className="text-slate-500 mt-1.5 leading-relaxed max-w-3xl font-medium text-sm">
                    Herramientas de campo. Ingrese los materiales requeridos obtenidos tras realizar una inspección física reglamentaria y asocie evidencia visual contundente (Antes, Durante y Después) al momento de corregir el desperfecto.
                  </p>
                </div>
              </div>
            </div>

            {/* Inspección y Requisición de Materiales Requeridos */}
            <section aria-labelledby="inspection-materials-title" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 id="inspection-materials-title" className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  1. Registro de Inspección y Requisición de Materiales
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Relacione minuciosamente cada herraje, empaque o refacción extraída de su diagnóstico preliminar de campo para aprobación de las oficinas administrativas de la subdirección.
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Metadatos del Ticket */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Inspección Asociada a:</span>
                    <strong className="text-slate-800 text-sm">Ticket #REP-7901 - Fuga de gas LP</strong>
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
                    <EmptyState 
                      title="No hay materiales asignados" 
                      description="No se han registrado materiales para este ticket actualmente. Utilice el formulario inferior para agregar los insumos requeridos." 
                    />
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-sm">
                      <table className="w-full border-collapse text-left text-sm">
                        <caption className="sr-only">Insumos anexados preliminarmente para la cotización de este ticket</caption>
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <th scope="col" className="p-4">Material</th>
                            <th scope="col" className="p-4">Código Catálogo</th>
                            <th scope="col" className="p-4 text-center">Cantidad</th>
                            <th scope="col" className="p-4 text-right">Costo Est. Unitario</th>
                            <th scope="col" className="p-4 text-right">Total</th>
                            <th scope="col" className="p-4 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {materials.map((mat, index) => (
                            <MaterialRow 
                              key={index}
                              material={mat}
                              index={index}
                              onRemove={handleRemoveMaterial}
                            />
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50/70 font-semibold border-t-2 border-slate-200">
                            <th scope="row" colSpan={4} className="p-4 text-right text-slate-600 uppercase tracking-widest text-xs font-bold">Importe Total Estimado:</th>
                            <td className="p-4 text-right text-base font-extrabold text-blue-700">${totalCotizado.toFixed(2)} MXN</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  {/* Formulario Interno para añadir items */}
                  <fieldset className="border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 bg-slate-50/20">
                    <legend className="bg-slate-100 text-slate-700 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest rounded-full border border-slate-200">
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
                          placeholder="Ej. Teflón para tuberías" 
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
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder-slate-400 animate-pulse-once"
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
                          placeholder="Ej. 1" 
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
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm hover:translate-y-[-1px]"
                      >
                        <Plus className="w-4 h-4" />
                        Anexar a la Lista
                      </button>
                    </div>
                  </fieldset>

                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => {
                        setToast({
                          message: '¡Requisición de insumos técnicos enviada formalmente ante oficinas de subdirección!',
                          type: 'success'
                        });
                      }} 
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
            <section aria-labelledby="execution-materials-title" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 id="execution-materials-title" className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  2. Cierre Técnico de Ticket y Reporte de Evidencias de Campo
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete los siguientes requisitos para corroborar la realización material del servicio de restauración en las instalaciones escolares.
                </p>
              </div>

              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  setToast({
                    message: 'Servicio cerrado con éxito. Las tres evidencias visuales fueron archivadas.',
                    type: 'success'
                  });
                  e.currentTarget.reset();
                  setUploadedFiles(prev => {
                    const copy = { ...prev };
                    delete copy['photo-before'];
                    delete copy['photo-during'];
                    delete copy['photo-after'];
                    return copy;
                  });
                }} 
                className="p-6 md:p-8 space-y-6"
              >
                {/* Rejilla de Cargas Visuales Especializadas a través de tres EvidenceUploader individuales */}
                <div className="space-y-4">
                  <span className="block text-xs font-bold text-slate-705 uppercase tracking-wider">
                    Galería Obligatoria de Ejecución Física de Campo <span className="text-red-500">*</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Input 1: ANTES */}
                    <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
                      <EvidenceUploader 
                        id="photo-before"
                        label="1. ¿Cómo estaba? (Antes)"
                        description="Captura el estado original del daño reportado"
                        fileName={uploadedFiles['photo-before']}
                        onChange={(e) => handleFileChange(e, 'photo-before')}
                        required={true}
                      />
                    </div>

                    {/* Input 2: DURANTE */}
                    <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
                      <EvidenceUploader 
                        id="photo-during"
                        label="2. Proceso (Durante)"
                        description="Captura al personal de obra realizando la labor"
                        fileName={uploadedFiles['photo-during']}
                        onChange={(e) => handleFileChange(e, 'photo-during')}
                        required={true}
                      />
                    </div>

                    {/* Input 3: DESPUÉS */}
                    <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
                      <EvidenceUploader 
                        id="photo-after"
                        label="3. Reparación (Después)"
                        description="Captura el acabado final restaurado al 100%"
                        fileName={uploadedFiles['photo-after']}
                        onChange={(e) => handleFileChange(e, 'photo-after')}
                        required={true}
                      />
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
                    placeholder="Detalle los procedimientos implementados. Ejemplo: Se sustituyó manguera flexible de 1.5 metros para gas, se aplicó cinta teflón industrial a alta presión para tubería de gas LP en la acometida central..." 
                    required 
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder-slate-400 resize-none font-medium"
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
