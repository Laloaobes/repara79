import React, { useRef, useState } from 'react';
import axios from 'axios';
import ticketsService from '../../services/ticketsService';
import { MaterialRowDraft } from '../../types/valuation';
import ConfirmValuationDialog from './ConfirmValuationDialog';
import MaterialRowsEditor, { createInitialMaterialRow } from './MaterialRowsEditor';
import ValuationSummary from './ValuationSummary';

interface ValuationFormProps {
  ticketId: number;
  onSuccess: () => Promise<void> | void;
}

export const validateMaterialRows = (rows: MaterialRowDraft[]): string | null => {
  if (rows.length < 1 || rows.length > 50) {
    return 'La valoración debe contener entre 1 y 50 materiales.';
  }

  for (const [index, row] of rows.entries()) {
    if (!row.descripcion.trim()) return `El material ${index + 1} requiere descripción.`;
    if (!/^\d+$/.test(row.cantidad) || Number(row.cantidad) < 1 || Number(row.cantidad) > 1000000) {
      return `La cantidad del material ${index + 1} debe ser un entero entre 1 y 1,000,000.`;
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(row.costo_unitario)
      || Number(row.costo_unitario) > 99999999.99) {
      return `El costo unitario del material ${index + 1} debe ser válido y tener máximo dos decimales.`;
    }
  }

  return null;
};

const apiErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return 'No fue posible registrar la valoración.';

  const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
  const firstError = errors && Object.values(errors).flat()[0];

  return firstError
    || error.response?.data?.message
    || 'No fue posible registrar la valoración. Revisa los datos e intenta de nuevo.';
};

const ValuationForm = ({ ticketId, onSuccess }: ValuationFormProps) => {
  const [observaciones, setObservaciones] = useState('');
  const [rows, setRows] = useState<MaterialRowDraft[]>([createInitialMaterialRow()]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const submissionLockRef = useRef(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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

    setConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    setConfirmationOpen(false);
    window.setTimeout(() => submitButtonRef.current?.focus(), 0);
  };

  const confirmSubmission = async () => {
    if (submissionLockRef.current) return;
    submissionLockRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      await ticketsService.createValoracion({
        ticket_id: ticketId,
        observaciones: observaciones.trim(),
        materiales: rows.map((row) => ({
          descripcion: row.descripcion.trim(),
          cantidad: Number(row.cantidad),
          costo_unitario: Number(row.costo_unitario),
        })),
      });

      setConfirmationOpen(false);
      setObservaciones('');
      setRows([createInitialMaterialRow()]);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
      setConfirmationOpen(false);
      return;
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }

    try {
      await onSuccess();
    } catch (refreshError) {
      console.error(refreshError);
      setError('La valoración se registró, pero no fue posible actualizar el detalle. Recarga la página.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <MaterialRowsEditor rows={rows} onChange={setRows} disabled={isSubmitting} />
        <ValuationSummary rows={rows} />

        <div>
          <label htmlFor="observaciones-valoracion" className="block text-xs font-bold text-slate-700 mb-2">
            Observaciones de la valoración
          </label>
          <textarea
            id="observaciones-valoracion"
            rows={5}
            maxLength={5000}
            required
            value={observaciones}
            onChange={(event) => setObservaciones(event.target.value)}
            placeholder="Describe la revisión técnica realizada..."
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm resize-none disabled:opacity-60"
          />
          <p className="mt-1 text-right text-[0.7rem] text-slate-400">
            {observaciones.length}/5000
          </p>
        </div>

        {error && (
          <p role="alert" className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          ref={submitButtonRef}
          type="submit"
          disabled={isSubmitting}
          className="bg-[#163d2a] hover:bg-[#1e4535] text-white rounded-xl font-bold py-3 transition-all shadow-lg shadow-[#163d2a]/20 text-sm disabled:opacity-60"
        >
          Crear valoración técnica
        </button>
      </form>

      <ConfirmValuationDialog
        open={confirmationOpen}
        isSubmitting={isSubmitting}
        onCancel={closeConfirmation}
        onConfirm={confirmSubmission}
      />
    </>
  );
};

export default ValuationForm;
