# ÉPICA 12 — Administración del Sistema

## Identificación

- **Estado real:** Implementada parcialmente; existe consulta de usuarios y cambio básico de rol, pero no administración integral.
- **Prioridad:** Alta.
- **Actor funcional:** Subdirector Administrativo.
- **Dependencias funcionales:** Autenticación, roles oficiales y relaciones de área existentes.
- **Épica relacionada:** ÉPICA 11 consume usuarios, roles y asignaciones de área para determinar destinatarios.
- **Enfoque:** Configuración operativa indispensable sin convertir la administración en un módulo excesivo.

## Objetivo

Permitir que el Subdirector Administrativo mantenga cuentas, roles, asignaciones de área y catálogos operativos desde REPARA-79, con controles que protejan el acceso, las relaciones históricas y las reglas utilizadas por el flujo principal.

## Resultado esperado

Al terminar la épica:

1. El Subdirector Administrativo consulta cuentas con búsqueda, filtros y paginación.
2. Puede cambiar el rol o estado activo de otra cuenta bajo reglas de seguridad.
3. Puede asignar una o varias áreas disponibles a cada Responsable del Lugar.
4. Las cuentas inactivas no pueden iniciar sesión ni continuar usando tokens existentes.
5. Puede crear y editar sedes, áreas, tipos de desperfectos y prioridades.
6. Los estados del ticket y roles oficiales se muestran como referencia, pero no se editan.
7. No se permite eliminar información que ya pueda estar relacionada con tickets o reparaciones.
8. ÉPICA 11 utiliza inmediatamente los cambios de usuarios y áreas al seleccionar destinatarios.

## Alcance esencial

- Consulta paginada de usuarios.
- Búsqueda y filtros por rol y estado.
- Cambio de rol.
- Activación y desactivación de cuentas.
- Revocación de tokens al desactivar.
- Protección contra pérdida del último Subdirector Administrativo activo.
- Asignación de varias áreas a un Responsable del Lugar, con un único responsable activo por área.
- Creación y edición de sedes.
- Creación y edición de áreas.
- Creación y edición de tipos de desperfectos.
- Creación y edición de prioridades.
- Consulta de roles y estados como catálogos protegidos.
- Consola administrativa responsive.
- Pruebas de seguridad, integridad y regresión.

## Recortes deliberados por tiempo

- No se crean usuarios desde Administración; el registro existente crea cuentas como `Usuario Registrado`.
- No se administran contraseñas, recuperación de acceso o verificación de correo.
- No se editan nombres ni permisos de `tipos_usuarios`.
- No se crean, renombran, reordenan o eliminan estados de `estados_ticket`.
- No se eliminan sedes, áreas, tipos de desperfectos o prioridades.
- No se agrega soft delete o columna `activo` a todos los catálogos.
- No se implementa bitácora administrativa.
- No se administran plantillas PDF, notificaciones o infraestructura.
- No se incluyen estadísticas o resumen de cantidades; corresponden a ÉPICA 13.
- No se implementa importación o exportación masiva.
- No se permite suplantar usuarios ni restablecer sesiones.

## Decisiones que corrigen la propuesta original

- Pueden existir varios Subdirectores Administrativos activos. ÉPICA 11 notifica a todos.
- Siempre debe permanecer al menos uno activo.
- Un Subdirector Administrativo no puede cambiar su propio rol ni desactivar su propia cuenta.
- Un área solo puede tener un Responsable del Lugar activo.
- Un Responsable del Lugar puede estar asignado a varias áreas.
- Al establecer el rol `Responsable del Lugar` es obligatorio asignar al menos un área disponible.
- `usuario_area` es la fuente oficial de esas asignaciones; no se agrega `responsable_id` a `areas`.
- `estados_ticket` es un catálogo controlado por el flujo y permanece de solo lectura.
- `tipos_usuarios` también permanece de solo lectura para conservar los cuatro nombres oficiales.

## Contraste con la implementación actual

| Capacidad                         | Estado actual       | Pendiente principal                                          |
| :-------------------------------- | :------------------ | :----------------------------------------------------------- |
| Autenticación y registro          | Implementado        | Impedir acceso a cuentas inactivas.                          |
| Listado de usuarios               | Parcial             | Agregar búsqueda, filtros y paginación.                      |
| Consulta de usuario               | Implementado básico | Incluir rol, estado y áreas.                                 |
| Cambio de rol                     | Parcial             | Proteger último Subdirector y limpiar asignaciones inválidas. |
| Activación de cuentas             | No implementado     | Actualizar estado, revocar tokens y aplicar middleware.      |
| Asignación de áreas               | Tabla sin uso       | Crear relaciones, servicio, endpoints e interfaz.            |
| Gestión de sedes                  | No implementado     | Crear API y panel de alta/edición.                            |
| Gestión de áreas                  | No implementado     | Validar sede obligatoria y nombres únicos por sede.           |
| Tipos de desperfectos             | Solo lectura        | Permitir creación y edición segura.                           |
| Prioridades                       | Solo lectura        | Permitir creación y edición con color válido.                 |
| Estados del ticket                | Catálogo sembrado   | Mantener de solo lectura.                                    |
| Interfaz de usuarios              | Parcial             | Agregar estado, filtros, áreas y confirmaciones.              |
| Interfaz de catálogos             | No implementado     | Crear estructura institucional y catálogos operativos.        |
| Pruebas administrativas           | No implementado     | Cubrir permisos, integridad y regresión.                       |

