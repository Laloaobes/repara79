import React, { useState, useEffect } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import apiClient from '../../../api/axios';
import ticketService from '../services/ticketService';

interface Zona { id: number; nombre: string; }

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIAS = [
  'Plomería', 'Electricidad', 'Carpintería', 'Pintura', 'Limpieza',
  'Equipo de cómputo', 'Mobiliario', 'Infraestructura', 'Seguridad', 'Otro',
];

const PRIORIDADES: { value: string; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const NewTicketModal = ({ isOpen, onClose }: NewTicketModalProps) => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    apiClient.get('/zonas').then(r => setZonas(r.data)).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Añadir archivos de evidencia
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput?.files) {
      Array.from(fileInput.files).forEach(file => {
        formData.append('evidencias[]', file);
      });
    }

    try {
      await ticketService.create(formData);
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string,string[]> } } };
      const msgs = e?.response?.data?.errors;
      if (msgs) {
        setError(Object.values(msgs).flat().join(' '));
      } else {
        setError(e?.response?.data?.message || 'Error al crear el ticket. Intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Nuevo Reporte</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Registrar incidencia de mantenimiento</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="new-ticket-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Zona */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 ml-1 block">Zona / Área *</label>
              <select name="zona_id" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium text-slate-700">
                <option value="">Selecciona una zona...</option>
                {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 ml-1 block">Categoría *</label>
              <select name="categoria" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium text-slate-700">
                <option value="">Selecciona una categoría...</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Ubicación exacta */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 ml-1 block">Ubicación exacta *</label>
              <input
                type="text" name="ubicacion_exacta" required
                placeholder="Ej. Aula 7, primer piso, lado norte"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 ml-1 block">Descripción *</label>
              <textarea
                name="descripcion" rows={4} required
                placeholder="Describe el problema con detalle..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Prioridad */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 ml-1 block">Prioridad *</label>
              <select name="prioridad" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium text-slate-700">
                {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {/* Evidencias */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 ml-1 block">Evidencia fotográfica (opcional)</label>
              <div className="relative border-2 border-dashed border-[#52b788]/30 bg-[#f0fdf4]/50 rounded-2xl p-6 text-center hover:bg-[#f0fdf4] transition-colors cursor-pointer">
                <input
                  type="file" accept="image/png,image/jpeg" multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={e => {
                    const files = Array.from(e.target.files ?? []);
                    setFileNames(files.map(f => f.name));
                  }}
                />
                <Upload size={20} className="mx-auto text-[#52b788] mb-2" />
                <p className="text-sm font-bold text-[#163d2a] mb-1">
                  {fileNames.length > 0 ? fileNames.join(', ') : 'Subir evidencia fotográfica'}
                </p>
                <p className="text-[0.65rem] font-medium text-[#163d2a]/60 uppercase tracking-widest">PNG, JPG — máx. 5 MB c/u</p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50 rounded-b-[2rem]">
          <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 text-sm">
            Cancelar
          </button>
          <button
            type="submit" form="new-ticket-form" disabled={isSubmitting}
            className="flex-1 py-3.5 bg-[#163d2a] hover:bg-[#1e4535] disabled:opacity-60 text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg text-sm"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTicketModal;
