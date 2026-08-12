import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, ImagePlus, X } from 'lucide-react';
import repairsService, { FinishRepairPayload, Repair } from '../services/repairsService';

const stages = [
  { key: 'inicial', label: 'Inicial' },
  { key: 'durante', label: 'Durante' },
  { key: 'final', label: 'Final' },
] as const;

type Stage = typeof stages[number]['key'];
type Files = Partial<Record<Stage, File>>;
type Previews = Partial<Record<Stage, string>>;

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxBytes = 5 * 1024 * 1024;

interface Props {
  repair: Repair;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onCompleted: () => Promise<void>;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
  getError: (error: unknown) => string;
}

const RepairFinishCard = ({ repair, busy, onBusy, onCompleted, onMessage, onError, getError }: Props) => {
  const [process, setProcess] = useState('');
  const [finalState, setFinalState] = useState('');
  const [files, setFiles] = useState<Files>({});
  const [previews, setPreviews] = useState<Previews>({});
  const [fileErrors, setFileErrors] = useState<Previews>({});
  const [progress, setProgress] = useState(0);
  const previewsRef = useRef<Previews>({});

  useEffect(() => { previewsRef.current = previews; }, [previews]);
  useEffect(() => () => {
    Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const selectFile = (stage: Stage, file?: File) => {
    if (!file) return;
    let error = '';
    if (!allowedTypes.includes(file.type)) error = 'Utiliza JPG, PNG o WebP.';
    else if (file.size > maxBytes) error = 'La imagen supera los 5 MB.';

    if (previews[stage]) URL.revokeObjectURL(previews[stage]!);
    setFileErrors((current) => ({ ...current, [stage]: error }));

    if (error) {
      setFiles((current) => { const next = { ...current }; delete next[stage]; return next; });
      setPreviews((current) => { const next = { ...current }; delete next[stage]; return next; });
      return;
    }

    setFiles((current) => ({ ...current, [stage]: file }));
    setPreviews((current) => ({ ...current, [stage]: URL.createObjectURL(file) }));
  };

  const removeFile = (stage: Stage) => {
    if (previews[stage]) URL.revokeObjectURL(previews[stage]!);
    setFiles((current) => { const next = { ...current }; delete next[stage]; return next; });
    setPreviews((current) => { const next = { ...current }; delete next[stage]; return next; });
    setFileErrors((current) => { const next = { ...current }; delete next[stage]; return next; });
  };

  const ready = process.trim() && finalState.trim() && stages.every(({ key }) => files[key] && !fileErrors[key]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready || busy) return;

    onBusy(true);
    onError('');
    setProgress(1);
    try {
      await repairsService.finish(repair.id, {
        proceso_reparacion: process.trim(),
        estado_final: finalState.trim(),
        evidencia_inicial: files.inicial!,
        evidencia_durante: files.durante!,
        evidencia_final: files.final!,
      } as FinishRepairPayload, setProgress);
      setProgress(100);
      onMessage('Reparación finalizada. El PDF y la bitácora quedaron disponibles.');
      await onCompleted();
    } catch (error) {
      onError(getError(error));
      setProgress(0);
    } finally {
      onBusy(false);
    }
  };

  return <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><span className="text-xs font-black text-blue-700 uppercase">{repair.ticket?.folio}</span><h3 className="font-bold text-slate-800">{repair.ticket?.titulo}</h3><p className="mt-1 text-xs text-slate-500">Iniciada {new Date(repair.fecha_inicio).toLocaleString('es-MX')}</p></div>
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">En reparación</span>
    </div>
    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><b>Estado inicial confirmado:</b> {repair.estado_inicial}</div>
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-sm font-bold text-slate-700">Proceso realizado<textarea value={process} onChange={(event) => setProcess(event.target.value)} required maxLength={10000} placeholder="Describe las acciones, materiales y comprobaciones realizadas" className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-emerald-400" /></label>
      <label className="text-sm font-bold text-slate-700">Estado final<textarea value={finalState} onChange={(event) => setFinalState(event.target.value)} required maxLength={5000} placeholder="Describe el resultado verificable de la reparación" className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:ring-2 focus:ring-emerald-400" /></label>
    </div>
    <div>
      <p className="mb-3 text-sm font-bold text-slate-700"><Camera size={17} className="mr-2 inline" />Evidencias obligatorias</p>
      <div className="grid gap-3 md:grid-cols-3">
        {stages.map(({ key, label }) => <div key={key} className={`overflow-hidden rounded-xl border ${fileErrors[key] ? 'border-red-300' : previews[key] ? 'border-emerald-300' : 'border-dashed border-slate-300'}`}>
          {previews[key] ? <div className="relative"><img src={previews[key]} alt={`Vista previa ${label}`} className="h-40 w-full object-cover" /><button type="button" onClick={() => removeFile(key)} aria-label={`Quitar evidencia ${label}`} className="absolute right-2 top-2 rounded-full bg-slate-900/75 p-1.5 text-white"><X size={14} /></button></div> : <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 bg-slate-50 p-4 text-center text-xs font-bold text-slate-600 hover:bg-slate-100"><ImagePlus size={25} className="text-slate-400" />Evidencia {label}<span className="font-normal text-slate-400">JPG, PNG o WebP · máximo 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => selectFile(key, event.target.files?.[0])} /></label>}
          <div className="p-2 text-xs"><b>{label}</b>{files[key] && <p className="truncate text-slate-500">{files[key]!.name}</p>}{fileErrors[key] && <p className="text-red-600">{fileErrors[key]}</p>}</div>
        </div>)}
      </div>
    </div>
    {busy && <div aria-live="polite"><div className="mb-1 flex justify-between text-xs font-bold text-slate-600"><span>Subiendo y generando reporte…</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} /></div></div>}
    <button disabled={busy || !ready} className="flex items-center gap-2 rounded-xl bg-[#2d6a4f] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={17} />{busy ? 'Finalizando…' : 'Finalizar reparación'}</button>
  </form>;
};

export default RepairFinishCard;