### Evidencia técnica del contraste

- `UserController.php` lista todos los usuarios sin paginación y permite cambiar únicamente el rol.
- `UpdateUserRoleRequest.php` valida los cuatro roles oficiales.
- Backend ya impide cambiar el rol propio.
- Existen rutas administrativas protegidas por `role:Subdirector Administrativo`.
- `GestionUsuariosPage.tsx` muestra usuarios y permite seleccionar un rol.
- La actualización visual del rol es optimista y no solicita confirmación.
- El campo `users.activo` existe, pero `AuthController::login` no lo valida.
- Los tokens existentes no se revocan al desactivar una cuenta.
- `usuario_area` existe con unicidad usuario-área y campo `activo`, pero no tiene implementación funcional.
- `areas.sede_id` es nullable aunque la regla funcional exige una sede.
- No hay controladores o formularios administrativos para los catálogos.

## Catálogos administrables

| Catálogo                | Consultar | Crear | Editar | Eliminar | Regla principal                                  |
| :---------------------- | :-------: | :---: | :----: | :------: | :----------------------------------------------- |
| `sedes`                 | Sí        | Sí    | Sí     | No       | Nombre único y dirección válida.                 |
| `areas`                 | Sí        | Sí    | Sí     | No       | Sede obligatoria y nombre único dentro de ella.  |
| `tipos_desperfectos`    | Sí        | Sí    | Sí     | No       | Nombre único.                                    |
| `prioridades_ticket`    | Sí        | Sí    | Sí     | No       | Nombre único y color permitido.                  |
| `estados_ticket`        | Sí        | No    | No     | No       | Nombres y orden controlados por el flujo.        |
| `tipos_usuarios`        | Sí        | No    | No     | No       | Cuatro roles oficiales inmutables en el MVP.     |

Colores permitidos para prioridades durante el MVP:

- `Verde`
- `Amarillo`
- `Naranja`
- `Rojo`

## Reglas de administración de usuarios

| Operación                         | Regla                                                                                  |
| :-------------------------------- | :------------------------------------------------------------------------------------- |
| Registrar cuenta                  | Se mantiene el registro público controlado; nace como `Usuario Registrado`.            |
| Cambiar rol                       | Solo sobre otra cuenta y usando uno de los cuatro roles oficiales.                     |
| Desactivar                        | No puede ser la propia cuenta ni dejar cero Subdirectores Administrativos activos.     |
| Reactivar                         | No reactiva automáticamente asignaciones de área anteriores.                           |
| Cambiar fuera de Responsable      | Desactiva sus relaciones activas en `usuario_area`.                                    |
| Asignar áreas                     | Solo a Responsables activos, al menos una y sin otro responsable activo.               |
| Eliminar                          | No existe eliminación de usuarios en esta épica.                                       |
| Administrar contraseña            | Fuera del alcance.                                                                     |

La modificación de rol, estado y áreas debe ejecutarse transaccionalmente.

## Integridad del modelo de datos

La épica debe auditar el esquema antes de endurecerlo:

- `users.tipo_usuario_id` debe ser obligatorio para cuentas utilizables.
- La llave foránea de `users.tipo_usuario_id` debe impedir eliminar un rol en uso.
- `areas.sede_id` debe ser obligatorio.
- La llave foránea de `areas.sede_id` debe impedir eliminar una sede en uso.
- `sedes.nombre` debe ser único.
- La combinación `areas(sede_id, nombre)` debe ser única.
- `usuario_area(usuario_id, area_id)` conserva su unicidad actual.
- Un índice único parcial sobre `usuario_area(area_id)` impide más de una asignación activa por área.

Si existen usuarios sin rol, áreas sin sede o nombres duplicados, la migración se detiene y exige corrección explícita. No se reasignan ni eliminan datos silenciosamente.

## Contrato API mínimo

### Usuarios

| Método | Ruta                                      | Finalidad                                      |
| :----- | :---------------------------------------- | :--------------------------------------------- |
| GET    | `/api/admin/usuarios`                     | Listar con búsqueda, rol, estado y paginación. |
| GET    | `/api/admin/usuarios/{usuario}`           | Consultar detalle y áreas asignadas.           |
| PATCH  | `/api/admin/usuarios/{usuario}`           | Cambiar rol o estado activo.                   |
| PUT    | `/api/admin/usuarios/{usuario}/areas`     | Sincronizar asignaciones activas.              |

El endpoint administrativo anterior `/api/usuarios` puede redirigirse o retirarse al actualizar frontend; no deben mantenerse contratos duplicados.

### Configuración

