import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Download, FileText, MapPin, UserRound, Wrench } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import archivesService, { RepairArchive } from '../services/archivesService';

const labels = { inicial: 'Inicial', durante: 'Durante', final: 'Final' } as const;

const RepairArchiveDetailPage = () => {
  const { id } = useParams();
  const [archive, setArchive] = useState<RepairArchive | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const archiveId = Number(id);
    if (!Number.isInteger(archiveId) || archiveId < 1) { setError('El identificador del expediente no es válido.'); setLoading(false); return; }
    archivesService.getById(archiveId)
      .then(setArchive)
      .catch((requestError) => {
        const status = (requestError as { response?: { status?: number } }).response?.status;
        setError(status === 403 ? 'No tienes permiso para consultar este expediente.' : status === 404 ? 'El expediente no existe o ya no está disponible.' : 'No fue posible cargar el expediente.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const download = async () => {
    if (!archive) return;
    setDownloading(true);
    setError('');
    try { await archivesService.downloadReport(archive.ticket.id, archive.ticket.folio); }
    catch { setError('No fue posible descargar el reporte protegido.'); }
    finally { setDownloading(false); }
  };

  return <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
    <Link to="/archivero-reparaciones" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft size={17} />Volver al Archivero</Link>
    {loading && <p className="text-sm text-slate-500">Cargando expediente…</p>}
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {archive && <>
      <header className="rounded-2xl bg-gradient-to-br from-[#163d2a] to-[#2d6a4f] p-6 text-white shadow-lg"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-xs font-black uppercase tracking-wider text-emerald-200">Expediente {archive.ticket.folio}</span><h1 className="mt-1 text-2xl font-extrabold md:text-3xl">{archive.ticket.titulo}</h1><p className="mt-2 flex items-center gap-1 text-sm text-emerald-100"><MapPin size={15} />{archive.ticket.sede} · {archive.ticket.area} · {archive.ticket.ubicacion}</p></div><FileText size={38} className="text-emerald-200" /></div></header>
      <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4"><CalendarDays className="mb-2 text-emerald-600" /><p className="text-xs text-slate-400">Fecha de archivo</p><p className="text-sm font-bold text-slate-700">{new Date(archive.fecha_generacion).toLocaleString('es-MX')}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><UserRound className="mb-2 text-emerald-600" /><p className="text-xs text-slate-400">Responsable</p><p className="text-sm font-bold text-slate-700">{archive.generado_por?.name || 'No registrado'}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4"><Wrench className="mb-2 text-emerald-600" /><p className="text-xs text-slate-400">Finalización</p><p className="text-sm font-bold text-slate-700">{archive.reparacion?.fecha_reparacion ? new Date(archive.reparacion.fecha_reparacion).toLocaleString('es-MX') : 'No registrada'}</p></div></section>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-extrabold text-slate-800">Memoria técnica</h2><div><p className="text-xs font-bold uppercase text-slate-400">Estado inicial</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{archive.reparacion?.estado_inicial}</p></div><div><p className="text-xs font-bold uppercase text-slate-400">Proceso realizado</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{archive.reparacion?.proceso_reparacion}</p></div><div><p className="text-xs font-bold uppercase text-slate-400">Resultado final</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{archive.descripcion_final}</p></div></section>
      <section><h2 className="mb-3 text-lg font-extrabold text-slate-800">Evidencias fotográficas</h2><div className="grid gap-4 md:grid-cols-3">{archive.reparacion?.evidencias.map((evidence) => <figure key={evidence.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><img src={evidence.imagen_url} alt={`Evidencia ${labels[evidence.tipo]}`} className="h-56 w-full object-cover" /><figcaption className="p-3 text-sm font-bold text-slate-700">{labels[evidence.tipo]}</figcaption></figure>)}</div></section>
      <button disabled={downloading} onClick={download} className="flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Download size={17} />{downloading ? 'Descargando…' : 'Descargar reporte PDF protegido'}</button>
    </>}
  </div>;
};

export default RepairArchiveDetailPage;
