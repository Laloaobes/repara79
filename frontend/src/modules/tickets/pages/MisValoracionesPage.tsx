import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Calendar } from 'lucide-react';
import EditRejectedValoracionModal from '../components/valuation/EditRejectedValoracionModal';
import valoracionesService, { MiValoracion } from '../services/valoracionesService';
import { formatCurrency } from '../../../utils/currency';

const ESTADO_STYLES: Record<string, string> = {
  'Pendiente de autorización': 'bg-amber-50 text-amber-600 border-amber-200',
  Autorizada: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Rechazada: 'bg-red-50 text-red-600 border-red-200',
};

const EstadoBadge = ({ estado }: { estado: string }) => (
  <span
    className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-black tracking-wider uppercase border ${
      ESTADO_STYLES[estado] || 'bg-slate-50 text-slate-600 border-slate-200'
    }`}
  >
    {estado}
  </span>
);

const MisValoracionesPage = () => {
  const [valoraciones, setValoraciones] = useState<MiValoracion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MiValoracion | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadValoraciones = async () => {
      try {
        const data = await valoracionesService.getMisValoraciones();
        setValoraciones(data);
      } catch (err) {
        console.error(err);
        setError('No fue posible cargar tus valoraciones.');
      } finally {
        setIsLoading(false);
      }
    };

    loadValoraciones();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm font-bold text-slate-500">Cargando tus valoraciones...</div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Wrench size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mis Valoraciones</h1>
          <p className="text-sm text-slate-500">{valoraciones.length} registradas</p>
        </div>
      </div>

      {error && (
        <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          {success}
        </p>
      )}

      {valoraciones.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
          <h3 className="text-slate-800 font-bold mb-1">Aún no has registrado valoraciones</h3>
          <p className="text-slate-500 text-sm">Cuando valores un ticket, aparecerá aquí junto con su estado.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {valoraciones.map((valoracion) => {
            return (
              <div
                key={valoracion.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.65rem] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                        TK-{String(valoracion.ticket.id).padStart(3, '0')}
                      </span>
                      <EstadoBadge estado={valoracion.estado} />
                    </div>
                    <Link
                      to={`/tickets/${valoracion.ticket.id}`}
                      className="font-bold text-slate-800 hover:text-[#2d6a4f] transition-colors truncate block"
                    >
                      {valoracion.ticket.titulo}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Calendar size={12} />
                      {new Date(valoracion.created_at).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-slate-800">{formatCurrency(valoracion.costo_estimado)}</p>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wide text-slate-400">Costo estimado</p>
                  </div>
                </div>

                {valoracion.estado === 'Rechazada' && valoracion.motivo_rechazo && (
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1">
                      <p className="text-[0.7rem] font-bold uppercase tracking-wide text-red-700 mb-1">
                        Motivo de rechazo
                      </p>
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                        {valoracion.motivo_rechazo}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(valoracion);
                        setSuccess(null);
                      }}
                      className="shrink-0 px-4 py-3 bg-[#163d2a] text-white rounded-xl text-xs font-bold"
                    >
                      Corregir y reenviar
                    </button>
                  </div>
                )}

                {valoracion.materiales && valoracion.materiales.length > 0 && (
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wide text-slate-400 mb-2">
                      Materiales
                    </p>
                    <div className="flex flex-col gap-2">
                      {valoracion.materiales.map((material) => {
                        return (
                          <div
                            key={material.id}
                            className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">{material.descripcion}</p>
                              <p className="text-[0.7rem] text-slate-500">
                                {material.cantidad} × {formatCurrency(material.costo_unitario)}
                              </p>
                            </div>
                            <span className="text-xs font-black text-slate-800">
                              {formatCurrency(material.subtotal)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <EditRejectedValoracionModal
        open={selected !== null}
        valoracion={selected}
        onClose={() => setSelected(null)}
        onSuccess={(updated) => {
          setValoraciones((current) => current.map((item) => (
            item.id === updated.id ? updated : item
          )));
          setSelected(null);
          setError(null);
          setSuccess('La valoración corregida fue reenviada para autorización.');
        }}
      />
    </div>
  );
};

export default MisValoracionesPage;
