import React, { useEffect, useState } from 'react';
import { Calendar, ClipboardList, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ticketsService, { AreaTicket, Ticket } from '../services/ticketsService';

const PendingValuationTicketsPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [areas, setAreas] = useState<AreaTicket[]>([]);
  const [search, setSearch] = useState('');
  const [areaId, setAreaId] = useState('');
  const [sort, setSort] = useState<'fecha_desc' | 'fecha_asc'>('fecha_desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ticketsService.getCatalogs()
      .then((catalogs) => setAreas(catalogs.areas))
      .catch(() => setError('No fue posible cargar el catálogo de áreas.'));
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await ticketsService.getPendingValuationTickets({
          search: search.trim() || undefined,
          area_id: areaId ? Number(areaId) : undefined,
          sort,
        });
        setTickets(data);
      } catch (requestError) {
        console.error(requestError);
        setTickets([]);
        setError('No fue posible consultar los tickets pendientes.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [areaId, search, sort]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
          <ClipboardList size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tickets pendientes de valoración</h1>
          <p className="text-sm text-slate-500">Localiza un ticket elegible y revisa su detalle.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_14rem_12rem] gap-3">
        <label className="relative">
          <span className="sr-only">Buscar por folio o título</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por TK-001 o título..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#52b788] text-sm"
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por área</span>
          <select
            value={areaId}
            onChange={(event) => setAreaId(event.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#52b788] text-sm"
          >
            <option value="">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.nombre}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Ordenar tickets</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as 'fecha_desc' | 'fecha_asc')}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#52b788] text-sm"
          >
            <option value="fecha_desc">Más recientes</option>
            <option value="fecha_asc">Más antiguos</option>
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-sm font-bold text-slate-500">Consultando tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center">
          <h2 className="font-bold text-slate-800">No hay tickets pendientes</h2>
          <p className="mt-1 text-sm text-slate-500">Prueba otros criterios de búsqueda o vuelve más tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-mono font-bold text-slate-400">
                    TK-{String(ticket.id).padStart(3, '0')}
                  </p>
                  <h2 className="mt-1 font-bold text-slate-800 truncate">{ticket.titulo}</h2>
                </div>
                <span className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[0.65rem] font-black uppercase text-amber-700">
                  Pendiente
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">{ticket.descripcion_desperfecto}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} /> {ticket.area?.nombre || 'Sin área'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={13} />
                  {new Date(ticket.created_at).toLocaleDateString('es-MX')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingValuationTicketsPage;
