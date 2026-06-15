import React from 'react';
import { ClipboardList, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="text-center p-10 md:p-14 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 shadow-sm animate-fade-in flex flex-col items-center">
      <div className="w-14 h-14 bg-white text-slate-400 rounded-2xl border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
        <ClipboardList className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 font-medium max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
