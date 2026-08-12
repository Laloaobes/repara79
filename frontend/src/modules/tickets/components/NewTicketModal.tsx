import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ImagePlus, X } from 'lucide-react';
import ticketsService, { TicketCatalogs } from '../services/ticketsService';
import SystemAlert from '../../../components/SystemAlert';

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImageBytes = 5 * 1024 * 1024;

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const NewTicketModal = ({ isOpen, onClose, onCreated }: NewTicketModalProps) => {
  const [catalogs, setCatalogs] = useState<TicketCatalogs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!isOpen) return;

    const loadCatalogs = async () => {
      try {
        const data = await ticketsService.getCatalogs();
        setCatalogs(data);
      } catch (error) {
        console.error(error);
        setMessage('No fue posible cargar los catalogos del formulario.');
      }
    };

    loadCatalogs();
  }, [isOpen]);

  const selectImage = (file?: File) => {
    setMessage(null);

    if (!file) {
      setSelectedImage(null);
      setPreviewUrl(null);
      return;
    }
    if (!allowedImageTypes.includes(file.type)) {
      setMessage('La fotografía debe estar en formato JPG, PNG o WebP.');
      setSelectedImage(null);
      setPreviewUrl(null);
      return;
    }
    if (file.size > maxImageBytes) {
      setMessage('La fotografía no puede superar los 5 MB.');
      setSelectedImage(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setSelectedImage(null);
    setPreviewUrl(null);
    setMessage(null);
    onClose();
  };

  // Prevenir renderizado si no está abierto
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const payload = new FormData();

    payload.append('titulo', String(formData.get('titulo') || ''));
    payload.append('ubicacion', String(formData.get('ubicacion') || ''));
    payload.append('descripcion_desperfecto', String(formData.get('descripcion_desperfecto') || ''));
    payload.append('area_id', String(formData.get('area_id') || ''));
    payload.append('tipo_desperfecto_id', String(formData.get('tipo_desperfecto_id') || ''));
    payload.append('prioridad_id', String(formData.get('prioridad_id') || ''));

    if (selectedImage) {
      payload.append('fotografia_referencia', selectedImage);
    }

    try {
      await ticketsService.createTicket(payload);

      setSelectedImage(null);
      setPreviewUrl(null);
      onCreated?.();
      onClose();
    } catch (error) {
      console.error(error);
      const errors = axios.isAxiosError(error)
        ? error.response?.data?.errors as Record<string, string[]> | undefined
        : undefined;
      setMessage(
        (errors && Object.values(errors).flat()[0])
        || 'No fue posible crear el ticket. Revisa los campos e intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* Backdrop con Blur (Cierra el modal al hacer clic afuera) */
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" 
      onClick={closeModal}
    >
      
      {/* Modal Content (Detiene la propagación del clic para que no se cierre al hacer clic adentro) */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header Fijo */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Nuevo Reporte</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Registrar incidencia de mantenimiento</p>
          </div>
          <button 
            type="button"
            onClick={closeModal}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body con Scroll */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          <form id="new-ticket-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Título */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#52b788]"></span> Título del problema
              </label>
              <input 
                type="text" 
                name="titulo"
                minLength={3}
                maxLength={150}
                placeholder="Ej. Fuga de agua en baño" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                required
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Ubicación
              </label>
              <input 
                type="text" 
                name="ubicacion"
                minLength={3}
                maxLength={255}
                placeholder="Ej. Aula 7, Edificio B" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Descripción
              </label>
              <textarea 
                name="descripcion_desperfecto"
                rows={4}
                minLength={5}
                maxLength={5000}
                placeholder="Describe el problema con detalle..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400 resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Area
              </label>
              <select
                name="area_id"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700"
                required
              >
                <option value="">Selecciona un area</option>
                {catalogs?.areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre}{area.sede ? ` - ${area.sede.nombre}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Tipo de desperfecto
              </label>
              <select
                name="tipo_desperfecto_id"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700"
                required
              >
                <option value="">Selecciona un tipo</option>
                {catalogs?.tipos_desperfectos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                ))}
              </select>
            </div>

            {/* Subir Evidencia */}
            <div className="overflow-hidden rounded-2xl border-2 border-dashed border-[#52b788]/30 bg-[#f0fdf4]/50">
              {previewUrl ? (
                <div>
                  <div className="relative h-56 bg-slate-100">
                    <img src={previewUrl} alt="Vista previa de la fotografía seleccionada" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => selectImage()}
                      aria-label="Quitar fotografía seleccionada"
                      className="absolute right-3 top-3 rounded-full bg-slate-900/75 p-2 text-white hover:bg-slate-900"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 text-xs">
                    <span className="truncate font-semibold text-slate-600">{selectedImage?.name}</span>
                    <label className="shrink-0 cursor-pointer font-bold text-emerald-700 hover:underline">
                      Cambiar
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => selectImage(event.target.files?.[0])} />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center p-6 text-center hover:bg-[#f0fdf4]">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#52b788] shadow-sm">
                    <ImagePlus size={19} />
                  </span>
                  <span className="mb-1 text-sm font-bold text-[#163d2a]">Seleccionar fotografía de referencia</span>
                  <span className="text-[0.65rem] font-medium uppercase tracking-widest text-[#163d2a]/60">JPG, PNG o WebP — máx. 5 MB</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => selectImage(event.target.files?.[0])} />
                </label>
              )}
            </div>

            {/* Selector de Prioridad */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Prioridad
              </label>
              <select
                name="prioridad_id"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700"
                required
              >
                <option value="">Selecciona una prioridad</option>
                {catalogs?.prioridades.map((prioridad) => (
                  <option key={prioridad.id_prioridad} value={prioridad.id_prioridad}>{prioridad.nombre}</option>
                ))}
              </select>
            </div>

            {message && (
              <SystemAlert message={message} onDismiss={() => setMessage(null)} />
            )}

          </form>
        </div>

        {/* Footer Fijo */}
        <div className="p-4 md:p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50 rounded-b-[2rem]">
          <button 
            type="button" 
            onClick={closeModal}
            className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="new-ticket-form"
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-[#163d2a] hover:bg-[#1e4535] text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-[#163d2a]/20 text-sm"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewTicketModal;
