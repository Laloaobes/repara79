import React, { useEffect, useRef, useState } from 'react';
import { Ban, Check, MapPin, UserCircle, Wrench, X } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';
import { ValoracionPendiente } from '../../services/valoracionesService';
import RechazarValoracionForm from './RechazarValoracionForm';

interface ValoracionDetailModalProps {
  open: boolean;
  valoracion: ValoracionPendiente | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  onClose: () => void;
  onAutorizar: () => Promise<void>;
  onRechazar: (reason: string) => Promise<void>;
}

type ActionMode = 'none' | 'authorize' | 'reject';

const ValoracionDetailModal = ({
  open,
  valoracion,
  isLoading,
  isProcessing,
  error,
  onClose,
  onAutorizar,
  onRechazar,
}: ValoracionDetailModalProps) => {
  const [mode, setMode] = useState<ActionMode>('none');
  const [reason, setReason] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMode('none');
      setReason('');
      window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    }
  }, [open, valoracion?.id]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !isProcessing) onClose();
        if (event.key === 'Tab') {
          const focusable = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(
              'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled)'
            ) || []
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-valoracion-titulo"
        className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <p className="text-[0.65rem] font-mono font-bold text-slate-400">
              {valoracion?.ticket.folio || 'Detalle administrativo'}
            </p>
            <h2 id="detalle-valoracion-titulo" className="text-lg font-bold text-slate-800">
              {valoracion?.ticket.titulo || 'Cargando valoración'}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Cerrar detalle"
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {isLoading || !valoracion ? (
            <p className="py-12 text-center text-sm font-bold text-slate-500">
              {isLoading ? 'Cargando detalle...' : 'No fue posible cargar el detalle.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {valoracion.ticket.area?.nombre || 'Sin área'}
                  {valoracion.ticket.area?.sede?.nombre ? ` · ${valoracion.ticket.area.sede.nombre}` : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <UserCircle size={14} /> Reportó: {valoracion.ticket.usuario?.name || 'Sin reportante'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Wrench size={14} /> Valoró: {valoracion.tecnico?.name || 'Sin autor'}
                </span>
                <span className="text-slate-500">Ubicación: {valoracion.ticket.ubicacion}</span>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-900 mb-2">
                  Desperfecto
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {valoracion.ticket.descripcion_desperfecto}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-900 mb-2">
                  Observaciones de mantenimiento
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">{valoracion.observaciones}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-900 mb-2">
                  Materiales y costos
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  {(valoracion.materiales || []).map((material) => (
                    <div
                      key={material.id}
                      className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-4 py-2.5 text-sm border-b border-slate-100"
                    >
                      <span className="text-slate-700">{material.descripcion}</span>
                      <span className="font-bold text-slate-800">{formatCurrency(material.subtotal)}</span>
                      <span className="text-[0.7rem] text-slate-500">
                        {material.cantidad} × {formatCurrency(material.costo_unitario)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-3 bg-slate-50 text-sm">
                    <span className="font-bold">Total oficial</span>
                    <span className="font-black">{formatCurrency(valoracion.costo_estimado)}</span>
                  </div>
                </div>
              </div>

              {mode === 'authorize' && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-bold text-emerald-900">¿Confirmas la autorización?</p>
                  <p className="mt-1 text-xs text-emerald-800">
                    El ticket quedará Autorizado y podrá iniciar su reparación.
                  </p>
                </div>
              )}

              {mode === 'reject' && (
                <RechazarValoracionForm value={reason} onChange={setReason} disabled={isProcessing} />
              )}
            </>
          )}

          {error && (
            <p role="alert" className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {!isLoading && valoracion && (
          <div className="p-4 md:p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/50 rounded-b-[2rem]">
            {mode === 'none' ? (
              <>
                <button
                  type="button"
                  onClick={() => setMode('reject')}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Ban size={16} /> Rechazar
                </button>
                <button
                  type="button"
                  onClick={() => setMode('authorize')}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#163d2a] text-white rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Autorizar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMode('none')}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => mode === 'authorize' ? onAutorizar() : onRechazar(reason.trim())}
                  disabled={isProcessing || (mode === 'reject' && reason.trim().length < 5)}
                  className={`flex-1 py-3 text-white rounded-xl font-bold disabled:opacity-60 ${
                    mode === 'authorize' ? 'bg-[#163d2a]' : 'bg-red-600'
                  }`}
                >
                  {isProcessing ? 'Procesando...' : mode === 'authorize' ? 'Confirmar autorización' : 'Confirmar rechazo'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValoracionDetailModal;
