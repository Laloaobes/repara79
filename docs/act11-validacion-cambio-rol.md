# ACT-11 Validacion final del cambio de rol administrativo

## Cambio validado

Se valido el retorno del flujo administrativo desde el rol generico `Administrador`
hacia el rol institucional `Subdirector Administrativo`.

El objetivo del cambio fue asegurar que las funciones administrativas del sistema
quedaran asociadas al cargo real usado por REPARA-79, sin mantener
`Administrador` como rol funcional activo.

## Alcance revisado

Se revisaron las capas que participan en el control del rol administrativo:

- Catalogo y seeders de tipos de usuario.
- Usuario administrativo de prueba `admin@repara79.com`.
- Validacion de cambio de rol en backend.
- Rutas administrativas protegidas por middleware.
- Permisos de consulta de tickets por rol.
- Constantes, rutas protegidas, menu y dashboard del frontend.

## Resultado esperado

Los roles funcionales del sistema deben quedar limitados a:

- `Subdirector Administrativo`
- `Personal de Mantenimiento`
- `Responsable del Lugar`
- `Usuario Registrado`

El rol `Administrador` no debe aparecer como rol funcional en seeders,
controladores, rutas, validaciones o guards del frontend.

## Archivos funcionales validados

Backend:

- `backend/database/seeders/TiposUsuariosSeeder.php`
- `backend/database/seeders/UsuarioSubdirectorSeeder.php`
- `backend/app/Http/Requests/UpdateUserRoleRequest.php`
- `backend/app/Http/Controllers/Api/TicketController.php`
- `backend/routes/api.php`

Frontend:

- `frontend/src/constants/roles.ts`
- `frontend/src/App.tsx`
- `frontend/src/layouts/MainLayout.tsx`
- `frontend/src/modules/dashboard/pages/DashboardPage.tsx`

## Comandos de validacion

```bash
rg "Administrador|ADMINISTRADOR" backend frontend
rg "Subdirector Administrativo|SUBDIRECTOR_ADMINISTRATIVO" backend frontend
php artisan route:list --path=api
cd frontend
npm run lint
npm run build
```

## Interpretacion de referencias restantes

Despues de aplicar las correcciones, pueden quedar referencias a
`Administrador` en migraciones historicas. Esas referencias no representan un
rol funcional activo; se conservan porque forman parte de migraciones que
normalizan o trasladan datos anteriores hacia `Subdirector Administrativo`.

Ejemplos aceptables:

- Migraciones que buscan usuarios con tipo `Administrador`.
- Migraciones que reasignan esos usuarios a `Subdirector Administrativo`.

No deben existir referencias funcionales a `Administrador` en:

- Seeders activos.
- Controladores.
- Requests de validacion.
- Rutas protegidas.
- Constantes de roles del frontend.
- Guards o menus del frontend.

## Checklist manual

- Iniciar sesion como `Subdirector Administrativo`.
- Confirmar que el dashboard se muestra como dashboard general.
- Confirmar que el menu muestra `Gestion de Usuarios`.
- Confirmar que el menu muestra `Valoraciones por Aprobar`.
- Confirmar que el usuario administrativo no depende del rol `Administrador`.
- Confirmar que `Personal de Mantenimiento` conserva sus vistas de tickets y valoraciones.
- Confirmar que `Responsable del Lugar` y `Usuario Registrado` siguen pudiendo reportar desperfectos.

## Conclusion

La validacion final confirma que el sistema vuelve a quedar alineado con el
modelo institucional esperado: `Subdirector Administrativo` es el rol que
concentra las funciones administrativas, mientras que `Administrador` deja de
ser un rol funcional activo del proyecto.
