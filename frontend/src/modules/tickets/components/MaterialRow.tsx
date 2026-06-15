import React from 'react';
import { Trash2 } from 'lucide-react';

export interface Material {
  name: string;
  code: string;
  qty: number;
  cost: number;
}

interface MaterialRowProps {
  key?: React.Key;
  material: Material;
  index: number;
  onRemove?: (index: number) => void;
  isReadOnly?: boolean;
}

export default function MaterialRow({ material, index, onRemove, isReadOnly = false }: MaterialRowProps) {
  const totalCost = material.qty * material.cost;

  return (
    <tr className="hover:bg-slate-50/40 transition-colors group">
      <td className="p-4 font-semibold text-slate-800">
        {material.name}
      </td>
      <td className="p-4">
        <code className="text-[11px] bg-slate-100/80 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200/50">
          {material.code}
        </code>
      </td>
      <td className="p-4 text-center font-semibold text-slate-700">
        {material.qty} {material.qty === 1 ? 'pza' : 'pzas'}
      </td>
      <td className="p-4 text-right font-medium text-slate-600">
        ${material.cost.toFixed(2)}
      </td>
      <td className="p-4 text-right font-bold text-slate-900">
        ${totalCost.toFixed(2)}
      </td>
      {!isReadOnly && onRemove && (
        <td className="p-4 text-right">
          <button 
            type="button" 
            onClick={() => onRemove(index)}
            className="p-1 px-2.5 rounded-lg text-xs bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold cursor-pointer transition-all duration-150 flex items-center gap-1 ml-auto group-hover:scale-105"
            aria-label={`Eliminar ${material.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>
        </td>
      )}
    </tr>
  );
}
