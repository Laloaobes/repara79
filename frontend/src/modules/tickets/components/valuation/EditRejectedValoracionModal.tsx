import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import valoracionesService, { MiValoracion } from '../../services/valoracionesService';
import { MaterialRowDraft } from '../../types/valuation';
import ConfirmValuationDialog from './ConfirmValuationDialog';
import MaterialRowsEditor, { createInitialMaterialRow } from './MaterialRowsEditor';
import ValuationSummary from './ValuationSummary';
import { validateMaterialRows } from './ValuationForm';

interface EditRejectedValoracionModalProps {
  open: boolean;
  valoracion: MiValoracion | null;
  onClose: () => void;
  onSuccess: (valoracion: MiValoracion) => void;
}

const requestErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return 'No fue posible reenviar la valoración.';
  const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
  return (errors && Object.values(errors).flat()[0])
    || error.response?.data?.message
    || 'No fue posible reenviar la valoración.';
};

const EditRejectedValoracionModal = ({
  open,
  valoracion,
  onClose,
  onSuccess,
}: EditRejectedValoracionModalProps) => {
  const [observaciones, setObservaciones] = useState('');
  const [rows, setRows] = useState<MaterialRowDraft[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submissionLockRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !valoracion) return;

    setObservaciones(valoracion.observaciones);
    const materialRows = (valoracion.materiales || []).map((material) => ({
      id: material.id,
      localId: `material-${material.id}`,
      descripcion: material.descripcion,
      cantidad: String(material.cantidad),
      costo_unitario: material.costo_unitario,
    }));
    setRows(materialRows.length > 0 ? materialRows : [createInitialMaterialRow()]);
    setConfirmOpen(false);
    setError(null);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
  }, [open, valoracion]);

  if (!open || !valoracion) return null;

  const requestConfirmation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!observaciones.trim()) {
      setError('Las observaciones son obligatorias.');
      return;
    }
    if (observaciones.trim().length > 5000) {
      setError('Las observaciones no pueden exceder 5,000 caracteres.');
      return;
    }

    const rowsError = validateMaterialRows(rows);
    if (rowsError) {
      setError(rowsError);
      return;
    }

    setConfirmOpen(true);
  };

  const submit = async () => {
    if (submissionLockRef.current) return;
    submissionLockRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await valoracionesService.reenviar(valoracion.id, {
        observaciones: observaciones.trim(),
        materiales: rows.map((row) => ({
          id: row.id,
          descripcion: row.descripcion.trim(),
          cantidad: Number(row.cantidad),
          costo_unitario: Number(row.costo_unitario),
        })),
      });
      setConfirmOpen(false);
      onSuccess(updated);
    } catch (requestError) {
      console.error(requestError);
      setConfirmOpen(false);
      setError(requestErrorMessage(requestError));
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !isSubmitting) onClose();
          if (event.key === 'Tab') {
            const focusable = Array.from(
              dialogRef.current?.querySelectorAll<HTMLElement>(
                'button:not(:disabled), input:not(:disabled), textarea:not(:disabled)'
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
          aria-labelledby="editar-valoracion-titulo"
          className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[92vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <p className="text-[0.65rem] font-mono font-bold text-slate-400">
                TK-{String(valoracion.ticket.id).padStart(3, '0')}
              </p>
              <h2 id="editar-valoracion-titulo" className="text-lg font-bold text-slate-800">
                Corregir y reenviar valoración
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cerrar corrección"
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={requestConfirmation} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-bold text-red-800">Motivo de rechazo</p>
              <p className="mt-1 text-sm text-red-700">{valoracion.motivo_rechazo}</p>
            </div>

            <div>
              <label htmlFor="observaciones-corregidas" className="block text-xs font-bold text-slate-700 mb-2">
                Observaciones corregidas
              </label>
              <textarea
                id="observaciones-corregidas"
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
                rows={5}
                maxLength={5000}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#52b788] text-sm resize-none disabled:opacity-60"
              />
              <p className="mt-1 text-right text-[0.7rem] text-slate-400">{observaciones.length}/5000</p>
            </div>

            <MaterialRowsEditor rows={rows} onChange={setRows} disabled={isSubmitting} />
            <ValuationSummary rows={rows} />

            {error && (
              <p role="alert" className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#163d2a] text-white rounded-xl font-bold disabled:opacity-60"
              >
                Corregir y reenviar
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmValuationDialog
        open={confirmOpen}
        isSubmitting={isSubmitting}
        title="Confirmar reenvío"
        description="La valoración corregida volverá a Pendiente de autorización y será revisada nuevamente."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submit}
      />
    </>
  );
};

export default EditRejectedValoracionModal;
