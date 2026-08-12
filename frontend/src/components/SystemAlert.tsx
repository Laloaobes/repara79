import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'info';

interface SystemAlertProps {
  message: string;
  variant?: AlertVariant;
  onDismiss?: () => void;
}

const styles: Record<AlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const SystemAlert = ({ message, variant = 'error', onDismiss }: SystemAlertProps) => {
  const Icon = icons[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${styles[variant]}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Cerrar alerta" className="rounded-md p-0.5 opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SystemAlert;
