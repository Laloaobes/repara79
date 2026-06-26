import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, AlertTriangle, MapPin, Pencil, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import zonaService, { Zona, Encargado, ZonaPayload } from '../services/zonaService';

type ModalMode = 'create' | 'edit' | null;

const EMPTY_PAYLOAD: ZonaPayload = { nombre: '', descripcion: '', responsable_id: null, estatus: true };

const ZonasPage = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [total, setTotal] = useState(0);
  const [encargados, setEncargados] = useState<Encargado[]>([]);
  const [buscar, setBuscar] = useState('');
  const [debouncedBuscar, setDebouncedBuscar] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);
  const [formData, setFormData] = useState<ZonaPayload>(EMPTY_PAYLOAD);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    zonaService.getEncargados().then(setEncargados).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBuscar(buscar), 300);
    return () => clearTimeout(t);
  }, [buscar]);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await zonaService.getAll({ buscar: debouncedBuscar || undefined });
      setZonas(result.data);
      setTotal(result.total);
    } catch {
      setError('No se pudieron cargar las zonas.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedBuscar]);

  useEffect(() => { cargar(); }, [cargar]);

  const openCreate = () => {
    setFormData({ ...EMPTY_PAYLOAD });
    setFormError('');
    setSelectedZona(null);
    setModalMode('create');
  };

  const openEdit = (z: Zona) => {
    setSelectedZona(z);
    setFormData({
      nombre: z.nombre,
      descripcion: z.descripcion ?? '',
      responsable_id: z.responsable_id,
      estatus: z.estatus,
    });
    setFormError('');
    setModalMode('edit');
  };

  const handleDelete = async (z: Zona) => {
    if (!confirm(`¿Eliminar la zona "${z.nombre}"?`)) return;
    try {
      await zonaService.destroy(z.id);
      cargar();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'No se puede eliminar la zona.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      if (modalMode === 'create') {
        await zonaService.create(formData);
      } else if (modalMode === 'edit' && selectedZona) {
        await zonaService.update(selectedZona.id, formData);
      }
      setModalMode(null);
      cargar();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msgs = e?.response?.data?.errors;
      setFormError(msgs ? Object.values(msgs).flat().join(' ') : (e?.response?.data?.message ?? 'Error inesperado.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Gestión de Zonas</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {isLoading ? 'Cargando...' : `${total} zona${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1e4535] text-white rounded-xl font-bold text-sm shadow-md transition-all"
        >
          <Plus size={16} strokeWidth={3} /> Nueva Zona
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text" value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin" />
        </div>
      ) : zonas.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <MapPin size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-700 font-bold">No hay zonas registradas</p>
          <p className="text-slate-500 text-sm mt-1">Crea la primera zona con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zonas.map(z => (
            <div key={z.id} className={`bg-white rounded-3xl border shadow-sm p-5 flex flex-col gap-3 ${z.estatus ? 'border-slate-100' : 'border-slate-200 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2d6a4f]/10 flex items-center justify-center text-[#2d6a4f]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{z.nombre}</h3>
                    <span className={`text-[0.65rem] font-bold ${z.estatus ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {z.estatus ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>

              {z.descripcion && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{z.descripcion}</p>
              )}

              {z.responsable && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-[#52b788] flex items-center justify-center text-white font-bold text-[0.6rem]">
                    {z.responsable.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium truncate">{z.responsable.name}</span>
                </div>
              )}

              {z.tickets_count !== undefined && (
                <p className="text-[0.7rem] font-medium text-slate-400">{z.tickets_count} ticket{z.tickets_count !== 1 ? 's' : ''}</p>
              )}

              <div className="flex gap-2 mt-auto pt-3 border-t border-slate-50">
                <button
                  onClick={() => openEdit(z)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#2d6a4f] bg-[#2d6a4f]/10 hover:bg-[#2d6a4f]/20 rounded-xl transition-colors"
                >
                  <Pencil size={14} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(z)}
                  className="flex items-center justify-center w-9 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setModalMode(null)}>
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {modalMode === 'create' ? 'Nueva Zona' : 'Editar Zona'}
              </h2>
              <button onClick={() => setModalMode(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block">Nombre de la zona *</label>
                <input type="text" value={formData.nombre} onChange={e => setFormData(f => ({ ...f, nombre: e.target.value }))} required
                  placeholder="Ej. Edificio A"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block">Descripción</label>
                <textarea value={formData.descripcion ?? ''} onChange={e => setFormData(f => ({ ...f, descripcion: e.target.value }))} rows={3}
                  placeholder="Descripción opcional..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium resize-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block">Responsable</label>
                <select value={formData.responsable_id ?? ''} onChange={e => setFormData(f => ({ ...f, responsable_id: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#52b788] focus:border-transparent outline-none text-sm font-medium">
                  <option value="">Sin responsable asignado</option>
                  {encargados.map(enc => <option key={enc.id} value={enc.id}>{enc.name}</option>)}
                </select>
              </div>

              {modalMode === 'edit' && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-slate-700">Estado</p>
                    <p className="text-xs text-slate-500">{formData.estatus ? 'Zona activa' : 'Zona inactiva'}</p>
                  </div>
                  <button type="button" onClick={() => setFormData(f => ({ ...f, estatus: !f.estatus }))}>
                    {formData.estatus
                      ? <ToggleRight size={32} className="text-[#52b788]" />
                      : <ToggleLeft size={32} className="text-slate-300" />}
                  </button>
                </div>
              )}
            </form>

            <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50/50 rounded-b-[2rem]">
              <button type="button" onClick={() => setModalMode(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#163d2a] hover:bg-[#1e4535] disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZonasPage;
