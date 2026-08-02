import React, { useEffect, useState } from 'react';
import { Download, FileText, MapPin, Search } from 'lucide-react';
import archivesService, { RepairArchive } from '../services/archivesService';

const RepairArchivePage = () => {
  const [archives, setArchives] = useState<RepairArchive[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (value = '') => {
    setLoading(true);
    try {
      setArchives(await archivesService.getAll(value));
      setError('');
    } catch {
      setError('No fue posible consultar el archivero.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Archivero de reparaciones</h1><p className="text-sm text-slate-500 mt-1">Consulta los cierres y descarga reportes mediante tu sesión.</p></div>
      <form onSubmit={(event) => { event.preventDefault(); load(search); }} className="flex gap-2">
        <div className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar folio, título o ubicación" className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-400" /></div>
        <button className="rounded-xl bg-slate-800 px-5 text-sm font-bold text-white">Buscar</button>
      </form>
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Cargando expedientes...</p>}
      <div className="grid lg:grid-cols-2 gap-4">
        {archives.map((archive) => (
          <article key={archive.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex gap-3"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><FileText size={22} /></div><div><span className="text-xs font-black text-emerald-700">{archive.ticket.folio}</span><h2 className="font-bold text-slate-800">{archive.titulo}</h2></div></div>
            <p className="text-sm text-slate-600">{archive.descripcion_final}</p>
            <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={14} /> {archive.ticket.area} · {archive.ticket.ubicacion}</p>
            {archive.reparacion && <details className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><summary className="cursor-pointer font-bold text-slate-700">Ver memoria técnica</summary><div className="mt-3 space-y-2"><p><b>Estado inicial:</b> {archive.reparacion.estado_inicial}</p><p><b>Proceso:</b> {archive.reparacion.proceso_reparacion}</p><p><b>Estado final:</b> {archive.reparacion.estado_final}</p><div className="grid grid-cols-3 gap-2">{archive.reparacion.evidencias.map((evidence) => <img key={evidence.id} src={evidence.imagen_url} alt={`Evidencia ${evidence.tipo}`} className="h-24 w-full rounded-lg object-cover" />)}</div></div></details>}
            <button onClick={() => archivesService.downloadReport(archive.ticket.id, archive.ticket.folio)} className="flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-4 py-2.5 text-sm font-bold text-white"><Download size={16} /> Descargar PDF</button>
          </article>
        ))}
      </div>
      {!loading && archives.length === 0 && <p className="rounded-xl bg-slate-100 p-6 text-center text-sm text-slate-500">No hay reparaciones archivadas con esos criterios.</p>}
    </div>
  );
};

export default RepairArchivePage;
