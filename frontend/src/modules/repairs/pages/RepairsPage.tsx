import React, { FormEvent, useEffect, useState } from 'react';
import { Camera, CheckCircle2, MapPin, Play, Wrench, X } from 'lucide-react';
import repairsService, { FinishRepairPayload, Repair, RepairTray } from '../services/repairsService';

const initialTray: RepairTray = { disponibles: [], en_curso: [] };

const getError = (error: unknown) => {
  const candidate = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
  const errors = candidate.response?.data?.errors;
  return errors ? Object.values(errors).flat()[0] : candidate.response?.data?.message || 'No fue posible completar la operación.';
};

const RepairsPage = () => {
  const [tray, setTray] = useState(initialTray);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<{ id: number; title: string } | null>(null);
  const [initialState, setInitialState] = useState('');

  const load = async () => {
    try {
      setTray(await repairsService.getTray());
    } catch (loadError) {
      setError(getError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const start = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTicket || !initialState.trim()) return;

    setBusy(selectedTicket.id);
    setError('');
    try {
      await repairsService.start(selectedTicket.id, initialState.trim());
      setMessage('El ticket quedó asignado y en reparación.');
      setSelectedTicket(null);
      setInitialState('');
      await load();
    } catch (startError) {
      setError(getError(startError));
    } finally {
      setBusy(null);
    }
  };

  const finish = async (event: FormEvent<HTMLFormElement>, repair: Repair) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      proceso_reparacion: String(form.get('proceso_reparacion') || ''),
      estado_final: String(form.get('estado_final') || ''),
      evidencia_inicial: form.get('evidencia_inicial'),
      evidencia_durante: form.get('evidencia_durante'),
      evidencia_final: form.get('evidencia_final'),
    } as FinishRepairPayload;

    setBusy(repair.id);
    setError('');
    try {
      await repairsService.finish(repair.id, payload);
      setMessage('Reparación finalizada. El reporte PDF y la bitácora se generaron correctamente.');
      await load();
    } catch (finishError) {
      setError(getError(finishError));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-7">
      {selectedTicket && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form onSubmit={start} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase text-emerald-700">TK-{String(selectedTicket.id).padStart(3, '0')}</span>
                <h2 className="text-xl font-extrabold text-slate-800">Tomar reparación</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedTicket.title}</p>
              </div>
              <button type="button" onClick={() => { setSelectedTicket(null); setInitialState(''); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>

            <label className="block text-sm font-bold text-slate-700">
              Estado inicial del desperfecto
              <textarea
                autoFocus
                required
                maxLength={5000}
                value={initialState}
                onChange={(event) => setInitialState(event.target.value)}
                placeholder="Describe qué observas antes de comenzar la reparación..."
                className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setSelectedTicket(null); setInitialState(''); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">
                Cancelar
              </button>
              <button type="submit" disabled={busy === selectedTicket.id || !initialState.trim()} className="flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                <Play size={15} /> {busy === selectedTicket.id ? 'Asignando...' : 'Confirmar asignación'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Reparaciones</h1>
        <p className="text-sm text-slate-500 mt-1">Toma tickets autorizados y documenta su conclusión.</p>
      </div>

      {message && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-700">{message}</div>}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {loading && <p className="text-sm text-slate-500">Cargando bandeja...</p>}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">En curso ({tray.en_curso.length})</h2>
        {tray.en_curso.map((repair) => (
          <form key={repair.id} onSubmit={(event) => finish(event, repair)} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-black text-blue-700 uppercase">{repair.ticket?.folio}</span>
              <h3 className="font-bold text-slate-800">{repair.ticket?.titulo}</h3>
              <p className="text-xs text-slate-500 mt-1">Estado inicial: {repair.estado_inicial}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <textarea name="proceso_reparacion" required maxLength={10000} placeholder="Proceso realizado" className="min-h-28 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400" />
              <textarea name="estado_final" required maxLength={5000} placeholder="Estado final del desperfecto" className="min-h-28 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {(['inicial', 'durante', 'final'] as const).map((stage) => (
                <label key={stage} className="rounded-xl border border-dashed border-slate-300 p-3 text-xs font-bold text-slate-600">
                  <Camera size={16} className="inline mr-2" /> Evidencia {stage}
                  <input name={`evidencia_${stage}`} type="file" required accept="image/jpeg,image/png,image/webp" className="block mt-2 w-full text-xs font-normal" />
                </label>
              ))}
            </div>
            <button disabled={busy === repair.id} className="rounded-xl bg-[#2d6a4f] px-5 py-3 text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2">
              <CheckCircle2 size={17} /> {busy === repair.id ? 'Finalizando...' : 'Finalizar reparación'}
            </button>
          </form>
        ))}
        {!loading && tray.en_curso.length === 0 && <p className="rounded-xl bg-slate-100 p-5 text-sm text-slate-500">No tienes reparaciones en curso.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Tickets autorizados ({tray.disponibles.length})</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {tray.disponibles.map((ticket) => (
            <article key={ticket.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between gap-3">
                <div><span className="text-xs font-black text-emerald-700">TK-{String(ticket.id).padStart(3, '0')}</span><h3 className="font-bold text-slate-800">{ticket.titulo}</h3></div>
                <Wrench className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 my-3 line-clamp-2">{ticket.descripcion_desperfecto}</p>
              <p className="text-xs text-slate-500 flex gap-1"><MapPin size={14} /> {ticket.area?.nombre} · {ticket.ubicacion}</p>
              <button type="button" onClick={() => { setSelectedTicket({ id: ticket.id, title: ticket.titulo }); setMessage(''); setError(''); }} disabled={busy === ticket.id} className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700 disabled:opacity-50 flex gap-2 items-center">
                <Play size={15} /> {busy === ticket.id ? 'Asignando...' : 'Tomar reparación'}
              </button>
            </article>
          ))}
        </div>
        {!loading && tray.disponibles.length === 0 && <p className="rounded-xl bg-slate-100 p-5 text-sm text-slate-500">No hay tickets autorizados disponibles.</p>}
      </section>
    </div>
  );
};

export default RepairsPage;
