import React, { useEffect, useMemo, useState } from 'react';
import { Search, Hammer, MapPin, Calendar, UserCircle, Plus } from 'lucide-react';
import NewTicketModal from '../components/NewTicketModal';
import ticketsService, { Ticket as ApiTicket } from '../services/ticketsService';

interface Ticket {
  id: string;
  rawId: number;
  titulo: string;
  desc: string;
  ubicacion: string;
  fecha: string;
  estado: string;
  prioridad: string;
  area: string;
  tecnico: string;
  bgImg: string | null;
}

const Badge = ({ estado }: { estado: string }) => {
  const styles = {
    'Pendiente': 'bg-amber-50 text-amber-600 border-amber-200',
    'Valorado': 'bg-blue-50 text-blue-600 border-blue-200',
    'Autorizado': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'En reparacion': 'bg-blue-50 text-blue-600 border-blue-200',
    'En reparación': 'bg-blue-50 text-blue-600 border-blue-200',
    'Rechazado': 'bg-red-50 text-red-600 border-red-200',
    'Reparado': 'bg-green-50 text-green-600 border-green-200',
  };
  const className = styles[estado as keyof typeof styles] || 'bg-slate-50 text-slate-600 border-slate-200';
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border flex items-center gap-1 ${className}`}>
      {estado === 'Pendiente' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
      {estado}
    </span>
  );
};

const formatTicket = (ticket: ApiTicket): Ticket => ({
  id: `TK-${String(ticket.id).padStart(3, '0')}`,
  rawId: ticket.id,
  titulo: ticket.titulo,
  desc: ticket.descripcion_desperfecto,
  ubicacion: ticket.ubicacion,
  fecha: new Date(ticket.created_at).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
  estado: ticket.estado?.nombre || 'Pendiente',
  prioridad: ticket.prioridad?.nombre || 'Sin prioridad',
  area: ticket.area?.nombre || 'Sin area',
  tecnico: 'Sin asignar',
  bgImg: null,
});

const TicketsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const data = await ticketsService.getMyTickets();
      setTickets(data.map(formatTicket));
    } catch (error) {
      console.error(error);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();

    window.addEventListener('tickets:created', loadTickets);

    return () => {
      window.removeEventListener('tickets:created', loadTickets);
    };
  }, []);
  
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesFilter = activeFilter === 'Todos' || ticket.estado === activeFilter;
      const normalizedSearch = searchTerm.trim().toLowerCase();

      if (!normalizedSearch) return matchesFilter;

      return matchesFilter && [
        ticket.id,
        ticket.titulo,
        ticket.desc,
        ticket.ubicacion,
        ticket.area,
        ticket.prioridad,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [activeFilter, searchTerm, tickets]);

  const filters = ['Todos', 'Pendiente', 'Valorado', 'Autorizado', 'En reparacion', 'Rechazado', 'Reparado'];
  
  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <NewTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={loadTickets} />
    
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Gestión de Tickets</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{filteredTickets.length} de {tickets.length} reportes</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1e4535] text-white rounded-xl font-bold transition-all text-sm shadow-md"
        >
          <Plus size={16} strokeWidth={3} /> Nuevo Reporte
        </button>
      </div>
    
      <div className="relative w-full shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por título, ubicación o ID..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium"
        />
      </div>
    
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[0.8rem] font-bold transition-all border shrink-0 flex items-center gap-1.5
              ${activeFilter === filter 
                ? 'bg-[#163d2a] text-white border-[#163d2a] shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {filter}
            <span className={`text-[0.65rem] px-1.5 py-0.5 rounded-md ${activeFilter === filter ? 'bg-white/20' : 'bg-slate-100'}`}>
              {filter === 'Todos' ? tickets.length : tickets.filter((ticket) => ticket.estado === filter).length}
            </span>
          </button>
        ))}
      </div>
    
      <div className="flex flex-col gap-3 mt-2">
        {isLoading && (
          <div className="py-20 text-center text-sm font-bold text-slate-500">Cargando tickets...</div>
        )}

        {!isLoading && filteredTickets.map((ticket) => (
          <div key={ticket.rawId} className="bg-white rounded-[1.5rem] p-2 pr-4 md:pr-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-full md:w-40 h-36 rounded-[1.2rem] shrink-0 overflow-hidden relative flex items-center justify-center bg-slate-50 border border-slate-100">
              {ticket.bgImg ? (
                <img src={ticket.bgImg} alt="Evidencia" className="w-full h-full object-cover" />
              ) : (
                <Hammer size={32} className={ticket.estado === 'En reparacion' ? 'text-blue-200' : 'text-slate-200'} />
              )}
            </div>
    
            <div className="flex-1 px-3 pb-3 md:p-2 min-w-0 w-full">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge estado={ticket.estado} />
                  <span className="px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border bg-slate-50 text-slate-600 border-slate-200">
                    {ticket.prioridad}
                  </span>
                </div>
                <span className="text-[0.65rem] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">{ticket.id}</span>
              </div>
              
              <h3 className="text-[1.05rem] font-bold text-slate-800 mb-1.5 truncate pr-8">{ticket.titulo}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 max-w-3xl">{ticket.desc}</p>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[0.7rem] font-medium text-slate-500 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> {ticket.area} - {ticket.ubicacion}</div>
                <div className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {ticket.fecha}</div>
                <div className="flex items-center gap-1.5 md:ml-auto font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <UserCircle size={14} className="text-slate-400"/> 
                  {ticket.tecnico}
                </div>
              </div>
            </div>
          </div>
        ))}
    
        {!isLoading && filteredTickets.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-slate-800 font-bold mb-1">No hay reportes</h3>
            <p className="text-slate-500 text-sm">No se encontraron tickets con los criterios seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
