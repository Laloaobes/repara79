import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewTicketModal = ({ isOpen, onClose }: NewTicketModalProps) => {
  const [priority, setPriority] = useState('Media');

  // Prevenir renderizado si no está abierto
  if (!isOpen) return null;

  // Se añade <HTMLFormElement> para un correcto tipado en TypeScript
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Inyectamos el estado de la prioridad seleccionada
    data.priority = priority;

    console.log("Datos listos para enviar al backend:", data);
    // TODO: Enviar al servicio HTTP
    onClose();
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
                name="title"
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
                name="location"
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
                name="description"
                rows={4}
                placeholder="Describe el problema con detalle..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400 resize-none"
                required
              ></textarea>
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
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none transition-all text-sm font-medium text-slate-700"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

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
            className="flex-1 py-3.5 bg-[#163d2a] hover:bg-[#1e4535] text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-[#163d2a]/20 text-sm"
          >
            Enviar Reporte
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewTicketModal;