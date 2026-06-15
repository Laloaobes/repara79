import React, { useState } from 'react';
import { 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';

export interface Ticket {
  folio: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  ubicacion: string;
  emisor: string;
  estatus: string;
  urgencia?: 'baja' | 'media' | 'alta' | 'critica';
}

interface TicketCardProps {
  key?: React.Key;
  ticket: Ticket;
  isAdminView?: boolean;
  onApprove?: (rejReason?: string) => void;
  onReject?: (rejReason: string) => void;
}

export default function TicketCard({ 
  ticket, 
  isAdminView = false,
  onApprove,
  onReject
}: TicketCardProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determinar color de etiqueta de urgencia
  const getUrgenciaBadge = () => {
    switch (ticket.urgencia) {
      case 'critica':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'alta':
        return 'bg-orange-100 text-orange-850 border-orange-200';
      case 'media':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleAction = (action: 'approve' | 'reject') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (action === 'approve' && onApprove) {
        onApprove();
      } else if (action === 'reject' && onReject) {
        onReject(rejectionReason);
      }
    }, 800);
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      
      {/* Encabezado de Tarjeta */}
      <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
        <header className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded border tracking-wider ${getUrgenciaBadge()}`}>
              {ticket.urgencia || 'Normal'}
            </span>
            <span className="text-slate-400 font-bold text-xs tracking-wider">TICKET {ticket.folio}</span>
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-900 mt-1">
            {ticket.tipo}
          </h3>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0 text-slate-450" /> {ticket.ubicacion}</span>
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 shrink-0 text-slate-450" /> Emisor: {ticket.emisor}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0 text-slate-450" /> {ticket.fecha}</span>
          </p>
        </header>

        <div className="flex items-center gap-2 shrink-0 sm:self-start">
          <StatusBadge status={ticket.estatus} />
        </div>
      </div>

      {/* Detalle y Reporte */}
      <div className="p-5 md:p-6 space-y-5">
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100/60 shadow-inner">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <FileText className="w-3 h-3 text-slate-400" />
            Descripción de Anomalía
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            "{ticket.descripcion}"
          </p>
        </div>

        {/* Carga de Decisiones si es Vista de Administrador y está pendiente de Aprobar */}
        {isAdminView && ticket.estatus !== 'completado' && (
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="space-y-2">
              <label htmlFor={`reasons-${ticket.folio}`} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Especifique el motivo en caso de RECHAZAR la solicitud <span className="text-slate-400 font-normal">(Requerido únicamente para no admitidos)</span>
              </label>
              <textarea
                id={`reasons-${ticket.folio}`}
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej. Se coordina directamente con garantía de la estufa / No procede por mantenimiento externo ya contratado..."
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder-slate-400 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button 
                type="button" 
                onClick={() => handleAction('approve')}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Dictaminando...
                  </>
                ) : `Autorizar Orden ${ticket.folio}`}
              </button>
              
              <button 
                type="button" 
                onClick={() => handleAction('reject')}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                Rechazar Solicitud
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
