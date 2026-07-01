import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hammer, 
  Plus, 
  ClipboardList, 
  AlertTriangle, 
  Wrench, 
  CheckCircle2,
  MapPin,
  Calendar,
  UserCircle
} from 'lucide-react';
import NewTicketModal from '../../tickets/components/NewTicketModal';
import ticketsService, { Ticket as ApiTicket } from '../../tickets/services/ticketsService';

interface Ticket {
  id: string;
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

const DashboardPage = () => {
  const navigate = useNavigate();
  // Ahora los datos inician vacíos esperando a la Base de Datos
  const [stats, setStats] = useState({ total: 0, urgentes: 0, enProceso: 0, resueltos: 0, pendientes: 0 });
  const [recientes, setRecientes] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const formatTicket = (ticket: ApiTicket): Ticket => ({
    id: `TK-${String(ticket.id).padStart(3, '0')}`,
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

  const loadTickets = async () => {
    try {
      const tickets = await ticketsService.getMyTickets();
      const formattedTickets = tickets.map(formatTicket);

      setRecientes(formattedTickets);
      setStats({
        total: formattedTickets.length,
        urgentes: formattedTickets.filter((ticket) => ['Alta', 'Critica', 'Crítica'].includes(ticket.prioridad)).length,
        enProceso: formattedTickets.filter((ticket) => ticket.estado === 'En reparacion' || ticket.estado === 'En reparación').length,
        resueltos: formattedTickets.filter((ticket) => ticket.estado === 'Reparado').length,
        pendientes: formattedTickets.filter((ticket) => ticket.estado === 'Pendiente').length,
      });
    } catch (error) {
      console.error("No fue posible cargar los tickets del usuario", error);
      setStats({ total: 0, urgentes: 0, enProceso: 0, resueltos: 0, pendientes: 0 });
      setRecientes([]);
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

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sincronizando datos...</p>
      </div>
    );
  }

  return (
    <>
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onCreated={loadTickets}
      />
      <div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
      
      {/* 1. BANNER DE BIENVENIDA */}
      <div className="bg-gradient-to-r from-[#163d2a] to-[#2d6a4f] rounded-[2rem] p-6 md:p-10 relative overflow-hidden shadow-xl shadow-[#2d6a4f]/20">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
          <Hammer size={240} strokeWidth={1} className="text-white transform -rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[#a7f3d0] text-xs font-bold mb-4 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] animate-pulse" />
            Sistema activo
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Bienvenido, Ángel 👋
          </h1>
          <p className="text-white/80 text-[0.95rem] md:text-base font-medium max-w-md leading-relaxed">
            Tienes <strong className="text-[#fca5a5]">{stats.urgentes} reportes prioritarios</strong> y <strong className="text-[#fde68a]">{stats.pendientes} pendientes</strong> registrados.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#52b788] hover:bg-[#40916c] text-white rounded-xl font-bold shadow-lg shadow-[#52b788]/30 transition-all active:scale-95 text-sm"
            >
              <Plus size={18} strokeWidth={2.5} /> Nuevo Reporte
            </button>
            <button
              onClick={() => navigate('/tickets')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold transition-all text-sm backdrop-blur-sm"
            >
              <ClipboardList size={18} /> Ver todos los tickets
            </button>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#2d6a4f]/10 text-[#2d6a4f] flex items-center justify-center"><ClipboardList size={20} /></div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Total de tickets</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><AlertTriangle size={20} /></div>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{stats.urgentes}</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Urgentes</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4 relative">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Wrench size={20} /></div>
          <span className="absolute top-5 right-5 text-xs font-bold text-[#52b788]">+2</span>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{stats.enProceso}</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">En proceso</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4 relative">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center"><CheckCircle2 size={20} /></div>
          <span className="absolute top-5 right-5 text-xs font-bold text-[#52b788]">+5</span>
          <div>
            <h3 className="text-3xl font-black text-slate-800">{stats.resueltos}</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Resueltos</p>
          </div>
        </div>
      </div>

      {/* 3. BARRA DE DISTRIBUCIÓN */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-bold text-slate-800">Distribución de tickets</h2>
          <span className="text-xs font-medium text-slate-400">{stats.total} total</span>
        </div>
        
        {/* Progress Bar Multi-color */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden gap-0.5">
          <div style={{ width: '15%' }} className="bg-red-500 h-full"></div>
          <div style={{ width: '25%' }} className="bg-amber-500 h-full"></div>
          <div style={{ width: '30%' }} className="bg-blue-500 h-full"></div>
          <div style={{ width: '30%' }} className="bg-green-500 h-full"></div>
        </div>
        
        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-red-500"></span> Urgente (1)</div>
          <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pendiente (2)</div>
          <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-blue-500"></span> En proceso (2)</div>
          <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-green-500"></span> Resuelto (2)</div>
        </div>
      </div>

      {/* 4. REPORTES RECIENTES */}
      <div>
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Reportes recientes</h2>
          <button onClick={() => navigate('/tickets')} className="text-xs font-bold text-[#2d6a4f] hover:underline">Ver todos &rarr;</button>
        </div>
        
        <div className="flex flex-col gap-3">
          {recientes.length === 0 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
              <h3 className="text-slate-800 font-bold mb-1">Aun no tienes reportes</h3>
              <p className="text-slate-500 text-sm">Crea tu primer ticket de mantenimiento para verlo aqui.</p>
            </div>
          )}

          {recientes.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-3xl p-2 pr-4 md:pr-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center hover:shadow-md transition-shadow cursor-pointer">
              
              {/* Imagen o Icono Placeholder */}
              <div className={`w-full md:w-32 h-32 rounded-2xl shrink-0 overflow-hidden relative flex items-center justify-center bg-slate-50 border border-slate-100 ${ticket.estado === 'Urgente' ? 'border-red-100 bg-red-50/30' : ''}`}>
                {ticket.bgImg ? (
                  <img src={ticket.bgImg} alt="Evidencia" className="w-full h-full object-cover" />
                ) : (
                  <Hammer size={32} className={ticket.estado === 'En proceso' ? 'text-blue-200' : 'text-slate-200'} />
                )}
                {/* Badge flotante en imagen (Mobile) */}
                <div className="absolute top-2 left-2 md:hidden">
                  <Badge estado={ticket.estado} />
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 px-3 pb-3 md:p-2 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="hidden md:block mb-2"><Badge estado={ticket.estado} /></div>
                  <span className="text-[0.65rem] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{ticket.id}</span>
                </div>
                
                <h3 className="text-base font-bold text-slate-800 mb-1.5 truncate">{ticket.titulo}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{ticket.desc}</p>
                
                <div className="flex flex-wrap gap-4 text-[0.7rem] font-medium text-slate-400">
                  <div className="flex items-center gap-1.5"><MapPin size={12} /> {ticket.ubicacion}</div>
                  <div className="flex items-center gap-1.5"><Calendar size={12} /> {ticket.fecha}</div>
                  <div className="flex items-center gap-1.5 md:ml-auto font-bold text-slate-600"><UserCircle size={14} /> {ticket.tecnico}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
};

// Componente Helper para las etiquetas de Estado
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
    <span className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border ${className}`}>
      {estado}
    </span>
  );
};

export default DashboardPage;
