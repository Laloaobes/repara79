import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { MaterialRowDraft } from '../../types/valuation';

interface MaterialRowsEditorProps {
  rows: MaterialRowDraft[];
  disabled?: boolean;
  onChange: (rows: MaterialRowDraft[]) => void;
}

const createRow = (): MaterialRowDraft => ({
  localId: `${Date.now()}-${Math.random()}`,
  descripcion: '',
  cantidad: '1',
  costo_unitario: '',
});

const MaterialRowsEditor = ({ rows, disabled = false, onChange }: MaterialRowsEditorProps) => {
  const updateRow = (localId: string, field: keyof Omit<MaterialRowDraft, 'localId'>, value: string) => {
    onChange(rows.map((row) => (
      row.localId === localId ? { ...row, [field]: value } : row
    )));
  };

  const removeRow = (localId: string) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((row) => row.localId !== localId));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-700">Materiales estimados</h3>
          <p className="text-[0.7rem] text-slate-500">Agrega entre 1 y 50 materiales.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...rows, createRow()])}
          disabled={disabled || rows.length >= 50}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:underline disabled:opacity-50 disabled:no-underline"
        >
          <Plus size={14} /> Agregar
        </button>
      </div>

      {rows.map((row, index) => (
        <fieldset
          key={row.localId}
          disabled={disabled}
          className="grid grid-cols-1 sm:grid-cols-[1fr_7rem_9rem_auto] gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <legend className="sr-only">Material {index + 1}</legend>
          <div>
            <label htmlFor={`material-${row.localId}`} className="block text-[0.7rem] font-bold text-slate-600 mb-1">
              Descripción
            </label>
            <input
              id={`material-${row.localId}`}
              type="text"
              maxLength={150}
              minLength={2}
              required
              value={row.descripcion}
              onChange={(event) => updateRow(row.localId, 'descripcion', event.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#52b788] text-sm"
            />
          </div>
          <div>
            <label htmlFor={`cantidad-${row.localId}`} className="block text-[0.7rem] font-bold text-slate-600 mb-1">
              Cantidad
            </label>
            <input
              id={`cantidad-${row.localId}`}
              type="number"
              min={1}
              max={1000000}
              step={1}
              inputMode="numeric"
              value={row.cantidad}
              required
              onChange={(event) => updateRow(row.localId, 'cantidad', event.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#52b788] text-sm"
            />
          </div>
          <div>
            <label htmlFor={`costo-${row.localId}`} className="block text-[0.7rem] font-bold text-slate-600 mb-1">
              Costo unitario
            </label>
            <input
              id={`costo-${row.localId}`}
              type="number"
              min={0}
              max={99999999.99}
              step="0.01"
              inputMode="decimal"
              value={row.costo_unitario}
              required
              onChange={(event) => updateRow(row.localId, 'costo_unitario', event.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#52b788] text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => removeRow(row.localId)}
            disabled={disabled || rows.length <= 1}
            className="self-end p-2.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
            aria-label={`Quitar material ${index + 1}`}
          >
            <Trash2 size={16} />
          </button>
        </fieldset>
      ))}
    </div>
  );
};

export const createInitialMaterialRow = createRow;
export default MaterialRowsEditor;
