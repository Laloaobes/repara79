import React, { useEffect, useState } from 'react';
import { X, Upload } from 'lucide-react';
import ticketsService, { TicketCatalogs } from '../services/ticketsService';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const NewTicketModal = ({ isOpen, onClose, onCreated }: NewTicketModalProps) => {
  const [catalogs, setCatalogs] = useState<TicketCatalogs | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  // Prevenir renderizado si no está abierto
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      await ticketsService.createTicket({
        titulo: String(formData.get('titulo')),
        ubicacion: String(formData.get('ubicacion')),
        descripcion_desperfecto: String(formData.get('descripcion_desperfecto')),
        area_id: Number(formData.get('area_id')),
        tipo_desperfecto_id: Number(formData.get('tipo_desperfecto_id')),
        prioridad_id: Number(formData.get('prioridad_id')),
      });

      setMessage('Ticket creado correctamente.');
      onCreated?.();
      onClose();
    } catch (error) {
      console.error(error);
      setMessage('No fue posible crear el ticket. Revisa los campos e intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* Backdrop con Blur (Cierra el modal al hacer clic afuera) */
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" 
      onClick={onClose}
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
            onClick={onClose}
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
            <div className="relative border-2 border-dashed border-[#52b788]/30 bg-[#f0fdf4]/50 rounded-2xl p-6 text-center hover:bg-[#f0fdf4] transition-colors group cursor-pointer">
              <input 
                type="file" 
                name="evidence"
                accept="image/png, image/jpeg"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm text-[#52b788] mb-3 group-hover:-translate-y-1 transition-transform">
                <Upload size={18} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-bold text-[#163d2a] mb-1">Subir evidencia fotográfica</p>
              <p className="text-[0.65rem] font-medium text-[#163d2a]/60 uppercase tracking-widest">PNG, JPG — máx. 5 MB</p>
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
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {message}
              </p>
            )}

          </form>
        </div>

        {/* Footer Fijo */}
        <div className="p-4 md:p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50 rounded-b-[2rem]">
          <button 
            type="button" 
            onClick={onClose}
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
