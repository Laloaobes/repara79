import React from 'react';
import { MapPin, UserCircle } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';
import { ValoracionPendiente } from '../../services/valoracionesService';

interface ValoracionPendienteCardProps {
  valoracion: ValoracionPendiente;
  onSelect: (valoracion: ValoracionPendiente) => void;
}

const ValoracionPendienteCard = ({ valoracion, onSelect }: ValoracionPendienteCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(valoracion)}
    className="text-left bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-3 md:gap-6"
  >
    <div className="flex-1 min-w-0">
      <p className="text-[0.65rem] font-mono font-bold text-slate-400">
        {valoracion.ticket.folio || `TK-${String(valoracion.ticket.id).padStart(3, '0')}`}
      </p>
      <h2 className="font-bold text-slate-800 truncate">{valoracion.ticket.titulo}</h2>
      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {valoracion.ticket.area?.nombre || 'Sin área'}
        </span>
        <span className="flex items-center gap-1">
          <UserCircle size={12} /> {valoracion.tecnico?.name || 'Sin autor'}
        </span>
      </div>
    </div>
    <div className="text-left md:text-right shrink-0">
      <p className="text-lg font-black text-slate-800">{formatCurrency(valoracion.costo_estimado)}</p>
      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-amber-600">
        Pendiente de autorización
      </p>
    </div>
  </button>
);

export default ValoracionPendienteCard;
