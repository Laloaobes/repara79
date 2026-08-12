import React, { FormEvent, useEffect, useState } from 'react';
import { MapPin, Play, Search, Wrench, X } from 'lucide-react';
import RepairFinishCard from '../components/RepairFinishCard';
import repairsService, { RepairTray } from '../services/repairsService';

const initialTray: RepairTray = { disponibles: [], en_curso: [] };

const getError = (error: unknown) => {
  const candidate = error as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
  const errors = candidate.response?.data?.errors;
  if (errors) return Object.values(errors).flat()[0];
  if (candidate.response?.status === 403) return 'No tienes permiso para realizar esta acción.';
  if (candidate.response?.status === 404) return 'La reparación ya no está disponible o pertenece a otro usuario.';
  if (candidate.response?.status === 422) return candidate.response?.data?.message || 'Revisa los datos y archivos seleccionados.';
  return candidate.response?.data?.message || 'No fue posible completar la operación.';
};

const RepairsPage = () => {
  const [tray, setTray] = useState(initialTray);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<{ id: number; title: string; description: string } | null>(null);
  const [initialState, setInitialState] = useState('');

  const load = async (value = appliedSearch) => {
    setLoading(true);
    try {
      setTray(await repairsService.getTray(value));
      setError('');
    } catch (loadError) {
      setError(getError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(''); }, []);

  const applySearch = (event: FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    setAppliedSearch(value);
    load(value);
  };

  const clearSearch = () => {
    setSearch('');
    setAppliedSearch('');
    load('');
  };

  const start = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket || initialState.trim().length < 5) return;
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

  return <div className="mx-auto max-w-7xl space-y-7 p-4 md:p-8">
    {selectedTicket && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm"><form onSubmit={start} className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4"><div><span className="text-xs font-black uppercase text-emerald-700">TK-{String(selectedTicket.id).padStart(3, '0')}</span><h2 className="text-xl font-extrabold text-slate-800">Tomar reparación</h2><p className="mt-1 text-sm text-slate-500">{selectedTicket.title}</p></div><button type="button" onClick={() => setSelectedTicket(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Cerrar"><X size={20} /></button></div>
      <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700">El estado inicial se precarga con el reporte original. Confirma o corrige únicamente lo que observas antes de intervenir.</div>
      <label className="block text-sm font-bold text-slate-700">Estado inicial del desperfecto<textarea autoFocus required minLength={5} maxLength={5000} value={initialState} onChange={(event) => setInitialState(event.target.value)} className="mt-2 min-h-36 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-emerald-400" /></label>
      <div className="flex justify-end gap-3"><button type="button" onClick={() => setSelectedTicket(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Cancelar</button><button type="submit" disabled={busy === selectedTicket.id || initialState.trim().length < 5} className="flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Play size={15} />{busy === selectedTicket.id ? 'Asignando…' : 'Confirmar asignación'}</button></div>
    </form></div>}

    <div><h1 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Reparaciones</h1><p className="mt-1 text-sm text-slate-500">Busca, toma tickets autorizados y documenta su conclusión.</p></div>
    <form onSubmit={applySearch} className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input maxLength={150} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por folio, título, descripción o ubicación" className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-10 text-sm outline-none focus:ring-2 focus:ring-emerald-400" />{search && <button type="button" onClick={clearSearch} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={17} /></button>}</div><button className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white">Buscar</button></form>
    {appliedSearch && <p className="text-xs text-slate-500">Resultados para <b>“{appliedSearch}”</b></p>}
    {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {loading && <p className="text-sm text-slate-500">Cargando bandeja…</p>}

    <section className="space-y-3"><h2 className="text-lg font-bold text-slate-800">En curso ({tray.en_curso.length})</h2>{tray.en_curso.map((repair) => <RepairFinishCard key={repair.id} repair={repair} busy={busy === repair.id} onBusy={(value) => setBusy(value ? repair.id : null)} onCompleted={() => load()} onMessage={setMessage} onError={setError} getError={getError} />)}{!loading && tray.en_curso.length === 0 && <p className="rounded-xl bg-slate-100 p-5 text-sm text-slate-500">{appliedSearch ? 'No hay reparaciones en curso que coincidan.' : 'No tienes reparaciones en curso.'}</p>}</section>

    <section className="space-y-3"><h2 className="text-lg font-bold text-slate-800">Tickets autorizados ({tray.disponibles.length})</h2><div className="grid gap-3 md:grid-cols-2">{tray.disponibles.map((ticket) => <article key={ticket.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><div><span className="text-xs font-black text-emerald-700">TK-{String(ticket.id).padStart(3, '0')}</span><h3 className="font-bold text-slate-800">{ticket.titulo}</h3></div><Wrench className="text-slate-300" /></div><p className="my-3 line-clamp-3 text-sm text-slate-500">{ticket.descripcion_desperfecto}</p><p className="flex gap-1 text-xs text-slate-500"><MapPin size={14} />{ticket.area?.nombre} · {ticket.ubicacion}</p><button type="button" onClick={() => { setSelectedTicket({ id: ticket.id, title: ticket.titulo, description: ticket.descripcion_desperfecto }); setInitialState(ticket.descripcion_desperfecto); setMessage(''); setError(''); }} disabled={busy === ticket.id} className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 disabled:opacity-50"><Play size={15} />Tomar reparación</button></article>)}</div>{!loading && tray.disponibles.length === 0 && <p className="rounded-xl bg-slate-100 p-5 text-sm text-slate-500">{appliedSearch ? 'No hay tickets autorizados que coincidan.' : 'No hay tickets autorizados disponibles.'}</p>}</section>
  </div>;
};

export default RepairsPage;
