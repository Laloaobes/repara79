import React from 'react';
import { Search } from 'lucide-react';
import { AreaTicket } from '../../services/ticketsService';
import { ValoracionPendienteFilters } from '../../types/valuation';

interface ValoracionFiltersProps {
  filters: ValoracionPendienteFilters;
  areas: AreaTicket[];
  disabled?: boolean;
  onChange: (filters: ValoracionPendienteFilters) => void;
}

const ValoracionFilters = ({
  filters,
  areas,
  disabled = false,
  onChange,
}: ValoracionFiltersProps) => (
  <div className="grid grid-cols-1 md:grid-cols-[1fr_14rem_13rem] gap-3">
    <label className="relative">
      <span className="sr-only">Buscar valoración por folio o título</span>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        maxLength={150}
        type="search"
        value={filters.search || ''}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        disabled={disabled}
        placeholder="Buscar por TK-001 o título..."
        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#52b788] text-sm disabled:opacity-60"
      />
    </label>

    <label>
      <span className="sr-only">Filtrar por área</span>
      <select
        value={filters.area_id || ''}
        onChange={(event) => onChange({
          ...filters,
          area_id: event.target.value ? Number(event.target.value) : undefined,
        })}
        disabled={disabled}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#52b788] text-sm disabled:opacity-60"
      >
        <option value="">Todas las áreas</option>
        {areas.map((area) => (
          <option key={area.id} value={area.id}>{area.nombre}</option>
        ))}
      </select>
    </label>

    <label>
      <span className="sr-only">Ordenar valoraciones</span>
      <select
        value={filters.sort || 'fecha_desc'}
        onChange={(event) => onChange({
          ...filters,
          sort: event.target.value as ValoracionPendienteFilters['sort'],
        })}
        disabled={disabled}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#52b788] text-sm disabled:opacity-60"
      >
        <option value="fecha_desc">Más recientes</option>
        <option value="fecha_asc">Más antiguas</option>
        <option value="costo_desc">Mayor costo</option>
        <option value="costo_asc">Menor costo</option>
      </select>
    </label>
  </div>
);

export default ValoracionFilters;