| Método | Ruta                                                | Finalidad                           |
| :----- | :-------------------------------------------------- | :---------------------------------- |
| GET    | `/api/admin/catalogos`                              | Consultar todos los catálogos.      |
| POST   | `/api/admin/sedes`                                  | Crear sede.                         |
| PATCH  | `/api/admin/sedes/{sede}`                           | Editar sede.                        |
| POST   | `/api/admin/areas`                                  | Crear área.                         |
| PATCH  | `/api/admin/areas/{area}`                           | Editar área.                        |
| POST   | `/api/admin/tipos-desperfectos`                     | Crear tipo de desperfecto.          |
| PATCH  | `/api/admin/tipos-desperfectos/{tipoDesperfecto}`   | Editar tipo de desperfecto.         |
| POST   | `/api/admin/prioridades`                             | Crear prioridad.                    |
| PATCH  | `/api/admin/prioridades/{prioridad}`                | Editar prioridad.                   |

No existen rutas `DELETE`.

## Respuestas y paginación

- Usuarios se ordenan por nombre.
- `search` busca nombre, apellidos, correo o nombre de usuario.
- `rol` acepta un nombre oficial.
- `activo` acepta `true` o `false`.
- `per_page` usa 15 por defecto y 50 como máximo.
- Los catálogos se ordenan por nombre, excepto estados que respetan `orden`.
- Errores de validación usan `422`.
- Acceso no autorizado usa `403`.
- Recursos inexistentes usan `404`.

## Orden y dependencias

| HU   | Responsable único          | Depende de                                         |
| :--- | :------------------------- | :------------------------------------------------- |
| HU01 | Tech Lead                  | Autenticación actual y contratos E11               |
| HU02 | Fullstack Backend          | HU01-E12                                           |
| HU03 | Fullstack Backend          | HU01-E12                                           |
| HU04 | Fullstack Frontend/UX-UI   | HU02-E12                                           |
| HU05 | Fullstack Frontend/UX-UI   | HU03-E12                                           |
| HU06 | QA                         | HU02-E12, HU03-E12, HU04-E12 y HU05-E12           |

HU02 y HU03 pueden desarrollarse en paralelo. HU04 y HU05 también pueden avanzar en paralelo con mocks aprobados. QA comienza al integrar ambos bloques.

---

# HU01-E12-Definir contrato de administración segura

## Descripción

**Como** Tech Lead,  
**quiero** definir el alcance, contratos y protecciones de Administración,  
**para** que el equipo mantenga la configuración sin romper permisos, estados o relaciones históricas.

## Prioridad

