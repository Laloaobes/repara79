import React from 'react';
import { formatCurrency } from '../../../../utils/currency';
import { MaterialRowDraft } from '../../types/valuation';

interface ValuationSummaryProps {
  rows: MaterialRowDraft[];
}

const getSubtotal = (row: MaterialRowDraft) => (
  (Number(row.cantidad) || 0) * (Number(row.costo_unitario) || 0)
);

const ValuationSummary = ({ rows }: ValuationSummaryProps) => {
  const total = rows.reduce((sum, row) => sum + getSubtotal(row), 0);

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-emerald-100">
        <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-900">Resumen estimado</h3>
      </div>
      <div className="divide-y divide-emerald-100">
        {rows.map((row, index) => (
          <div key={row.localId} className="flex items-center justify-between gap-3 px-4 py-2 text-xs">
            <span className="text-slate-600 truncate">
              {row.descripcion.trim() || `Material ${index + 1}`} · {Number(row.cantidad) || 0}
            </span>
            <span className="font-bold text-slate-800">{formatCurrency(getSubtotal(row))}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-white/60">
        <span className="text-sm font-bold text-slate-800">Total informativo</span>
        <span className="text-base font-black text-emerald-900">{formatCurrency(total)}</span>
      </div>
      <p className="px-4 pb-3 text-[0.7rem] text-slate-500">
        El Backend calculará y confirmará el importe oficial.
      </p>
    </div>
  );
};

export default ValuationSummary;
