import React, { useRef } from 'react';
import { UploadCloud, ImageIcon, FileCheck2 } from 'lucide-react';

interface EvidenceUploaderProps {
  id: string;
  label: string;
  description: string;
  fileName?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function EvidenceUploader({
  id,
  label,
  description,
  fileName,
  onChange,
  required = false,
}: EvidenceUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer p-6 md:p-8 transition-all text-center select-none ${
          fileName 
            ? 'border-emerald-300 bg-emerald-50/10 hover:bg-emerald-50/20 hover:border-emerald-400' 
            : 'border-slate-200 bg-slate-50/30 hover:border-blue-500 hover:bg-blue-50/10'
        } focus-within:ring-4 focus-within:ring-blue-100 group`}
      >
        <input 
          type="file" 
          id={id} 
          ref={fileInputRef}
          name={id} 
          accept="image/*" 
          required={required} 
          onChange={onChange}
          className="sr-only" 
        />
        
        {fileName ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="p-3 bg-emerald-100/80 rounded-full text-emerald-600 mb-3 shadow-sm">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-slate-800 block mb-0.5">
              ¡Evidencia Cargada Correctamente!
            </span>
            <span className="text-xs text-emerald-700 bg-emerald-100/30 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 mt-1 max-w-full truncate">
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              {fileName}
            </span>
          </div>
        ) : (
          <>
            <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-500 transition-colors mb-3 group-hover:scale-110 duration-200" />
            <span className="text-sm font-semibold text-slate-700 block mb-0.5 group-hover:text-slate-900">
              Haga clic para cargar o arrastre la fotografía aquí
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {description}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
