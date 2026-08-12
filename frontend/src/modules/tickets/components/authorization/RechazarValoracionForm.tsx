import React from 'react';

interface RechazarValoracionFormProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const RechazarValoracionForm = ({
  value,
  disabled = false,
  onChange,
}: RechazarValoracionFormProps) => (
  <div>
    <label htmlFor="motivo-rechazo" className="block text-xs font-bold text-slate-700 mb-2">
      Motivo del rechazo
    </label>
    <textarea
      id="motivo-rechazo"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      minLength={5}
      maxLength={500}
      required
      autoFocus
      disabled={disabled}
      placeholder="Explica qué debe corregirse..."
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-400 outline-none text-sm resize-none disabled:opacity-60"
    />
    <p className="mt-1 text-right text-[0.7rem] text-slate-400">{value.length}/500</p>
  </div>
);

export default RechazarValoracionForm;
