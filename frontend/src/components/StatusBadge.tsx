import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export type TicketStatus = 'inspeccion' | 'presupuestado' | 'completado' | 'pendiente' | 'rechazado';

interface StatusBadgeProps {
  status: TicketStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let bgClass = '';
  let textClass = '';
  let borderClass = '';
  let label = '';
  let Icon = Clock;

  switch (status) {
    case 'inspeccion':
    case 'pendiente':
      bgClass = 'bg-amber-50/80';
      textClass = 'text-amber-800';
      borderClass = 'border-amber-200';
      label = 'En Inspección Técnica';
      Icon = Clock;
      break;
    case 'presupuestado':
      bgClass = 'bg-blue-50/80';
      textClass = 'text-blue-800';
      borderClass = 'border-blue-200';
      label = 'Material Presupuestado';
      Icon = AlertCircle;
      break;
    case 'completado':
    case 'autorizado':
      bgClass = 'bg-emerald-50/80';
      textClass = 'text-emerald-800';
      borderClass = 'border-emerald-200';
      label = 'Reparación Completada';
      Icon = CheckCircle2;
      break;
    case 'rechazado':
      bgClass = 'bg-rose-50/80';
      textClass = 'text-rose-800';
      borderClass = 'border-rose-200';
      label = 'Rechazado';
      Icon = ShieldAlert;
      break;
    default:
      bgClass = 'bg-slate-50';
      textClass = 'text-slate-700';
      borderClass = 'border-slate-200';
      label = status;
      Icon = Clock;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${bgClass} ${textClass} ${borderClass} shadow-sm transition-all duration-200 hover:scale-[1.02]`}>
      <Icon className="w-3.5 h-3.5 animate-pulse" />
      <span>{label}</span>
    </span>
  );
}
