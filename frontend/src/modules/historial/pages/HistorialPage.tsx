import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, MapPin, Calendar, AlertTriangle, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import historialService, { HistorialTicket, HistorialFilters } from '../services/historialService';

const HistorialPage = () => {
  const [items, setItems] = useState<HistorialTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [folio, setFolio] = useState('');
  const [debouncedFolio, setDebouncedFolio] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFolio(folio), 400);
    return () => clearTimeout(t);
  }, [folio]);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const filters: HistorialFilters = { page: currentPage };
    if (debouncedFolio) filters.folio = debouncedFolio;
    if (fechaInicio) filters.fecha_inicio = fechaInicio;
    if (fechaFin) filters.fecha_fin = fechaFin;
    try {
      const result = await historialService.getAll(filters);
      setItems(result.data);
      setTotal(result.total);
      setLastPage(result.last_page);
    } catch {
      setError('No se pudo cargar el historial.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedFolio, fechaInicio, fechaFin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFolio, fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatMoney = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Historial de Reparaciones</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          {isLoading ? 'Cargando...' : `${total} ticket${total !== 1 ? 's' : ''} completado${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text" value={folio} onChange={e => setFolio(e.target.value)}
            placeholder="Buscar por folio (TK-001)..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
              className="pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium shadow-sm"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
              className="pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium shadow-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <FileText size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-700 font-bold">Sin resultados</p>
          <p className="text-slate-500 text-sm mt-1">No hay reparaciones completadas con los filtros actuales.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(ticket => {
            const isExpanded = expandedId === ticket.id;
            return (
              <div key={ticket.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Row principal */}
                <button
                  className="w-full text-left p-5 flex flex-col sm:flex-row gap-4 sm:items-center hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                >
                  <div className="w-12 h-12 rounded-2xl shrink-0 bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                    <FileText size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.65rem] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{ticket.folio}</span>
                      <span className="px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border bg-green-50 text-green-800 border-green-200">Reparado</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 truncate">{ticket.categoria} — {ticket.ubicacion_exacta}</h3>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-[0.7rem] font-medium text-slate-400">
                      {ticket.zona && <span className="flex items-center gap-1"><MapPin size={11} /> {ticket.zona.nombre}</span>}
                      <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(ticket.updated_at)}</span>
                      {ticket.tecnico && <span className="text-slate-600 font-bold">{ticket.tecnico.name}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {ticket.valoracion && (
                      <div className="text-right">
                        <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">Costo total</p>
                        <p className="text-base font-black text-slate-800">{formatMoney(ticket.valoracion.costo_total)}</p>
                      </div>
                    )}
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </button>

                {/* Detalle expandible */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 flex flex-col gap-5">
                    {/* Descripción */}
                    <div>
                      <p className="text-[0.7rem] font-black uppercase tracking-wider text-slate-400 mb-1.5">Descripción</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{ticket.descripcion}</p>
                    </div>

                    {/* Valoración y materiales */}
                    {ticket.valoracion && (
                      <div>
                        <p className="text-[0.7rem] font-black uppercase tracking-wider text-slate-400 mb-2">Valoración técnica</p>
                        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3">
                          <div className="flex gap-6">
                            <div>
                              <p className="text-[0.65rem] font-bold text-slate-400 uppercase">Tiempo estimado</p>
                              <p className="text-sm font-bold text-slate-700">{ticket.valoracion.tiempo_estimado} h</p>
                            </div>
                            <div>
                              <p className="text-[0.65rem] font-bold text-slate-400 uppercase">Costo total</p>
                              <p className="text-sm font-bold text-slate-700">{formatMoney(ticket.valoracion.costo_total)}</p>
                            </div>
                          </div>
                          {ticket.valoracion.observaciones && (
                            <p className="text-xs text-slate-500 leading-relaxed">{ticket.valoracion.observaciones}</p>
                          )}
                          {ticket.valoracion.materiales?.length > 0 && (
                            <div className="mt-1">
                              <p className="text-[0.65rem] font-black uppercase tracking-wider text-slate-400 mb-2">Materiales</p>
                              <div className="flex flex-col gap-1.5">
                                {ticket.valoracion.materiales.map((m, i) => (
                                  <div key={i} className="flex justify-between items-center text-xs font-medium text-slate-600 bg-white rounded-xl px-3 py-2 border border-slate-100">
                                    <span>{m.nombre} <span className="text-slate-400">×{m.cantidad}</span></span>
                                    <span className="flex items-center gap-1 font-bold text-slate-700">
                                      <DollarSign size={11} />{m.subtotal.toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {ticket.historial?.length > 0 && (
                      <div>
                        <p className="text-[0.7rem] font-black uppercase tracking-wider text-slate-400 mb-2">Historial de estados</p>
                        <div className="flex flex-col gap-2">
                          {ticket.historial.map(h => (
                            <div key={h.id} className="flex gap-3 items-start text-xs">
                              <div className="w-2 h-2 rounded-full bg-[#52b788] mt-1.5 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-700">{h.estado_anterior ?? 'Inicio'} → {h.estado_nuevo}</span>
                                {h.comentario && <span className="text-slate-400 ml-2">— {h.comentario}</span>}
                                <p className="text-slate-400 mt-0.5">{formatDate(h.created_at)}{h.usuario ? ` · ${h.usuario.name}` : ''}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm font-bold text-slate-500">{currentPage} / {lastPage}</span>
          <button
            disabled={currentPage === lastPage}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialPage;
