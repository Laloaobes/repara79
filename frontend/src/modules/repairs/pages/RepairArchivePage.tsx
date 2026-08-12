import React, { FormEvent, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, FileText, MapPin, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import archivesService, { ArchivePage } from '../services/archivesService';

const emptyPage: ArchivePage = { items: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } };

const RepairArchivePage = () => {
  const [result, setResult] = useState(emptyPage);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = async (value = appliedSearch, page = 1) => {
    setLoading(true);
    try {
      setResult(await archivesService.getAll(value, page));
      setError('');
    } catch (requestError) {
      const status = (requestError as { response?: { status?: number } }).response?.status;
      setError(status === 403 ? 'No tienes permiso para consultar el Archivero.' : 'No fue posible consultar el Archivero. Verifica la conexión e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load('', 1); }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    setAppliedSearch(value);
    load(value, 1);
  };

  const clear = () => {
    setSearch('');
    setAppliedSearch('');
    load('', 1);
  };

  const download = async (ticketId: number, folio: string) => {
    setDownloading(ticketId);
    setError('');
    try { await archivesService.downloadReport(ticketId, folio); }
    catch { setError('No fue posible descargar el PDF. Puede no existir o tu sesión no tener acceso.'); }
    finally { setDownloading(null); }
  };

  return <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
    <div><h1 className="text-2xl font-extrabold text-slate-800 md:text-3xl">Archivero de reparaciones</h1><p className="mt-1 text-sm text-slate-500">Consulta expedientes cerrados y descarga reportes mediante tu sesión.</p></div>
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar folio, título, área o ubicación" className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-10 text-sm outline-none focus:ring-2 focus:ring-emerald-400" />{search && <button type="button" onClick={clear} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={17} /></button>}</div><button className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white">Buscar</button></form>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>{appliedSearch ? <>Resultados para <b>“{appliedSearch}”</b></> : 'Todos los expedientes'}</span><span>{result.meta.total} registro{result.meta.total === 1 ? '' : 's'}</span></div>
    {error && <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {loading && <p className="text-sm text-slate-500">Cargando expedientes…</p>}
    <div className="grid gap-4 lg:grid-cols-2">{result.items.map((archive) => <article key={archive.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex gap-3"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><FileText size={22} /></div><div className="min-w-0"><span className="text-xs font-black text-emerald-700">{archive.ticket.folio}</span><h2 className="font-bold text-slate-800">{archive.titulo}</h2><time className="text-xs text-slate-400">{new Date(archive.fecha_generacion).toLocaleString('es-MX')}</time></div></div><p className="line-clamp-3 text-sm text-slate-600">{archive.descripcion_final}</p><p className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={14} />{archive.ticket.area} · {archive.ticket.ubicacion}</p><p className="text-xs text-slate-500">Responsable: <b>{archive.generado_por?.name || 'No registrado'}</b></p><div className="flex flex-wrap gap-2"><Link to={`/archivero-reparaciones/${archive.id}`} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"><Eye size={16} />Ver detalle</Link><button disabled={downloading === archive.ticket.id} onClick={() => download(archive.ticket.id, archive.ticket.folio)} className="flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Download size={16} />{downloading === archive.ticket.id ? 'Descargando…' : 'Descargar PDF'}</button></div></article>)}</div>
    {!loading && result.items.length === 0 && <p className="rounded-xl bg-slate-100 p-6 text-center text-sm text-slate-500">{appliedSearch ? 'No se encontraron expedientes con esos criterios.' : 'Todavía no existen reparaciones archivadas dentro de tu alcance.'}</p>}
    {result.meta.last_page > 1 && <nav aria-label="Paginación del Archivero" className="flex items-center justify-center gap-3"><button disabled={loading || result.meta.current_page === 1} onClick={() => load(appliedSearch, result.meta.current_page - 1)} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40"><ChevronLeft size={16} />Anterior</button><span className="text-sm text-slate-500">Página <b>{result.meta.current_page}</b> de <b>{result.meta.last_page}</b></span><button disabled={loading || result.meta.current_page === result.meta.last_page} onClick={() => load(appliedSearch, result.meta.current_page + 1)} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40">Siguiente<ChevronRight size={16} /></button></nav>}
  </div>;
};

export default RepairArchivePage;
