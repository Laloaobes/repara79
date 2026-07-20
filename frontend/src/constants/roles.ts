/**
 * Roles canónicos definidos en `tipos_usuarios.nombre` (backend).
 * Mantener sincronizado con TiposUsuariosSeeder en el backend.
 */
export const ROLES = {
  RESPONSABLE_DEL_LUGAR: 'Responsable del Lugar',
  PERSONAL_MANTENIMIENTO: 'Personal de Mantenimiento',
  SUBDIRECTOR_ADMINISTRATIVO: 'Subdirector Administrativo',
  USUARIO_REGISTRADO: 'Usuario Registrado',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

