import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, ChevronDown, Pencil, Users, X } from 'lucide-react';
import usersService, { AdminUser, ManagedArea } from '../services/usersService';
import { useAuth } from '../../auth/context/AuthContext';
import { ROLES, Role } from '../../../constants/roles';

const ROLE_OPTIONS = Object.values(ROLES);

const getErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return 'Ocurrió un error inesperado.';

  const errors = error.response?.data?.errors as Record<string, string[]> | undefined;
  const firstValidationError = errors ? Object.values(errors).flat()[0] : undefined;

  return firstValidationError
    ?? error.response?.data?.message
    ?? 'No fue posible guardar los cambios.';
};

const GestionUsuariosPage = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [areas, setAreas] = useState<ManagedArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftRole, setDraftRole] = useState<Role>(ROLES.USUARIO_REGISTRADO);
  const [draftAreaIds, setDraftAreaIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [usersData, areasData] = await Promise.all([
        usersService.getUsers(),
        usersService.getAreas(),
      ]);
      setUsuarios(usersData);
      setAreas(areasData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No fue posible cargar los usuarios y las áreas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const beginEditing = (usuario: AdminUser) => {
    setEditingId(usuario.id);
    setDraftRole(usuario.rol);
    setDraftAreaIds(usuario.areas.map((area) => area.id));
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftAreaIds([]);
    setError(null);
  };

  const toggleArea = (areaId: number) => {
    setDraftAreaIds((current) => (
      current.includes(areaId)
        ? current.filter((id) => id !== areaId)
        : [...current, areaId]
    ));
  };

  const saveChanges = async (usuario: AdminUser) => {
    if (draftRole === ROLES.RESPONSABLE_DEL_LUGAR && draftAreaIds.length === 0) {
      setError('Debes asignar al menos un área al Responsable del Lugar.');
      return;
    }

    setUpdatingId(usuario.id);
    setError(null);

    try {
      const updated = await usersService.updateUser(usuario.id, {
        rol: draftRole,
        ...(draftRole === ROLES.RESPONSABLE_DEL_LUGAR
          ? { area_ids: draftAreaIds }
          : {}),
      });
      setUsuarios((current) => current.map((user) => (
        user.id === updated.id ? updated : user
      )));
      setAreas(await usersService.getAreas());
      setEditingId(null);
      setDraftAreaIds([]);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm font-bold text-slate-500">Cargando usuarios...</div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500">{usuarios.length} cuentas registradas</p>
        </div>
      </div>

      {error && (
        <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Correo</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const isSelf = usuario.id === currentUser?.id;
                const isUpdating = updatingId === usuario.id;
                const isEditing = editingId === usuario.id;
                const selectableAreas = areas.filter((area) => (
                  area.responsable === null || area.responsable.id === usuario.id
                ));

                return (
                  <tr key={usuario.id} className="border-b border-slate-50 last:border-b-0">
                    <td className="px-6 py-4 align-top font-bold text-slate-800">{usuario.name}</td>
                    <td className="px-6 py-4 align-top text-slate-500">{usuario.email}</td>
                    <td className="px-6 py-4 align-top">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        usuario.activo
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-80">
                      {!isEditing ? (
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-700">{usuario.rol}</p>
                            {usuario.areas.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {usuario.areas.map((area) => (
                                  <span
                                    key={area.id}
                                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                  >
                                    {area.nombre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={isSelf || !usuario.activo || editingId !== null}
                            onClick={() => beginEditing(usuario)}
                            title={
                              isSelf
                                ? 'No puedes cambiar tu propio rol'
                                : !usuario.activo
                                  ? 'Reactiva la cuenta antes de asignar un rol o áreas'
                                  : 'Editar rol y áreas'
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Pencil size={14} /> Editar
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                          <label className="block text-xs font-bold text-slate-600">
                            Rol
                            <select
                              value={draftRole}
                              disabled={isUpdating}
                              onChange={(event) => {
                                const role = event.target.value as Role;
                                setDraftRole(role);
                                if (role !== ROLES.RESPONSABLE_DEL_LUGAR) setDraftAreaIds([]);
                              }}
                              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#52b788]"
                            >
                              {ROLE_OPTIONS.map((rol) => (
                                <option key={rol} value={rol}>{rol}</option>
                              ))}
                            </select>
                          </label>

                          {draftRole === ROLES.RESPONSABLE_DEL_LUGAR && (
                            <div>
                              <p className="mb-1.5 text-xs font-bold text-slate-600">
                                Áreas asignadas <span className="text-red-500">*</span>
                              </p>
                              <details className="group rounded-xl border border-slate-200 bg-white">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-slate-700">
                                  <span>
                                    {draftAreaIds.length > 0
                                      ? `${draftAreaIds.length} área${draftAreaIds.length === 1 ? '' : 's'} seleccionada${draftAreaIds.length === 1 ? '' : 's'}`
                                      : 'Seleccionar áreas disponibles'}
                                  </span>
                                  <ChevronDown size={16} className="transition group-open:rotate-180" />
                                </summary>
                                <div className="max-h-52 space-y-1 overflow-y-auto border-t border-slate-100 p-2">
                                  {selectableAreas.length === 0 ? (
                                    <p className="px-2 py-3 text-xs text-slate-500">
                                      No hay áreas disponibles para asignar.
                                    </p>
                                  ) : selectableAreas.map((area) => (
                                    <label
                                      key={area.id}
                                      className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 hover:bg-slate-50"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={draftAreaIds.includes(area.id)}
                                        onChange={() => toggleArea(area.id)}
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <span>
                                        <span className="block text-sm font-semibold text-slate-700">{area.nombre}</span>
                                        {(area.sede?.nombre || area.ubicacion) && (
                                          <span className="block text-xs text-slate-500">
                                            {[area.sede?.nombre, area.ubicacion].filter(Boolean).join(' · ')}
                                          </span>
                                        )}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </details>
                              {draftAreaIds.length === 0 && (
                                <p className="mt-1.5 text-xs font-medium text-amber-700">
                                  Este rol requiere al menos un área.
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={cancelEditing}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white disabled:opacity-50"
                            >
                              <X size={14} /> Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating || (
                                draftRole === ROLES.RESPONSABLE_DEL_LUGAR
                                && draftAreaIds.length === 0
                              )}
                              onClick={() => saveChanges(usuario)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Check size={14} /> {isUpdating ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuariosPage;