Muy alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/epica-12-contrato-administracion.md`.
- Confirmar operaciones permitidas y recortes del MVP.
- Definir contratos de usuarios, asignaciones y catálogos.
- Definir invariantes del último Subdirector Administrativo activo.
- Definir tratamiento de tokens y cuentas inactivas.
- Definir reglas al cambiar desde o hacia Responsable del Lugar.
- Definir endurecimiento del esquema y auditoría previa.
- Confirmar catálogos editables y protegidos.
- Definir DTO, paginación, validaciones y errores.
- Documentar regresión requerida para ÉPICA 11.

## Impacto en el modelo de datos

Define ajustes de:

- `users`
- `tipos_usuarios`
- `usuario_area`
- `sedes`
- `areas`
- `tipos_desperfectos`
- `prioridades_ticket`
- `estados_ticket`

No crea tablas administrativas o de auditoría.

## Dependencias

- Roles oficiales sembrados.
- Flujo de autenticación inspeccionado.
- Contrato de destinatarios de ÉPICA 11.
- Esquema PostgreSQL/Supabase actualizado.

## Subtareas

1. **Definir seguridad de cuentas** — Establecer rol propio, último Subdirector, activación, revocación de tokens y middleware de usuario activo.
2. **Definir asignaciones de área** — Confirmar varias áreas por responsable, exclusividad por área, rol requerido, activación del pivote y efectos de cambiar rol.
3. **Delimitar catálogos administrables** — Identificar altas, ediciones, catálogos de solo lectura y prohibición de eliminación.
4. **Formalizar API e integridad** — Documentar rutas, DTO, migraciones, auditorías, paginación, errores y dependencias con ÉPICA 11.

## Criterios de aceptación

1. El contrato enumera operaciones permitidas y excluidas.
2. Utiliza los cuatro nombres oficiales de roles.
3. Permite varios Subdirectores y conserva al menos uno activo.
4. Permite varias áreas por Responsable y un único Responsable activo por área.
5. Estados y roles permanecen de solo lectura.
6. Está definido el comportamiento de una cuenta inactiva y sus tokens.
7. No existen rutas de eliminación.
8. La auditoría previa evita modificaciones silenciosas de datos.
9. Backend y frontend comparten endpoints y DTO.
10. ÉPICA 11 puede recalcular destinatarios con la configuración resultante.

## Definition of Done

1. **Dado que** el esquema y la implementación parcial fueron revisados, **cuando** el equipo consulte el contrato, **entonces** encontrará operaciones, archivos, rutas y validaciones sin ambigüedad.
2. **Dado que** roles y estados controlan seguridad y flujo, **cuando** se revise su administración, **entonces** permanecerán protegidos contra altas, cambios o eliminaciones.
3. **Dado que** una modificación podría bloquear la administración, **cuando** se cambie rol o estado, **entonces** las reglas conservarán al menos un Subdirector Administrativo activo.
4. **Dado que** las asignaciones alimentan ÉPICA 11, **cuando** termine HU01, **entonces** su cardinalidad y efectos sobre destinatarios estarán documentados.

## Reglas de negocio

- Solo usuarios activos con rol `Subdirector Administrativo` acceden a Administración.
- No puede modificar su propio rol o estado.
- Pueden existir varios Subdirectores.
- Estados y roles oficiales son protegidos.
- Los catálogos operativos no se eliminan.
- No se gestionan contraseñas.
- Los cambios sensibles son transaccionales.

## Definition of Ready

- El esquema actual está disponible.
- Las rutas y componentes existentes fueron identificados.
- ÉPICA 11 tiene destinatarios definidos.
- Los recortes del MVP fueron aceptados.

---

# HU02-E12-Administrar cuentas, roles y áreas

## Descripción

**Como** Subdirector Administrativo,  
**quiero** consultar y mantener rol, estado y áreas de las cuentas,  
**para** controlar quién utiliza el sistema y qué Responsables del Lugar reciben información de cada área.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Migración recomendada:
  - `backend/database/migrations/XXXX_XX_XX_XXXXXX_harden_users_for_administration.php`
- Middleware nuevo:
  - `backend/app/Http/Middleware/EnsureUserIsActive.php`
- Requests nuevos:
  - `backend/app/Http/Requests/Admin/IndexUsersRequest.php`
  - `backend/app/Http/Requests/Admin/UpdateManagedUserRequest.php`
  - `backend/app/Http/Requests/Admin/SyncUserAreasRequest.php`
- Controlador a refactorizar:
  - `backend/app/Http/Controllers/Api/UserController.php`
- Modelos a modificar:
  - `backend/app/Models/User.php`
  - `backend/app/Models/Area.php`
- Archivos a modificar:
  - `backend/app/Http/Controllers/Api/AuthController.php`
  - `backend/bootstrap/app.php`
  - `backend/routes/api.php`

Las rutas se agrupan bajo `/api/admin`, `auth:sanctum`, middleware de cuenta activa y `role:Subdirector Administrativo`.

## Impacto en el modelo de datos

- Audita `users.tipo_usuario_id`.
- Lo convierte en obligatorio si los datos son válidos.
- Impide eliminar un rol que tenga usuarios.
- Conserva `usuario_area` y su unicidad.
- No agrega un responsable directo a `areas`.
- No elimina usuarios.

## Dependencias

- HU01-E12-Definir contrato de administración segura.
- Roles oficiales existentes.
- Relaciones de área disponibles.
- Sanctum y tabla de tokens operativos.

## Subtareas

1. **Endurecer roles y relaciones** — Crear migración segura, agregar relaciones `User ↔ Area` y casts o scopes necesarios.
2. **Proteger cuentas inactivas** — Rechazar login inactivo, aplicar middleware a rutas autenticadas y revocar tokens al desactivar.
3. **Implementar listado administrativo** — Agregar búsqueda, filtros, paginación, detalle, rol, estado y áreas con carga anticipada.
4. **Implementar cambios sensibles** — Actualizar rol o estado en transacción, impedir automodificación y proteger al último Subdirector activo.
5. **Sincronizar áreas activas** — Validar Responsable del Lugar, aceptar varios IDs, activar seleccionadas y desactivar las omitidas sin borrar el pivote.
6. **Consolidar rutas y respuestas** — Registrar `/api/admin/usuarios`, retirar contratos duplicados y normalizar errores.

## Criterios de aceptación

1. Solo usuarios activos con rol `Subdirector Administrativo` acceden a las rutas.
2. El listado busca, filtra y pagina sin cargar todas las cuentas.
3. El detalle incluye rol, estado y áreas activas.
4. Una cuenta no modifica su propio rol o estado.
5. Pueden existir varios Subdirectores activos.
6. No se puede desactivar o cambiar de rol al último Subdirector activo.
7. Una cuenta inactiva no inicia sesión.
8. Al desactivar se revocan sus tokens y deja de acceder con tokens anteriores.
9. Solo un Responsable del Lugar activo puede recibir asignaciones.
10. Un Responsable puede tener varias áreas y cada área solo un Responsable activo.
11. Cambiar fuera de Responsable desactiva sus asignaciones.
12. Reactivar o devolver el rol no reactiva áreas automáticamente.
13. Un fallo revierte rol, estado y asignaciones relacionadas.
14. No se exponen contraseña, remember token o tokens Sanctum.

## Definition of Done

1. **Dado que** un Subdirector Administrativo consulta cuentas, **cuando** aplique búsqueda, rol, estado o página, **entonces** recibirá únicamente el resultado solicitado con sus relaciones necesarias.
2. **Dado que** intenta modificar una cuenta, **cuando** la operación afecte su propia identidad o al último Subdirector activo, **entonces** la API la rechazará sin cambios parciales.
3. **Dado que** una cuenta se desactiva, **cuando** intente iniciar o continuar sesión, **entonces** sus credenciales y tokens existentes no permitirán acceso.
4. **Dado que** se asignan áreas a un Responsable del Lugar, **cuando** termine la transacción, **entonces** `usuario_area` reflejará exactamente las asociaciones activas autorizadas.

## Reglas de negocio

- La administración nunca recibe contraseñas.
- Registro crea `Usuario Registrado`.
- Los cuatro roles proceden de `tipos_usuarios`.
- Al menos un Subdirector debe permanecer activo.
- Una cuenta inactiva no usa la API.
- Solo Responsable del Lugar activo tiene áreas activas.
- El rol Responsable del Lugar exige al menos un área, y solo se ofrecen áreas libres o ya asignadas a esa misma cuenta.
- Asignaciones omitidas se desactivan y no se borran.
- Cambios sensibles usan transacción y bloqueo cuando corresponda.

## Definition of Ready

- HU01 está terminada.
- Existen al menos dos cuentas de Subdirector para probar reglas.
- Hay Responsables del Lugar y áreas de prueba.
- La migración fue revisada contra datos actuales.
- Se conoce cómo revocar tokens Sanctum.

---

# HU03-E12-Administrar estructura y catálogos

## Descripción

**Como** Subdirector Administrativo,  
**quiero** crear y editar la estructura institucional y los catálogos operativos,  
**para** mantener disponibles opciones vigentes sin alterar las reglas internas del flujo.

## Prioridad

Alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Migración recomendada:
  - `backend/database/migrations/XXXX_XX_XX_XXXXXX_enforce_institutional_catalog_integrity.php`
- Controlador nuevo:
  - `backend/app/Http/Controllers/Api/Admin/SystemCatalogController.php`
- Requests nuevos:
  - `backend/app/Http/Requests/Admin/SaveSedeRequest.php`
  - `backend/app/Http/Requests/Admin/SaveAreaRequest.php`
  - `backend/app/Http/Requests/Admin/SaveFailureTypeRequest.php`
  - `backend/app/Http/Requests/Admin/SavePriorityRequest.php`
- Modelos existentes:
  - `backend/app/Models/Sede.php`
  - `backend/app/Models/Area.php`
  - `backend/app/Models/TipoDesperfecto.php`
  - `backend/app/Models/PrioridadTicket.php`
  - `backend/app/Models/EstadoTicket.php`
  - `backend/app/Models/TipoUsuario.php`
- Rutas:
  - `backend/routes/api.php`

## Impacto en el modelo de datos

La migración:

- Audita sedes y áreas existentes.
- Hace obligatorio `areas.sede_id`.
- Restringe la eliminación de una sede con áreas.
- Agrega unicidad a `sedes.nombre`.
- Agrega unicidad a `areas(sede_id, nombre)`.

No modifica estados, roles o llaves históricas de tickets.

## Dependencias

- HU01-E12-Definir contrato de administración segura.
- Catálogos sembrados actuales.
- Registros existentes auditados.
- Rutas de consulta de tickets identificadas.

## Subtareas

1. **Endurecer estructura institucional** — Crear migración con auditoría, sede obligatoria, restricciones e índices únicos.
2. **Exponer consulta consolidada** — Devolver sedes/áreas, tipos, prioridades, estados y roles con orden estable.
3. **Implementar sedes y áreas** — Crear y editar con normalización, unicidad, relación obligatoria y errores controlados.
4. **Implementar tipos y prioridades** — Crear y editar nombres, descripciones y colores permitidos sin afectar referencias.
5. **Proteger catálogos del flujo** — No registrar endpoints mutables para estados o roles y no registrar rutas `DELETE`.

## Criterios de aceptación

1. Solo usuarios activos con rol `Subdirector Administrativo` acceden.
2. Cada área pertenece obligatoriamente a una sede.
3. No se duplican nombres de sede.
4. No se duplica un nombre de área dentro de la misma sede.
5. Un nombre de área puede repetirse en sedes distintas.
6. Tipos de desperfectos y prioridades conservan nombres únicos.
7. El color de prioridad pertenece a la lista aprobada.
8. Estados se devuelven por `orden` y son de solo lectura.
9. Roles se devuelven como los cuatro valores oficiales y son de solo lectura.
10. No existe endpoint de eliminación.
11. Editar un catálogo conserva sus relaciones con tickets.
12. La consulta pública de catálogos refleja los cambios sin listas duplicadas en frontend.
13. Datos inválidos reciben `422`.

## Definition of Done

1. **Dado que** el Subdirector Administrativo mantiene sedes o áreas, **cuando** cree o edite un registro válido, **entonces** se conservarán sede obligatoria y unicidad institucional.
2. **Dado que** administra tipos o prioridades, **cuando** guarde cambios válidos, **entonces** las opciones estarán disponibles para tickets sin romper relaciones existentes.
3. **Dado que** estados y roles controlan reglas sensibles, **cuando** se consulte el contrato administrativo, **entonces** solo estarán disponibles como lectura y no existirán rutas para modificarlos.
4. **Dado que** se intenta eliminar un catálogo o enviar datos inválidos, **cuando** la API procese la solicitud, **entonces** rechazará la operación sin cambios parciales.

## Reglas de negocio

- Los textos se recortan antes de validar.
- La unicidad se valida también en base de datos.
- No hay eliminación de catálogos.
- Estados y roles son inmutables en el MVP.
- Área siempre tiene sede.
- Prioridad requiere nombre, color y descripción opcional.
- Tipo de desperfecto requiere nombre y descripción opcional.
- La API pública sigue consultando la base de datos.

## Definition of Ready

- HU01 está terminada.
- Los catálogos actuales están respaldados o reproducibles.
- No existen duplicados o datos huérfanos sin resolver.
- Los colores permitidos fueron aprobados.

---

# HU04-E12-Gestionar cuentas desde la interfaz

## Descripción

**Como** Subdirector Administrativo,  
**quiero** buscar usuarios y administrar su rol, estado y áreas desde una interfaz clara,  
**para** mantener accesos y responsabilidades sin modificar directamente la base de datos.

## Prioridad

Muy alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Página a refactorizar:
  - `frontend/src/modules/users/pages/GestionUsuariosPage.tsx`
- Servicio a refactorizar:
  - `frontend/src/modules/users/services/usersService.ts`
- Tipos nuevos:
  - `frontend/src/modules/users/types/adminUser.ts`
- Componentes nuevos:
  - `frontend/src/modules/users/components/UserFilters.tsx`
  - `frontend/src/modules/users/components/ManageUserModal.tsx`
  - `frontend/src/modules/users/components/AreaAssignmentsField.tsx`
- Archivos a modificar:
  - `frontend/src/App.tsx`
  - `frontend/src/layouts/MainLayout.tsx`
- Ruta definitiva:
  - `/administracion/usuarios`

La ruta anterior `/usuarios` puede redirigir temporalmente a la ruta definitiva.

## Impacto en el modelo de datos

No modifica directamente el esquema. Consume HU02.

## Dependencias

- HU02-E12-Administrar cuentas, roles y áreas.
- Puede comenzar con mocks del contrato HU01.
- Catálogo de áreas disponible.
- Usuario actual disponible en `AuthContext`.

## Subtareas

1. **Refactorizar módulo y navegación** — Actualizar tipos, servicio, ruta protegida y entrada administrativa sin duplicar contratos.
2. **Implementar búsqueda y filtros** — Consultar al servidor por texto, rol, estado y página con estados de carga, vacío y error.
3. **Crear gestión de cuenta** — Mostrar información no sensible, cambiar rol o estado con confirmación y deshabilitar automodificación.
4. **Crear asignación de áreas** — Permitir selección múltiple solo para Responsable del Lugar activo y explicar cuándo se desactivan asociaciones.
5. **Integrar respuestas seguras** — Evitar actualización optimista en cambios sensibles, reflejar servidor y manejar `403`, `404` y `422`.

## Criterios de aceptación

1. Solo usuarios con rol `Subdirector Administrativo` ven el menú y la ruta.
2. La búsqueda y filtros consultan al servidor.
3. El listado muestra nombre, correo, rol, estado y cantidad de áreas.
4. La paginación no descarga todas las cuentas.
5. La cuenta propia muestra controles de rol y estado deshabilitados.
6. Cambiar rol o estado exige confirmación.
7. Los cambios sensibles esperan respuesta del servidor antes de mostrarse como exitosos.
8. Solo Responsable del Lugar activo muestra selector de áreas.
9. El selector admite varias áreas y muestra su sede.
10. Un error conserva un estado visual coherente y explica la restricción.
11. No se muestran contraseña, tokens o acciones de eliminación.
12. La interfaz funciona en móvil y escritorio.

## Definition of Done

1. **Dado que** el Subdirector Administrativo abre la gestión de usuarios, **cuando** busque, filtre o cambie de página, **entonces** verá resultados consistentes con el contrato paginado.
2. **Dado que** selecciona una cuenta ajena, **cuando** confirme rol, estado o áreas válidos, **entonces** la interfaz reflejará únicamente la respuesta confirmada por backend.
3. **Dado que** intenta una acción prohibida o la API la rechaza, **cuando** el frontend procese el resultado, **entonces** conservará los datos previos y mostrará una explicación clara.
4. **Dado que** usa un dispositivo móvil o escritorio, **cuando** administre cuentas, **entonces** los filtros, controles y confirmaciones serán utilizables y accesibles.

## Reglas de negocio

- Frontend no sustituye validaciones backend.
- No usa actualización optimista para rol, estado o áreas.
- La cuenta propia no ofrece controles sensibles.
- Área se asigna solo a Responsable del Lugar activo.
- No se crean usuarios o contraseñas.
- No se eliminan cuentas.
- Los nombres de rol usan constantes oficiales.

## Definition of Ready

- HU02 está disponible o existe mock aprobado.
- Hay cuentas de los cuatro roles.
- Existen varias sedes y áreas de prueba.
- Los mensajes de restricción están definidos.
- El diseño contempla tablas y tarjetas responsive.

---

# HU05-E12-Gestionar catálogos desde la interfaz

## Descripción

**Como** Subdirector Administrativo,  
**quiero** crear y editar sedes, áreas y catálogos operativos desde una consola,  
**para** mantener las opciones institucionales sin alterar estados o roles protegidos.

## Prioridad

Alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Página nueva:
  - `frontend/src/modules/admin/pages/SystemCatalogsPage.tsx`
- Servicio nuevo:
  - `frontend/src/modules/admin/services/systemCatalogsService.ts`
- Tipos nuevos:
  - `frontend/src/modules/admin/types/systemCatalogs.ts`
- Componentes nuevos:
  - `frontend/src/modules/admin/components/InstitutionStructurePanel.tsx`
  - `frontend/src/modules/admin/components/TicketCatalogsPanel.tsx`
  - `frontend/src/modules/admin/components/CatalogFormModal.tsx`
- Archivos a modificar:
  - `frontend/src/App.tsx`
  - `frontend/src/layouts/MainLayout.tsx`
- Ruta:
  - `/administracion/catalogos`

## Impacto en el modelo de datos

No modifica directamente el esquema. Consume HU03.

## Dependencias

- HU03-E12-Administrar estructura y catálogos.
- Puede iniciar con mocks aprobados en HU01.
- Los formularios y límites de cada catálogo están definidos.

## Subtareas

1. **Crear consola de configuración** — Agregar ruta protegida, servicio, tipos y navegación coherente con Gestión de Usuarios.
2. **Gestionar estructura institucional** — Mostrar sedes con áreas y formularios de creación/edición con sede obligatoria.
3. **Gestionar catálogos operativos** — Crear y editar tipos de desperfectos y prioridades con color controlado.
4. **Mostrar catálogos protegidos** — Presentar estados y roles como referencia claramente identificada de solo lectura.
5. **Resolver validación y responsividad** — Mostrar errores por campo, confirmaciones, carga, vacío y diseño móvil/escritorio sin acciones de eliminación.

## Criterios de aceptación

1. Solo usuarios activos con rol `Subdirector Administrativo` acceden.
2. La pantalla distingue estructura, catálogos editables y catálogos protegidos.
3. Crear o editar un área exige seleccionar sede.
4. Las áreas muestran la sede correspondiente.
5. Tipos y prioridades tienen formularios ajustados a sus campos.
6. Prioridad utiliza únicamente colores permitidos.
7. Estados y roles no muestran controles de edición.
8. No existe botón de eliminación.
9. Los errores `422` aparecen junto al campo correspondiente.
10. Una operación exitosa actualiza los datos sin recargar toda la aplicación.
11. Cerrar un formulario con cambios solicita confirmación.
12. La interfaz funciona en móvil y escritorio.

## Definition of Done

1. **Dado que** el Subdirector Administrativo abre la consola, **cuando** cree o edite sedes y áreas válidas, **entonces** verá la estructura actualizada con su relación correcta.
2. **Dado que** administra tipos o prioridades, **cuando** guarde datos válidos, **entonces** la lista reflejará la respuesta del servidor y podrá utilizarse en tickets.
3. **Dado que** consulta estados o roles, **cuando** abra sus secciones, **entonces** se mostrarán como referencia sin acciones mutables.
4. **Dado que** hay errores o cambios sin guardar, **cuando** intente continuar, **entonces** la interfaz informará el problema sin perder datos silenciosamente.

## Reglas de negocio

- No hay eliminación.
- Estados y roles son solo lectura.
- Formularios usan datos del backend.
- Área siempre muestra y envía sede.
- Colores se seleccionan de una lista aprobada.
- No se codifican catálogos operativos duplicados, salvo constantes de presentación aprobadas.
- Las acciones esperan confirmación del servidor.

## Definition of Ready

- HU03 está disponible o existe mock aprobado.
- Los catálogos y colores permitidos están definidos.
- Hay datos institucionales para probar relaciones.
- Los estados de formulario fueron diseñados.

---

# HU06-E12-Validar administración del sistema

## Descripción

**Como** responsable de QA,  
**quiero** validar permisos, cuentas, asignaciones y catálogos administrativos,  
**para** garantizar que la configuración pueda mantenerse sin bloquear usuarios ni romper el flujo principal.

## Prioridad

Muy alta.

## Responsable único

QA.

## Alcance técnico

- Pruebas backend recomendadas:
  - `backend/tests/Feature/AdminUserManagementTest.php`
  - `backend/tests/Feature/AdminAreaAssignmentTest.php`
  - `backend/tests/Feature/AdminCatalogManagementTest.php`
- Evidencia funcional:
  - `docs/evidencias/epica-12/matriz-pruebas.md`
  - `docs/evidencias/epica-12/resultado-pruebas.md`
- Validaciones mínimas:
  - `cd backend && php artisan test`
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

El frontend se valida manualmente porque no dispone actualmente de framework automatizado.

## Impacto en el modelo de datos

Las pruebas verifican:

- `users`
- `personal_access_tokens`
- `tipos_usuarios`
- `usuario_area`
- `sedes`
- `areas`
- `tipos_desperfectos`
- `prioridades_ticket`
- `estados_ticket`
- Regresión de destinatarios de `notifications`.

No modifican el esquema productivo.

## Dependencias

- HU02 a HU05 integradas.
- ÉPICA 11 disponible para regresión de destinatarios.
- Usuarios de los cuatro roles.
- Dos Subdirectores, dos sedes y varias áreas.

## Subtareas

1. **Preparar matriz y datos** — Relacionar criterios con casos de roles, cuentas, áreas, catálogos y restricciones.
2. **Automatizar usuarios y permisos** — Probar acceso, último Subdirector, cuenta propia, activación, tokens, roles y asignaciones múltiples.
3. **Automatizar catálogos e integridad** — Probar altas, ediciones, duplicados, referencias, solo lectura y ausencia de eliminación.
4. **Validar interfaz y regresión** — Probar filtros, formularios, confirmaciones, responsividad, E11, suite, lint y build.

## Criterios de aceptación

1. Cada criterio de HU02 a HU05 tiene al menos un caso.
2. Un rol distinto de Subdirector recibe `403`.
3. Se prueban automodificación y último Subdirector activo.
4. Una cuenta inactiva no inicia ni continúa sesión.
5. Los tokens se revocan al desactivar.
6. Se prueban varias áreas por Responsable y se rechaza un segundo Responsable activo para la misma área.
7. Cambiar el rol desactiva asignaciones correspondientes.
8. ÉPICA 11 selecciona destinatarios según la nueva configuración.
9. Se prueban duplicados y relaciones obligatorias.
10. Estados y roles no tienen rutas mutables.
11. Ningún catálogo o cuenta tiene eliminación en API o interfaz.
12. Se comprueban búsqueda, filtros y paginación.
13. La migración falla de forma segura ante datos incompatibles.
14. Suite backend, lint y build concluyen correctamente.
15. No quedan defectos críticos o altos abiertos.

## Definition of Done

1. **Dado que** usuarios de distintos roles intentan administrar, **cuando** se prueben rutas e interfaz, **entonces** solo quienes estén activos y tengan el rol `Subdirector Administrativo` tendrán acceso.
2. **Dado que** se modifican cuentas o áreas, **cuando** QA valide transacciones y regresión, **entonces** se conservarán acceso administrativo y destinatarios correctos de ÉPICA 11.
3. **Dado que** se crean o editan catálogos, **cuando** se prueben integridad y referencias, **entonces** no existirán duplicados, huérfanos o cambios a estados y roles protegidos.
4. **Dado que** backend y frontend están integrados, **cuando** se ejecuten aceptación, regresión, lint y build, **entonces** no habrá defectos críticos o altos abiertos y quedará evidencia reproducible.

## Reglas de negocio

- QA verifica API, base de datos, tokens y frontend.
- Cada defecto se relaciona con una HU y criterio.
- No se aprueba con defectos críticos o altos.
- Los casos negativos no deben alterar datos.
- Las pruebas restauran cuentas y catálogos.
- La regresión incluye autenticación y notificaciones.

## Definition of Ready

- HU02 a HU05 están integradas.
- El ambiente permite crear y restaurar datos.
- Existen cuentas y asignaciones controladas.
- QA conoce las invariantes administrativas.

---

## Definition of Done de la Épica

1. **Dado que** un Subdirector Administrativo activo abre Administración, **cuando** consulte o filtre usuarios, **entonces** obtendrá información paginada de rol, estado y áreas sin datos sensibles.
2. **Dado que** modifica una cuenta ajena, **cuando** cambie rol, estado o áreas, **entonces** se aplicarán las restricciones, transacciones y revocación de acceso correspondientes.
3. **Dado que** mantiene sedes, áreas, tipos o prioridades, **cuando** cree o edite datos válidos, **entonces** los catálogos se actualizarán sin eliminar relaciones existentes.
4. **Dado que** roles y estados controlan el sistema, **cuando** se consulte la consola, **entonces** permanecerán visibles como referencia y protegidos contra modificación.
5. **Dado que** backend y frontend están integrados, **cuando** QA ejecute seguridad, integridad, regresión, lint y build, **entonces** no habrá defectos críticos o altos abiertos y quedará evidencia reproducible.

## Criterio de cierre

ÉPICA 12 se considera terminada cuando HU01 a HU06 cumplen su Definition of Done y el Subdirector Administrativo puede mantener cuentas, asignaciones y catálogos esenciales sin acceso directo a PostgreSQL ni afectación del flujo E06-E11.
