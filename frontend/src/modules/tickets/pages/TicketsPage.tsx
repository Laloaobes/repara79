import React, { useState } from 'react';
import { Search, Hammer, MapPin, Calendar, UserCircle, Plus } from 'lucide-react';
import NewTicketModal from '../components/NewTicketModal';

interface Ticket {
  id: string;
  titulo: string;
  desc: string;
  ubicacion: string;
  fecha: string;
  estado: 'Urgente' | 'En proceso' | 'Pendiente' | 'Resuelto';
  tecnico: string;
  bgImg: string | null;
}

// Componente Helper para las etiquetas de Estado
const Badge = ({ estado }: { estado: 'Urgente' | 'En proceso' | 'Pendiente' | 'Resuelto' }) => {
  const styles = {
    'Urgente': 'bg-red-50 text-red-600 border-red-200',
    'En proceso': 'bg-blue-50 text-blue-600 border-blue-200',
    'Pendiente': 'bg-amber-50 text-amber-600 border-amber-200',
    'Resuelto': 'bg-green-50 text-green-600 border-green-200',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border flex items-center gap-1 ${styles[estado]}`}>
      {estado === 'Urgente' && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
      {estado}
    </span>
  );
};

const TicketsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  
  // Datos temporales de prueba para la UI
  const allTickets: Ticket[] = [
    {
      id: 'TK-001',
      titulo: 'Fuga de agua en baño principal',
      desc: 'Tubería rota bajo el lavabo, agua acumulada en el piso. Requiere atención inmediata antes de que dañe las instalaciones eléctricas.',
      ubicacion: 'Edificio A — Baño 1er piso',
      fecha: '12 Jun 2026',
      estado: 'Urgente',
      tecnico: 'Ing. Ramírez',
      bgImg: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop',
    },
    {
      id: 'TK-002',
      titulo: 'Silla rota en laboratorio de cómputo',
      desc: 'Una de las sillas del laboratorio tiene la base fracturada. Riesgo de accidente para los alumnos.',
      ubicacion: 'Laboratorio de Cómputo — Aula 12',
      fecha: '10 Jun 2026',
      estado: 'En proceso',
      tecnico: 'Mtro. López',
      bgImg: null,
    },
    {
      id: 'TK-003',
      titulo: 'Luminaria fundida en pasillo',
      desc: 'El foco del extremo norte del pasillo dejó de funcionar, generando zona oscura que puede ser peligrosa.',
      ubicacion: 'Edificio B — Pasillo 2do piso',
      fecha: '08 Jun 2026',
      estado: 'Pendiente',
      tecnico: 'Sin asignar',
      bgImg: null,
    },
    {
      id: 'TK-004',
      titulo: 'Proyector sin señal de imagen',
      desc: 'El proyector no mostraba imagen. Se reemplazó el cable HDMI y el adaptador. Problema resuelto satisfactoriamente.',
      ubicacion: 'Aula 7 — Edificio Principal',
      fecha: '05 Jun 2026',
      estado: 'Resuelto',
      tecnico: 'Téc. García',
      bgImg: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=200&h=200&fit=crop',
    },
    {
      id: 'TK-005',
      titulo: 'Cerradura dañada en dirección',
      desc: 'La cerradura de la puerta principal de dirección está dañada, no cierra correctamente. Riesgo de seguridad.',
      ubicacion: 'Dirección — Planta baja',
      fecha: '03 Jun 2026',
      estado: 'Pendiente',
      tecnico: 'Sin asignar',
      bgImg: null,
    },
  ];
  
  // Lógica de filtrado
  const filteredTickets = allTickets.filter(ticket => {
    if (activeFilter === 'Todos') return true;
    return ticket.estado === activeFilter;
  });
  
  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      {/* Montamos el Modal aquí para uso exclusivo de esta página si se requiere */}
      <NewTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    
      {/* Header de la página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Gestión de Tickets</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{filteredTickets.length} de {allTickets.length} reportes</p>
        </div>
        
        {/* Botón Nuevo Reporte (Solo visible en Desktop, en móvil se usa el Bottom Nav) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1e4535] text-white rounded-xl font-bold transition-all text-sm shadow-md"
        >
          <Plus size={16} strokeWidth={3} /> Nuevo Reporte
        </button>
      </div>
    
      {/* Barra de Búsqueda */}
      <div className="relative w-full shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por título, ubicación o ID..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium"
        />
      </div>
    
      {/* Filtros (Pills) */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['Todos', 'Urgente', 'Pendiente', 'En proceso', 'Resuelto'].map((filter) => (
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
              {filter === 'Todos' ? allTickets.length : allTickets.filter(t => t.estado === filter).length}
            </span>
          </button>
        ))}
      </div>
    
      {/* Lista de Tickets */}
      <div className="flex flex-col gap-3 mt-2">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-[1.5rem] p-2 pr-4 md:pr-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center hover:shadow-md transition-shadow cursor-pointer">
            
            {/* Imagen o Icono Placeholder */}
            <div className={`w-full md:w-40 h-36 rounded-[1.2rem] shrink-0 overflow-hidden relative flex items-center justify-center bg-slate-50 border border-slate-100 ${ticket.estado === 'Urgente' ? 'border-red-100 bg-red-50/30' : ''}`}>
              {ticket.bgImg ? (
                <img src={ticket.bgImg} alt="Evidencia" className="w-full h-full object-cover" />
              ) : (
                <Hammer size={32} className={ticket.estado === 'En proceso' ? 'text-blue-200' : 'text-slate-200'} />
              )}
            </div>
    
            {/* Contenido de la Tarjeta */}
            <div className="flex-1 px-3 pb-3 md:p-2 min-w-0 w-full">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge estado={ticket.estado} />
                </div>
                <span className="text-[0.65rem] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">{ticket.id}</span>
              </div>
              
              <h3 className="text-[1.05rem] font-bold text-slate-800 mb-1.5 truncate pr-8">{ticket.titulo}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 max-w-3xl">{ticket.desc}</p>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[0.7rem] font-medium text-slate-500 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> {ticket.ubicacion}</div>
                <div className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {ticket.fecha}</div>
                <div className="flex items-center gap-1.5 md:ml-auto font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <UserCircle size={14} className={ticket.tecnico === 'Sin asignar' ? 'text-slate-400' : 'text-[#52b788]'}/> 
                  {ticket.tecnico}
                </div>
              </div>
            </div>
          </div>
        ))}
    
        {/* Estado Vacío (Por si se filtra y no hay resultados) */}
        {filteredTickets.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-slate-800 font-bold mb-1">No hay reportes</h3>
            <p className="text-slate-500 text-sm">No se encontraron tickets con la categoría seleccionada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;