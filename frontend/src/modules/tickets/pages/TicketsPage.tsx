import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Hammer, MapPin, Calendar, UserCircle, Plus, AlertTriangle,
  Wrench, CheckCircle2, XCircle, UserCheck, X, DollarSign, Clock,
  ChevronDown, ChevronUp, Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewTicketModal from '../components/NewTicketModal';
import ticketService, { Ticket, EstadoTicket, PrioridadTicket } from '../services/ticketService';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../api/axios';

type EstadoFilter = 'todos' | EstadoTicket;

const estadoConfig: Record<EstadoTicket, { label: string; cls: string }> = {
  pendiente:  { label: 'Pendiente',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  valorado:   { label: 'Valorado',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  autorizado: { label: 'Autorizado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rechazado:  { label: 'Rechazado',  cls: 'bg-red-50 text-red-700 border-red-200' },
  reparado:   { label: 'Reparado',   cls: 'bg-green-50 text-green-800 border-green-200' },
};

const prioridadConfig: Record<PrioridadTicket, { label: string; cls: string }> = {
  critica: { label: 'Crítica', cls: 'bg-red-100 text-red-700' },
  alta:    { label: 'Alta',    cls: 'bg-orange-100 text-orange-700' },
  media:   { label: 'Media',   cls: 'bg-yellow-100 text-yellow-700' },
  baja:    { label: 'Baja',    cls: 'bg-slate-100 text-slate-600' },
};

const FILTERS: { label: string; value: EstadoFilter }[] = [
  { label: 'Todos',      value: 'todos'      },
  { label: 'Pendiente',  value: 'pendiente'  },
  { label: 'Valorado',   value: 'valorado'   },
  { label: 'Autorizado', value: 'autorizado' },
  { label: 'Rechazado',  value: 'rechazado'  },
  { label: 'Reparado',   value: 'reparado'   },
];

const Badge = ({ estado }: { estado: EstadoTicket }) => {
  const cfg = estadoConfig[estado] ?? { label: estado, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border ${cfg.cls} flex items-center gap-1`}>
      {estado === 'pendiente' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {cfg.label}
    </span>
  );
};

interface Tecnico { id: number; name: string; email: string; }

const TicketsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isNewModalOpen, setIsNewModalOpen]   = useState(false);
  const [activeFilter, setActiveFilter]         = useState<EstadoFilter>('todos');
  const [buscar, setBuscar]                     = useState('');
  const [debouncedBuscar, setDebouncedBuscar]   = useState('');
  const [tickets, setTickets]                   = useState<Ticket[]>([]);
  const [total, setTotal]                       = useState(0);
  const [isLoading, setIsLoading]               = useState(true);
  const [error, setError]                       = useState('');
  const [actionLoading, setActionLoading]       = useState<number | null>(null);
  const [expandedId, setExpandedId]             = useState<number | null>(null);

  // Listas auxiliares
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);

  // Modal: asignar técnico
  const [asignarTicket, setAsignarTicket] = useState<Ticket | null>(null);
  const [tecnicoId, setTecnicoId]         = useState<string>('');

  // Modal: rechazar
  const [rechazarTicket, setRechazarTicket] = useState<Ticket | null>(null);
  const [motivo, setMotivo]                 = useState('');
  const [motivoError, setMotivoError]       = useState('');

  // Modal: ver valoración
  const [valoracionTicket, setValoracionTicket] = useState<Ticket | null>(null);

  // Modal: subir evidencias
  const [evidenciasTicket, setEvidenciasTicket] = useState<Ticket | null>(null);
  const [evidenciasFiles, setEvidenciasFiles]   = useState<FileList | null>(null);
  const [evidenciasLoading, setEvidenciasLoading] = useState(false);

  /* ─── Debounce búsqueda ──────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBuscar(buscar), 300);
    return () => clearTimeout(t);
  }, [buscar]);

  /* ─── Carga de tickets ───────────────────────────────────────────── */
  const cargarTickets = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await ticketService.getAll({
        estado: activeFilter,
        buscar: debouncedBuscar || undefined,
      });
      setTickets(result.data);
      setTotal(result.total);
    } catch {
      setError('No se pudieron cargar los tickets.');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, debouncedBuscar]);

  useEffect(() => { cargarTickets(); }, [cargarTickets]);

  /* ─── Técnicos (solo admin) ─────────────────────────────────────── */
  useEffect(() => {
    if (user?.rol === 'Administrador') {
      ticketService.getTecnicos().then(setTecnicos).catch(() => {});
    }
  }, [user]);

  const rol = user?.rol ?? '';
  const esAdmin      = rol === 'Administrador';
  const esSubdirector = rol === 'Subdirector Administrativo';
  const esTecnico    = rol === 'Personal de Mantenimiento';
  const esEncargado  = rol === 'Responsable del Lugar';

  /* ─── Acciones ───────────────────────────────────────────────────── */
  const handleAsignar = async () => {
    if (!asignarTicket || !tecnicoId) return;
    setActionLoading(asignarTicket.id);
    try {
      await ticketService.asignar(asignarTicket.id, Number(tecnicoId));
      setAsignarTicket(null);
      cargarTickets();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message ?? 'Error al asignar.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutorizar = async (ticket: Ticket) => {
    if (!confirm('¿Autorizar esta valoración?')) return;
    setActionLoading(ticket.id);
    try {
      await ticketService.autorizar(ticket.id);
      cargarTickets();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message ?? 'Error al autorizar.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRechazar = async () => {
    if (!rechazarTicket) return;
    if (motivo.trim().length < 10) { setMotivoError('El motivo debe tener al menos 10 caracteres.'); return; }
    setMotivoError('');
    setActionLoading(rechazarTicket.id);
    try {
      await ticketService.rechazar(rechazarTicket.id, motivo.trim());
      setRechazarTicket(null);
      setMotivo('');
      cargarTickets();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message ?? 'Error al rechazar.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarcarReparado = async (ticket: Ticket) => {
    if (!confirm('¿Marcar este ticket como reparado?')) return;
    setActionLoading(ticket.id);
    try {
      await ticketService.marcarReparado(ticket.id);
      cargarTickets();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message ?? 'Error al marcar como reparado.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubirEvidencias = async () => {
    if (!evidenciasTicket || !evidenciasFiles?.length) return;
    setEvidenciasLoading(true);
    try {
      const fd = new FormData();
      Array.from(evidenciasFiles).forEach(f => fd.append('evidencias[]', f));
      await apiClient.post(`/tickets/${evidenciasTicket.id}/evidencias`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEvidenciasTicket(null);
      setEvidenciasFiles(null);
      cargarTickets();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err?.response?.data?.message ?? 'Error al subir evidencias.');
    } finally {
      setEvidenciasLoading(false);
    }
  };

  /* ─── Render acciones por rol/estado ─────────────────────────────── */
  const renderAcciones = (ticket: Ticket) => {
    const loading = actionLoading === ticket.id;

    const btnCls = (color: string) =>
      `px-3 py-1.5 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors disabled:opacity-60 ${color}`;

    const acciones: React.ReactNode[] = [];

    // Admin: asignar técnico (cualquier estado sin asignar, o re-asignar)
    if (esAdmin && (ticket.estado === 'pendiente' || ticket.estado === 'valorado')) {
      acciones.push(
        <button key="asignar" disabled={loading}
          onClick={() => { setAsignarTicket(ticket); setTecnicoId(ticket.asignado_a ? String(ticket.asignado_a) : ''); }}
          className={btnCls('bg-blue-600 hover:bg-blue-700')}>
          <UserCheck size={12} />
          {ticket.tecnico ? 'Reasignar técnico' : 'Asignar técnico'}
        </button>
      );
    }

    // Admin / Subdirector: autorizar y rechazar (solo cuando valorado)
    if ((esAdmin || esSubdirector) && ticket.estado === 'valorado') {
      if (ticket.valoracion) {
        acciones.push(
          <button key="ver-val"
            onClick={() => setValoracionTicket(ticket)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
            <DollarSign size={12} /> Ver valoración
          </button>
        );
      }
      acciones.push(
        <button key="autorizar" disabled={loading}
          onClick={() => handleAutorizar(ticket)}
          className={btnCls('bg-emerald-600 hover:bg-emerald-700')}>
          <CheckCircle2 size={12} /> Autorizar
        </button>
      );
      acciones.push(
        <button key="rechazar" disabled={loading}
          onClick={() => { setRechazarTicket(ticket); setMotivo(''); setMotivoError(''); }}
          className={btnCls('bg-red-600 hover:bg-red-700')}>
          <XCircle size={12} /> Rechazar
        </button>
      );
    }

    // Técnico: registrar valoración (pendiente, asignado a él o sin asignar)
    if (esTecnico && ticket.estado === 'pendiente') {
      acciones.push(
        <button key="valorar"
          onClick={() => navigate(`/valoracion/${ticket.id}`)}
          className={btnCls('bg-blue-600 hover:bg-blue-700')}>
          <Wrench size={12} /> Registrar valoración
        </button>
      );
    }

    // Técnico: marcar reparado (autorizado y asignado a él)
    if ((esTecnico || esAdmin) && ticket.estado === 'autorizado' && ticket.asignado_a === user?.id) {
      acciones.push(
        <button key="reparado" disabled={loading}
          onClick={() => handleMarcarReparado(ticket)}
          className={btnCls('bg-green-600 hover:bg-green-700')}>
          <CheckCircle2 size={12} /> Marcar reparado
        </button>
      );
    }

    // Encargado / cualquiera: subir evidencias adicionales a sus tickets
    if ((esEncargado || esAdmin) && ticket.estado === 'pendiente') {
      acciones.push(
        <button key="evidencias"
          onClick={() => { setEvidenciasTicket(ticket); setEvidenciasFiles(null); }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors">
          <Upload size={12} /> Agregar evidencias
        </button>
      );
    }

    if (acciones.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
        {acciones}
        {loading && <div className="w-4 h-4 border-2 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin self-center" />}
      </div>
    );
  };

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto">

      {/* Modal: nuevo ticket */}
      <NewTicketModal isOpen={isNewModalOpen} onClose={() => { setIsNewModalOpen(false); cargarTickets(); }} />

      {/* ── Modal: asignar técnico ── */}
      {asignarTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setAsignarTicket(null)}>
          <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Asignar técnico</h2>
              <button onClick={() => setAsignarTicket(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500 -mt-2 font-medium">{asignarTicket.folio} — {asignarTicket.categoria}</p>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block">Técnico *</label>
              <select value={tecnicoId} onChange={e => setTecnicoId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium">
                <option value="">Selecciona un técnico...</option>
                {tecnicos.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setAsignarTicket(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={handleAsignar} disabled={!tecnicoId || actionLoading === asignarTicket.id}
                className="flex-1 py-3 bg-[#163d2a] hover:bg-[#1e4535] disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-lg">
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: rechazar ── */}
      {rechazarTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setRechazarTicket(null)}>
          <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Rechazar valoración</h2>
              <button onClick={() => setRechazarTicket(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500 -mt-2 font-medium">{rechazarTicket.folio} — {rechazarTicket.categoria}</p>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block">Motivo del rechazo *</label>
              <textarea
                rows={4} value={motivo} onChange={e => { setMotivo(e.target.value); setMotivoError(''); }}
                placeholder="Describe el motivo del rechazo (mínimo 10 caracteres)..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none text-sm font-medium resize-none"
              />
              {motivoError && <p className="text-xs text-red-600 font-medium mt-1">{motivoError}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setRechazarTicket(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={handleRechazar} disabled={actionLoading === rechazarTicket.id}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-lg">
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: ver valoración ── */}
      {valoracionTicket?.valoracion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setValoracionTicket(null)}>
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Detalle de valoración</h2>
                <p className="text-xs text-slate-500 mt-0.5">{valoracionTicket.folio} — {valoracionTicket.categoria}</p>
              </div>
              <button onClick={() => setValoracionTicket(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-wider text-slate-400 mb-1">
                    <Clock size={11} /> Tiempo estimado
                  </div>
                  <p className="text-xl font-black text-slate-800">{valoracionTicket.valoracion.tiempo_estimado} h</p>
                </div>
                <div className="bg-[#2d6a4f]/5 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-wider text-[#2d6a4f] mb-1">
                    <DollarSign size={11} /> Costo total
                  </div>
                  <p className="text-xl font-black text-[#163d2a]">
                    ${Number(valoracionTicket.valoracion.costo_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {valoracionTicket.valoracion.observaciones && (
                <div>
                  <p className="text-[0.7rem] font-black uppercase tracking-wider text-slate-400 mb-1.5">Observaciones</p>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{valoracionTicket.valoracion.observaciones}</p>
                </div>
              )}
              {valoracionTicket.valoracion.materiales?.length ? (
                <div>
                  <p className="text-[0.7rem] font-black uppercase tracking-wider text-slate-400 mb-2">Materiales</p>
                  <div className="flex flex-col gap-1.5">
                    {valoracionTicket.valoracion.materiales.map((m, i) => (
                      <div key={i} className="flex justify-between items-center text-xs font-medium text-slate-600 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                        <span>{m.nombre} <span className="text-slate-400">×{m.cantidad}</span></span>
                        <span className="font-bold text-slate-700">${Number(m.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50/50 rounded-b-[2rem]">
              <button onClick={() => { handleAutorizar(valoracionTicket); setValoracionTicket(null); }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> Autorizar
              </button>
              <button onClick={() => { setRechazarTicket(valoracionTicket); setValoracionTicket(null); setMotivo(''); setMotivoError(''); }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <XCircle size={16} /> Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: subir evidencias ── */}
      {evidenciasTicket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setEvidenciasTicket(null)}>
          <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-6 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Agregar evidencias</h2>
              <button onClick={() => setEvidenciasTicket(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500 -mt-2 font-medium">{evidenciasTicket.folio}</p>
            <div className="relative border-2 border-dashed border-[#52b788]/30 bg-[#f0fdf4]/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-[#f0fdf4]">
              <input type="file" accept="image/png,image/jpeg" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={e => setEvidenciasFiles(e.target.files)} />
              <Upload size={20} className="mx-auto text-[#52b788] mb-2" />
              <p className="text-sm font-bold text-[#163d2a]">
                {evidenciasFiles?.length ? `${evidenciasFiles.length} archivo(s) seleccionado(s)` : 'Selecciona imágenes'}
              </p>
              <p className="text-[0.65rem] text-[#163d2a]/60 mt-1 uppercase tracking-widest">PNG, JPG — máx 5 MB</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEvidenciasTicket(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={handleSubirEvidencias} disabled={!evidenciasFiles?.length || evidenciasLoading}
                className="flex-1 py-3 bg-[#163d2a] hover:bg-[#1e4535] disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-lg">
                {evidenciasLoading ? 'Subiendo...' : 'Subir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Gestión de Tickets</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {isLoading ? 'Cargando...' : `${total} reporte${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        {(esEncargado || esAdmin) && (
          <button onClick={() => setIsNewModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1e4535] text-white rounded-xl font-bold transition-all text-sm shadow-md">
            <Plus size={16} strokeWidth={3} /> Nuevo Reporte
          </button>
        )}
      </div>

      {/* ── Búsqueda ── */}
      <div className="relative w-full shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="Buscar por folio, categoría, descripción..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium"
        />
      </div>

      {/* ── Filtros ── */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setActiveFilter(f.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[0.8rem] font-bold transition-all border shrink-0
              ${activeFilter === f.value ? 'bg-[#163d2a] text-white border-[#163d2a] shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Contenido ── */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 flex flex-col items-center gap-3">
          <AlertTriangle size={32} className="text-red-400" />
          <p className="text-slate-600 font-medium">{error}</p>
          <button onClick={cargarTickets} className="px-4 py-2 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold">Reintentar</button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-3 bg-white rounded-3xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <Search size={24} />
          </div>
          <p className="text-slate-700 font-bold">No hay reportes</p>
          <p className="text-slate-500 text-sm">No se encontraron tickets con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          {tickets.map(ticket => {
            const isExpanded = expandedId === ticket.id;
            return (
              <div key={ticket.id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Fila principal */}
                <div className="p-2 pr-4 md:pr-6 flex flex-col md:flex-row gap-4 items-start md:items-center">

                  {/* Miniatura / evidencia */}
                  <div className={`w-full md:w-40 h-36 rounded-[1.2rem] shrink-0 overflow-hidden flex items-center justify-center bg-slate-50 border border-slate-100
                    ${ticket.estado === 'pendiente' ? 'border-amber-100 bg-amber-50/30' : ''}
                    ${ticket.estado === 'rechazado' ? 'border-red-100 bg-red-50/20' : ''}`}>
                    {ticket.evidencias && ticket.evidencias.length > 0 ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${ticket.evidencias[0].ruta_archivo}`}
                        alt="Evidencia" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <Hammer size={32} className="text-slate-200" />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 px-3 pb-3 md:p-2 min-w-0 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge estado={ticket.estado} />
                        {ticket.prioridad && (
                          <span className={`px-2 py-0.5 rounded-md text-[0.65rem] font-bold ${prioridadConfig[ticket.prioridad]?.cls ?? ''}`}>
                            {prioridadConfig[ticket.prioridad]?.label ?? ticket.prioridad}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.65rem] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">{ticket.folio}</span>
                        <button onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-[1.05rem] font-bold text-slate-800 mb-1.5 truncate">
                      {ticket.categoria} — {ticket.ubicacion_exacta}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{ticket.descripcion}</p>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[0.7rem] font-medium text-slate-500 pt-3 border-t border-slate-50">
                      {ticket.zona && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {ticket.zona.nombre}</span>}
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" />
                        {new Date(ticket.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5 md:ml-auto font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <UserCircle size={14} className={ticket.tecnico ? 'text-[#52b788]' : 'text-slate-400'} />
                        {ticket.tecnico?.name ?? 'Sin asignar'}
                      </span>
                    </div>

                    {/* Motivo de rechazo */}
                    {ticket.estado === 'rechazado' && ticket.motivo_rechazo && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-[0.65rem] font-black uppercase tracking-wider text-red-400 mb-1">Motivo de rechazo</p>
                        <p className="text-xs text-red-700 leading-relaxed">{ticket.motivo_rechazo}</p>
                      </div>
                    )}

                    {/* Resumen valoración si existe */}
                    {ticket.valoracion && ticket.estado !== 'rechazado' && (
                      <div className="mt-3 flex items-center gap-3 p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs font-medium text-blue-700">
                        <DollarSign size={14} />
                        <span>Valoración: <strong>{ticket.valoracion.tiempo_estimado}h</strong> estimadas —</span>
                        <span className="font-black">${Number(ticket.valoracion.costo_total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {/* Acciones */}
                    {renderAcciones(ticket)}
                  </div>
                </div>

                {/* Panel expandible: historial del ticket */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4 bg-slate-50/40">
                    <p className="text-[0.7rem] font-black uppercase tracking-wider text-slate-400 mb-3">Información adicional</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                      {ticket.creador && (
                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                          <p className="text-[0.65rem] font-bold text-slate-400 uppercase mb-1">Creado por</p>
                          <p className="font-bold">{ticket.creador.name}</p>
                        </div>
                      )}
                      {ticket.zona && (
                        <div className="bg-white rounded-xl p-3 border border-slate-100">
                          <p className="text-[0.65rem] font-bold text-slate-400 uppercase mb-1">Zona</p>
                          <p className="font-bold">{ticket.zona.nombre}</p>
                        </div>
                      )}
                      <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <p className="text-[0.65rem] font-bold text-slate-400 uppercase mb-1">Prioridad</p>
                        <p className="font-bold">{prioridadConfig[ticket.prioridad]?.label ?? ticket.prioridad}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <p className="text-[0.65rem] font-bold text-slate-400 uppercase mb-1">Evidencias</p>
                        <p className="font-bold">{ticket.evidencias?.length ?? 0} archivo(s)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
