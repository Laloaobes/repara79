import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, UserCircle } from 'lucide-react';
import RoleGuard from '../../auth/components/RoleGuard';
import ticketsService, { Ticket } from '../services/ticketsService';

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadTicket = async () => {
    if (!id) return;

    try {
      const data = await ticketsService.getTicketById(Number(id));
      setTicket(data);
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

  const handleCreateValoracion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ticket) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const tiempoEstimado = formData.get('tiempo_estimado_horas');

    try {
      await ticketsService.createValoracion({
        ticket_id: ticket.id,
        diagnostico: String(formData.get('diagnostico') || ''),
        tiempo_estimado_horas: tiempoEstimado ? Number(tiempoEstimado) : undefined,
        observaciones: String(formData.get('observaciones') || '') || undefined,
      });

      await loadTicket();
    } catch (err) {
      console.error(err);
      setError('No fue posible registrar la valoración. Revisa los datos e intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.valoracion.diagnostico}</p>
              {ticket.valoracion.tiempo_estimado_horas != null && (
                <p className="text-xs font-medium text-slate-500">
                  Tiempo estimado: {ticket.valoracion.tiempo_estimado_horas} hora(s)
                </p>
              )}
              {ticket.valoracion.observaciones && (
                <p className="text-xs text-slate-500 italic">{ticket.valoracion.observaciones}</p>
              )}
              <p className="text-xs font-bold text-slate-600">
                Técnico: {ticket.valoracion.tecnico?.name || 'Sin asignar'}
              </p>
            </div>
          ) : (
            <RoleGuard
              allowedRoles={['Personal de Mantenimiento']}
              fallback={
                <p className="text-sm text-slate-500">
                  Este ticket aún no tiene una valoración técnica registrada.
                </p>
              }
            >
              <form onSubmit={handleCreateValoracion} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Diagnóstico</label>
                  <textarea
                    name="diagnostico"
                    rows={4}
                    required
                    placeholder="Describe el diagnóstico técnico..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Tiempo estimado (horas)
                  </label>
                  <input
                    type="number"
                    name="tiempo_estimado_horas"
                    min={1}
                    placeholder="Ej. 4"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    name="observaciones"
                    rows={2}
                    placeholder="Notas adicionales..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm resize-none"
                  />
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#163d2a] hover:bg-[#1e4535] text-white rounded-xl font-bold py-3 transition-all active:scale-[0.98] shadow-lg shadow-[#163d2a]/20 text-sm disabled:opacity-60"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear valoración técnica'}
                </button>
              </form>
            </RoleGuard>
          )}
        </section>
      </div>
    </div>
  );
};

export default TicketDetailPage;
