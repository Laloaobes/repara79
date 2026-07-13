import React, { useEffect, useState } from 'react';
import { ClipboardCheck, MapPin, UserCircle, Wrench, X, Check, Ban } from 'lucide-react';
import valoracionesService, { ValoracionPendiente } from '../services/valoracionesService';
import { formatCurrency } from '../../../utils/currency';

const ValoracionesPorAprobarPage = () => {
  const [valoraciones, setValoraciones] = useState<ValoracionPendiente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<ValoracionPendiente | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadPendientes = async () => {
    try {
      const data = await valoracionesService.getPendientes();
      setValoraciones(data);
    } catch (err) {
      console.error(err);
      setError('No fue posible cargar las valoraciones pendientes. Verifica que el backend esté activo y que las rutas de valoraciones respondan correctamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendientes();
  }, []);

  const closeModal = () => {
    setSelected(null);
    setIsRejecting(false);
    setMotivoRechazo('');
    setError(null);
  };

  const handleAutorizar = async () => {
    if (!selected) return;
    setIsProcessing(true);
    setError(null);

    try {
      await valoracionesService.autorizar(selected.id);
      setValoraciones((prev) => prev.filter((v) => v.id !== selected.id));
      closeModal();
    } catch (err) {
      console.error(err);
      setError('No fue posible autorizar la valoraciÃ³n.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRechazar = async () => {
    if (!selected || !motivoRechazo.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      await valoracionesService.rechazar(selected.id, motivoRechazo.trim());
      setValoraciones((prev) => prev.filter((v) => v.id !== selected.id));
      closeModal();
    } catch (err) {
      console.error(err);
      setError('No fue posible rechazar la valoraciÃ³n.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm font-bold text-slate-500">Cargando valoraciones...</div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <ClipboardCheck size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Valoraciones por Aprobar</h1>
          <p className="text-sm text-slate-500">{valoraciones.length} pendientes de revisiÃ³n</p>
        </div>
      </div>

      {error && !selected && (
        <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {valoraciones.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
          <h3 className="text-slate-800 font-bold mb-1">No hay valoraciones pendientes</h3>
          <p className="text-slate-500 text-sm">Cuando mantenimiento registre una nueva, aparecerÃ¡ aquÃ­.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {valoraciones.map((valoracion) => (
            <button
              key={valoracion.id}
              onClick={() => setSelected(valoracion)}
              className="text-left bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-3 md:gap-6"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{valoracion.ticket.titulo}</h3>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {valoracion.ticket.area?.nombre || 'Sin Ã¡rea'}</span>
                  <span className="flex items-center gap-1"><UserCircle size={12} /> {valoracion.tecnico?.name || 'Sin asignar'}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-black text-slate-800">{formatCurrency(valoracion.costo_estimado)}</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-wide text-amber-600">Pendiente</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{selected.ticket.titulo}</h2>
                <p className="text-xs text-slate-500 mt-1">{selected.ticket.ubicacion}</p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><UserCircle size={14} /> TÃ©cnico: {selected.tecnico?.name || 'Sin asignar'}</span>
                <span className="flex items-center gap-1.5"><Wrench size={14} /> ReportÃ³: {selected.ticket.usuario?.name || 'Usuario'}</span>
              </div>

              {selected.materiales && selected.materiales.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-900 mb-2">Materiales y costos</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {selected.materiales.map((material, index) => (
                      <div
                        key={`${material.descripcion}-${index}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm border-b border-slate-100 last:border-b-0"
                      >
                        <span className="text-slate-700">{material.descripcion}</span>
                        <span className="font-bold text-slate-800">{formatCurrency(material.costo)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 text-sm">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="font-black text-slate-900">{formatCurrency(selected.costo_estimado)}</span>
                    </div>
                  </div>
                </div>
              )}

              {selected.observaciones && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-900 mb-2">Observaciones de la valoraciÃ³n</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{selected.observaciones}</p>
                </div>
              )}

              {error && (
                <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {isRejecting && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Motivo del rechazo</label>
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    rows={3}
                    autoFocus
                    placeholder="Explica por quÃ© se rechaza esta valoraciÃ³n..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all text-sm resize-none"
                  />
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50 rounded-b-[2rem]">
              {isRejecting ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setIsRejecting(false); setMotivoRechazo(''); }}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleRechazar}
                    disabled={isProcessing || !motivoRechazo.trim()}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Ban size={16} /> {isProcessing ? 'Rechazando...' : 'Confirmar rechazo'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRejecting(true)}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Ban size={16} /> Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={handleAutorizar}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-[#163d2a] hover:bg-[#1e4535] text-white rounded-xl font-bold transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> {isProcessing ? 'Autorizando...' : 'Autorizar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValoracionesPorAprobarPage;

