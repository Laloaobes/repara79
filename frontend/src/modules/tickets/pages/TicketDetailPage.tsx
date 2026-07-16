import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, UserCircle, Plus, Trash2, ImageIcon } from 'lucide-react';
import RoleGuard from '../../auth/components/RoleGuard';
import ticketsService, { Ticket } from '../services/ticketsService';
import { ROLES } from '../../../constants/roles';
import { formatCurrency } from '../../../utils/currency';

interface MaterialRow {
  descripcion: string;
  costo: string;
}

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [materiales, setMateriales] = useState<MaterialRow[]>([]);

  const addMaterial = () => setMateriales((prev) => [...prev, { descripcion: '', costo: '' }]);
  const removeMaterial = (index: number) => setMateriales((prev) => prev.filter((_, i) => i !== index));
  const updateMaterial = (index: number, field: keyof MaterialRow, value: string) =>
    setMateriales((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));

  const totalMateriales = materiales.reduce((sum, m) => sum + (Number(m.costo) || 0), 0);

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

    const materialesPayload = materiales
      .filter((m) => m.descripcion.trim() !== '')
      .map((m) => ({ descripcion: m.descripcion.trim(), costo: Number(m.costo) || 0 }));

    try {
      await ticketsService.createValoracion({
        ticket_id: ticket.id,
        materiales: materialesPayload.length > 0 ? materialesPayload : undefined,
        observaciones: String(formData.get('observaciones') || ''),
      });

      setMateriales([]);
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
                  {ticket.valoracion.materiales.map((material, index) => (
                    <div
                      key={`${material.descripcion}-${index}`}
                      className="flex items-center justify-between px-4 py-2 text-sm border-b border-slate-100 last:border-b-0"
                    >
                      <span className="text-slate-700">{material.descripcion}</span>
                      <span className="font-bold text-slate-800">{formatCurrency(material.costo)}</span>
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
          ) : (
            <RoleGuard
              allowedRoles={[ROLES.PERSONAL_MANTENIMIENTO]}
              fallback={
                <p className="text-sm text-slate-500">
                  Este ticket aún no tiene una valoración técnica registrada.
                </p>
              }
            >
              <form onSubmit={handleCreateValoracion} className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Materiales y costos (opcional)
                    </label>
                    <button
                      type="button"
                      onClick={addMaterial}
                      className="flex items-center gap-1 text-xs font-bold text-[#2d6a4f] hover:underline"
                    >
                      <Plus size={14} /> Agregar material
                    </button>
                  </div>

                  {materiales.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                      {materiales.map((material, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={material.descripcion}
                            onChange={(e) => updateMaterial(index, 'descripcion', e.target.value)}
                            placeholder="Ej. Bomba de agua"
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm"
                          />
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={material.costo}
                            onChange={(e) => updateMaterial(index, 'costo', e.target.value)}
                            placeholder="Costo"
                            className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeMaterial(index)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <p className="text-right text-xs font-bold text-slate-600">
                        Total: {formatCurrency(totalMateriales)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Observaciones de la valoración
                  </label>
                  <textarea
                    name="observaciones"
                    rows={4}
                    required
                    placeholder="Describe la revisión técnica realizada..."
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
