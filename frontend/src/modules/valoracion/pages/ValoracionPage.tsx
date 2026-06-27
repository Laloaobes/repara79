import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, AlertTriangle, ArrowLeft, Wrench, CheckCircle2 } from 'lucide-react';
import ticketService, { Ticket } from '../../tickets/services/ticketService';
import valoracionService, { MaterialInput } from '../services/valoracionService';

interface MaterialRow extends MaterialInput {
  _key: number;
}

let keyCounter = 0;
const newRow = (): MaterialRow => ({ _key: ++keyCounter, nombre: '', cantidad: 1, precio_unitario: 0 });

const ValoracionPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const id = Number(ticketId);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [tiempoEstimado, setTiempoEstimado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [materiales, setMateriales] = useState<MaterialRow[]>([newRow()]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    ticketService.getById(id)
      .then(t => {
        setTicket(t);
        if (t.valoracion) {
          setTiempoEstimado(String(t.valoracion.tiempo_estimado));
          setObservaciones(t.valoracion.observaciones ?? '');
        }
      })
      .catch(() => setLoadError('No se pudo cargar el ticket.'))
      .finally(() => setIsLoadingTicket(false));

    valoracionService.getByTicket(id)
      .then(v => {
        if (v?.materiales?.length) {
          setMateriales(v.materiales.map(m => ({
            _key: ++keyCounter,
            nombre: m.nombre,
            cantidad: m.cantidad,
            precio_unitario: m.precio_unitario,
          })));
        }
      })
      .catch(() => {});
  }, [id]);

  const updateRow = (key: number, field: keyof MaterialInput, value: string | number) => {
    setMateriales(prev => prev.map(r => {
      if (r._key !== key) return r;
      const updated = { ...r, [field]: field === 'nombre' ? value : Number(value) };
      return updated;
    }));
  };

  const removeRow = (key: number) => {
    if (materiales.length === 1) return;
    setMateriales(prev => prev.filter(r => r._key !== key));
  };

  const costoTotal = materiales.reduce((sum, m) => sum + (m.cantidad * m.precio_unitario), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!tiempoEstimado || Number(tiempoEstimado) <= 0) {
      setSubmitError('El tiempo estimado debe ser mayor a 0 horas.');
      return;
    }
    const validMateriales = materiales.filter(m => m.nombre.trim());
    setIsSubmitting(true);
    try {
      await valoracionService.save(id, {
        tiempo_estimado: Number(tiempoEstimado),
        observaciones: observaciones.trim() || undefined,
        materiales: validMateriales.map(({ nombre, cantidad, precio_unitario }) => ({ nombre, cantidad, precio_unitario })),
      });
      setSuccess(true);
      setTimeout(() => navigate('/tickets'), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msgs = e?.response?.data?.errors;
      setSubmitError(msgs ? Object.values(msgs).flat().join(' ') : (e?.response?.data?.message ?? 'Error al guardar la valoración.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTicket) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !ticket) {
    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-slate-700 font-bold">{loadError || 'Ticket no encontrado.'}</p>
        <button onClick={() => navigate('/tickets')} className="px-4 py-2 bg-[#2d6a4f] text-white rounded-xl text-sm font-bold">
          Volver a Tickets
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
          <CheckCircle2 size={32} />
        </div>
        <p className="text-slate-800 font-bold text-lg">Valoración registrada</p>
        <p className="text-slate-500 text-sm">El ticket ha pasado a estado "Valorado". Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tickets')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Registrar Valoración</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{ticket.folio} — {ticket.categoria}</p>
        </div>
      </div>

      {/* Resumen del ticket */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
          <Wrench size={14} /> Detalle del reporte
        </div>
        <p className="text-sm text-slate-700 font-medium">{ticket.ubicacion_exacta}</p>
        <p className="text-sm text-slate-500 leading-relaxed">{ticket.descripcion}</p>
        {ticket.zona && (
          <p className="text-xs text-slate-400 font-medium mt-1">Zona: {ticket.zona.nombre}</p>
        )}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {submitError && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {submitError}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Información general</h2>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Tiempo estimado (horas) *</label>
            <input
              type="number" min={1} value={tiempoEstimado}
              onChange={e => setTiempoEstimado(e.target.value)} required
              placeholder="Ej. 4"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Observaciones técnicas</label>
            <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3}
              placeholder="Notas adicionales del técnico..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium resize-none"
            />
          </div>
        </div>

        {/* Materiales */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Materiales requeridos</h2>
            <button
              type="button" onClick={() => setMateriales(prev => [...prev, newRow()])}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2d6a4f] hover:bg-[#2d6a4f]/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} /> Agregar
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_100px_32px] gap-2 px-1">
              <span className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400">Material</span>
              <span className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400 text-center">Cant.</span>
              <span className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400 text-right">Precio u.</span>
              <span />
            </div>

            {materiales.map((row) => (
              <div key={row._key} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center">
                <input
                  type="text" value={row.nombre}
                  onChange={e => updateRow(row._key, 'nombre', e.target.value)}
                  placeholder="Nombre del material"
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#52b788] focus:border-transparent"
                />
                <input
                  type="number" min={1} value={row.cantidad}
                  onChange={e => updateRow(row._key, 'cantidad', e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-center outline-none focus:ring-2 focus:ring-[#52b788] focus:border-transparent"
                />
                <input
                  type="number" min={0} step="0.01" value={row.precio_unitario}
                  onChange={e => updateRow(row._key, 'precio_unitario', e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-right outline-none focus:ring-2 focus:ring-[#52b788] focus:border-transparent"
                />
                <button
                  type="button" onClick={() => removeRow(row._key)}
                  disabled={materiales.length === 1}
                  className="p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-30 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <span className="text-sm font-bold text-slate-500">Costo total estimado</span>
            <span className="text-xl font-black text-slate-800">
              ${costoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button" onClick={() => navigate('/tickets')}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit" disabled={isSubmitting}
            className="flex-1 py-4 bg-[#163d2a] hover:bg-[#1e4535] disabled:opacity-60 text-white rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-[0.98]"
          >
            {isSubmitting ? 'Guardando...' : 'Registrar Valoración'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ValoracionPage;
