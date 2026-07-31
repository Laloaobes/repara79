import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ClipboardCheck } from 'lucide-react';
import ValoracionDetailModal from '../components/authorization/ValoracionDetailModal';
import ValoracionFilters from '../components/authorization/ValoracionFilters';
import ValoracionPendienteCard from '../components/authorization/ValoracionPendienteCard';
import valoracionesService, { ValoracionPendiente } from '../services/valoracionesService';
import ticketsService, { AreaTicket } from '../services/ticketsService';
import { ValoracionPendienteFilters } from '../types/valuation';

const errorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return 'Ocurrió un error inesperado.';

  const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
  const detail = errors && Object.values(errors).flat()[0];

  if (detail) return detail;
  if (error.response?.status === 403) return 'No tienes permisos para procesar esta valoración.';
  if (error.response?.status === 404) return 'La valoración ya no está disponible.';
  if (error.response?.status === 422) return error.response.data?.message || 'La valoración cambió y no puede procesarse.';

  return error.response?.data?.message || 'No fue posible completar la operación.';
};

const ValoracionesPorAprobarPage = () => {
  const [valoraciones, setValoraciones] = useState<ValoracionPendiente[]>([]);
  const [areas, setAreas] = useState<AreaTicket[]>([]);
  const [filters, setFilters] = useState<ValoracionPendienteFilters>({ sort: 'fecha_desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ValoracionPendiente | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const processingLockRef = useRef(false);

  useEffect(() => {
    ticketsService.getCatalogs()
      .then((catalogs) => setAreas(catalogs.areas))
      .catch(() => setError('No fue posible cargar el catálogo de áreas.'));
  }, []);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await valoracionesService.getPendientes(filters);
        if (active) setValoraciones(data);
      } catch (requestError) {
        console.error(requestError);
        if (active) {
          setValoraciones([]);
          setError(errorMessage(requestError));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [filters]);

  const openDetail = async (valoracion: ValoracionPendiente) => {
    setSelectedId(valoracion.id);
    setDetail(null);
    setModalError(null);
    setIsDetailLoading(true);

    try {
      setDetail(await valoracionesService.getDetalle(valoracion.id));
    } catch (requestError) {
      console.error(requestError);
      setModalError(errorMessage(requestError));
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetail = () => {
    if (isProcessing) return;
    setSelectedId(null);
    setDetail(null);
    setModalError(null);
  };

  const processDecision = async (action: 'authorize' | 'reject', reason?: string) => {
    if (!selectedId || processingLockRef.current) return;
    processingLockRef.current = true;
    setIsProcessing(true);
    setModalError(null);
    setSuccess(null);

    try {
      if (action === 'authorize') {
        await valoracionesService.autorizar(selectedId);
        setSuccess('La valoración fue autorizada correctamente.');
      } else {
        await valoracionesService.rechazar(selectedId, reason || '');
        setSuccess('La valoración fue rechazada y quedó disponible para corrección.');
      }

      setValoraciones((current) => current.filter((item) => item.id !== selectedId));
      setSelectedId(null);
      setDetail(null);
    } catch (requestError) {
      console.error(requestError);
      setModalError(errorMessage(requestError));
    } finally {
      processingLockRef.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <ClipboardCheck size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Valoraciones por aprobar</h1>
          <p className="text-sm text-slate-500">{valoraciones.length} pendientes de revisión</p>
        </div>
      </div>

      <ValoracionFilters filters={filters} areas={areas} onChange={setFilters} disabled={isLoading} />

      {success && (
        <p role="status" className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          {success}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-sm font-bold text-slate-500">Cargando valoraciones...</div>
      ) : valoraciones.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
          <h2 className="text-slate-800 font-bold mb-1">No hay valoraciones pendientes</h2>
          <p className="text-slate-500 text-sm">Prueba otros filtros o vuelve más tarde.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {valoraciones.map((valoracion) => (
            <ValoracionPendienteCard
              key={valoracion.id}
              valoracion={valoracion}
              onSelect={openDetail}
            />
          ))}
        </div>
      )}

      <ValoracionDetailModal
        open={selectedId !== null}
        valoracion={detail}
        isLoading={isDetailLoading}
        isProcessing={isProcessing}
        error={modalError}
        onClose={closeDetail}
        onAutorizar={() => processDecision('authorize')}
        onRechazar={(reason) => processDecision('reject', reason)}
      />
    </div>
  );
};

export default ValoracionesPorAprobarPage;
