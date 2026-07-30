import React, { useEffect, useRef } from 'react';

interface ConfirmValuationDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmValuationDialog = ({
  open,
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmValuationDialogProps) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      confirmButtonRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !isSubmitting) onCancel();
        if (event.key === 'Tab') {
          const focusable = Array.from(
            dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || []
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
        aria-labelledby="confirmar-valoracion-titulo"
        aria-describedby="confirmar-valoracion-descripcion"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 id="confirmar-valoracion-titulo" className="text-lg font-bold text-slate-900">
          Confirmar valoración técnica
        </h2>
        <p id="confirmar-valoracion-descripcion" className="mt-3 text-sm leading-relaxed text-slate-600">
          Al confirmar, la valoración quedará enviada y no podrá modificarse hasta que el
          Subdirector Administrativo la rechace con un motivo.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-[#163d2a] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmValuationDialog;
