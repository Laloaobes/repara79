import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, UserCircle, ImageIcon } from 'lucide-react';
import RoleGuard from '../../auth/components/RoleGuard';
import ticketsService, { Ticket } from '../services/ticketsService';
import { ROLES } from '../../../constants/roles';
import { formatCurrency } from '../../../utils/currency';
import ValuationForm from '../components/valuation/ValuationForm';

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadTicket = async () => {
    if (!id) return;

    try {
      const data = await ticketsService.getTicketById(Number(id));
      setTicket(data);
      setNotFound(false);
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm font-bold text-slate-500">Cargando ticket...</div>
    );
  }

  if (notFound || !ticket) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <h3 className="text-slate-800 font-bold">No se encontró el ticket</h3>
        <Link to="/tickets" className="text-sm font-bold text-[#2d6a4f] hover:underline">
          Volver a tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <Link
        to="/tickets"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition w-fit"
      >
        <ArrowLeft size={16} /> Volver a tickets
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Columna: información del ticket */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
              TK-{String(ticket.id).padStart(3, '0')}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border bg-slate-50 text-slate-600 border-slate-200">
              {ticket.estado?.nombre || 'Pendiente'}
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">{ticket.titulo}</h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{ticket.descripcion_desperfecto}</p>
          </div>

          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
            {ticket.fotografia_inicial_url ? (
              <img
                src={ticket.fotografia_inicial_url}
                alt={`Evidencia fotografica de ${ticket.titulo}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-widest">
                <ImageIcon size={28} />
                Sin evidencia fotografica
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" />
              {ticket.area?.nombre || 'Sin área'} — {ticket.ubicacion}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              {new Date(ticket.created_at).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1.5">
              <UserCircle size={14} className="text-slate-400" />
              Reportado por {ticket.usuario?.name || 'Usuario'}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border bg-slate-50 text-slate-600 border-slate-200">
              {ticket.prioridad?.nombre || 'Sin prioridad'}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border bg-slate-50 text-slate-600 border-slate-200">
              {ticket.tipo_desperfecto?.nombre || 'Sin tipo'}
            </span>
          </div>
        </section>

        {/* Columna: valoración técnica */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-900 mb-4">
            Valoración técnica
          </h2>

          {ticket.valoracion ? (
            <div className="flex flex-col gap-3">
              <span className="w-fit px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border bg-blue-50 text-blue-600 border-blue-200">
                {ticket.valoracion.estado}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.valoracion.observaciones}</p>

              {ticket.valoracion.materiales && ticket.valoracion.materiales.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  {ticket.valoracion.materiales.map((material) => (
                    <div
                      key={material.id}
                      className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-4 py-2 text-sm border-b border-slate-100 last:border-b-0"
                    >
                      <span className="text-slate-700">{material.descripcion}</span>
                      <span className="font-bold text-slate-800">{formatCurrency(material.subtotal)}</span>
                      <span className="text-[0.7rem] text-slate-500">
                        {material.cantidad} × {formatCurrency(material.costo_unitario)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 text-sm">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="font-black text-slate-900">{formatCurrency(ticket.valoracion.costo_estimado)}</span>
                  </div>
                </div>
              )}

              {ticket.valoracion.estado === 'Rechazada' && ticket.valoracion.motivo_rechazo && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  Motivo de rechazo: {ticket.valoracion.motivo_rechazo}
                </p>
              )}
              <p className="text-xs font-bold text-slate-600">
                Técnico: {ticket.valoracion.tecnico?.name || 'Sin asignar'}
              </p>
            </div>
          ) : ticket.estado?.nombre !== 'Pendiente' ? (
            <p className="text-sm text-slate-500">
              Este ticket no está disponible para valoración porque su estado actual es{' '}
              <strong>{ticket.estado?.nombre || 'desconocido'}</strong>.
            </p>
          ) : (
            <RoleGuard
              allowedRoles={[ROLES.PERSONAL_MANTENIMIENTO]}
              fallback={
                <p className="text-sm text-slate-500">
                  Este ticket aún no tiene una valoración técnica registrada.
                </p>
              }
            >
              <ValuationForm ticketId={ticket.id} onSuccess={loadTicket} />
            </RoleGuard>
          )}
        </section>
      </div>
    </div>
  );
};

export default TicketDetailPage;
