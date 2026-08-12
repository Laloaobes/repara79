# ÉPICA 11 — Sistema de Notificaciones Internas

## Identificación

- **Estado real:** Implementación funcional del MVP disponible con persistencia, REST, Reverb/Echo y eventos del flujo de valoración y reparación.
- **Prioridad:** Muy alta.
- **Actores funcionales:** Subdirector Administrativo, Responsable del Lugar y Personal de Mantenimiento.
- **Dependencia principal:** ÉPICA 10 — Bitácora de Mantenimiento / Archivero Digital de Reparaciones Exitosas.
- **Dependencia de despliegue:** ÉPICA 15 debe operar Reverb, el worker de colas y el proxy WebSocket.
- **Enfoque:** Persistencia local obligatoria con actualización inmediata complementaria.

## Objetivo

Notificar dentro de REPARA-79 los cambios relevantes del flujo de valoración y la finalización exitosa de una reparación, para que cada destinatario navegue al módulo autorizado sin depender de correo o servicios externos.

## Resultado esperado

Al terminar la épica, el sistema debe cubrir este flujo:

1. ÉPICAS 08 a 10 confirman la reparación, el PDF y `bitacoras_reparacion`.
2. Después del commit, el backend emite el evento interno `reparacion_finalizada`.
3. El backend obtiene destinatarios activos desde roles y `usuario_area`.
4. Laravel crea una notificación persistente individual para cada destinatario.
5. El canal broadcast encola la actualización destinada al canal privado de cada usuario.
6. Reverb la entrega a los usuarios conectados y la campana se actualiza sin recargar.
7. Si Reverb o el worker no están disponibles, la notificación permanece en PostgreSQL y se recupera mediante REST.
8. Al seleccionar el aviso, se marca como leído y se navega al detalle autorizado del Archivero.
9. Personal de Mantenimiento recibe el resultado de autorización o rechazo de su propia valoración.
10. Los Subdirectores Administrativos activos reciben el aviso de una valoración rechazada que fue corregida y reenviada.

Una falla de transmisión en tiempo real nunca revierte la reparación, el PDF, la bitácora ni la notificación ya persistida.

## Alcance esencial

- Tabla estándar `notifications` de Laravel con `data` en JSONB.
- Retiro controlado de la tabla heredada `notificaciones`.
- Eventos `reparacion_finalizada`, `valoracion_autorizada`, `valoracion_rechazada` y `valoracion_corregida`.
- Selección automática de destinatarios.
- Persistencia posterior al commit.
- Consulta paginada de notificaciones propias.
- Conteo de no leídas.
- Marcado individual y global como leído.
- Campana y panel responsive en React.
- Laravel Reverb y Echo mediante canales privados.
- Recuperación REST cuando el tiempo real no esté disponible.
- Pruebas de destinatarios, propiedad, lectura, canales y regresión.

## Fuera de alcance

- Correos mediante Resend, Gmail o SMTP.
- SMS, push móvil o notificaciones del sistema operativo.
- Pusher como servicio externo, Ably o Firebase.
- Redacción o envío manual de notificaciones.
- Preferencias por usuario, silenciamiento, sonidos o horarios.
- Notificaciones sobre eventos distintos de los cuatro eventos oficiales del MVP.
- Página histórica independiente de notificaciones; el panel muestra las más recientes.
- Eliminación manual de notificaciones.
- Reintentos administrables desde la interfaz.
- Plantillas configurables desde Administración.

La arquitectura nativa de Laravel permite incorporar otros canales en una versión posterior, pero el MVP no incluye tareas, credenciales o configuración de correo.

## Contraste con la implementación actual

| Capacidad                         | Estado actual       | Pendiente principal                                          |
| :-------------------------------- | :------------------ | :----------------------------------------------------------- |
| Trait `Notifiable`                | Implementado        | Conservarlo en `User`.                                       |
| Tabla estándar `notifications`    | No implementado     | Crear UUID, morphs, JSONB, lectura y fechas.                 |
| Tabla heredada `notificaciones`   | Estructura sin uso  | Auditar y retirar sin perder datos.                           |
| Evento de cierre                  | No implementado     | Emitir únicamente después del commit de ÉPICA 10.            |
| Selección de destinatarios        | No implementado     | Consultar roles, usuarios activos y áreas activas.            |
| API de notificaciones             | No implementado     | Consultar propias y actualizar lectura.                       |
| Campana frontend                  | Cascarón visual     | Agregar contador, panel, datos, navegación y estados.         |
| Laravel Reverb                    | No instalado        | Instalar, configurar y ejecutar servidor local.               |
| Laravel Echo                      | No instalado        | Configurar cliente y autorización con token Sanctum.          |
| Canales privados                  | No implementado     | Crear `routes/channels.php` y autenticación protegida.         |
| Recuperación REST                 | No implementado     | Cargar al iniciar, abrir y reconectar.                         |
| Pruebas específicas               | No implementado     | Validar persistencia, aislamiento, broadcast y degradación.    |

### Evidencia técnica del contraste

- `backend/app/Models/User.php` ya utiliza `Notifiable`.
- `backend/database/migrations/2026_07_05_000000_create_valoraciones_table.php` crea la tabla heredada `notificaciones`.
- No existe una migración estándar `notifications`.
- `backend/composer.json` no incluye `laravel/reverb`.
- `frontend/package.json` no incluye `laravel-echo` ni `pusher-js`.
- `backend/routes/channels.php` no existe.
- `backend/bootstrap/app.php` no registra rutas de broadcasting con `auth:sanctum`.
- `backend/.env.example` utiliza `BROADCAST_CONNECTION=log`.
- `frontend/src/layouts/MainLayout.tsx` muestra el icono `Bell`, pero no renderiza panel, contador o datos.
- La autenticación actual utiliza tokens Sanctum enviados como `Bearer` mediante `frontend/src/api/axios.ts`.

## Evento inicial del MVP

Además del evento inicial de cierre, la ampliación acordada incorpora:

| Evento                         | Destinatarios                                                                  | Navegación                         |
| :----------------------------- | :----------------------------------------------------------------------------- | :--------------------------------- |
| `valoracion_autorizada`        | Personal de Mantenimiento activo que elaboró la valoración.                    | `/mis-valoraciones`                |
| `valoracion_rechazada`         | Personal de Mantenimiento activo que elaboró la valoración.                    | `/mis-valoraciones`                |
| `valoracion_corregida`         | Todos los Subdirectores Administrativos activos.                               | `/valoraciones-por-aprobar`        |
| `reparacion_finalizada`        | Subdirectores activos y Responsable activo asignado al área de la reparación.  | Detalle autorizado del Archivero.  |

Todos se persisten después de la transición válida, usan una clave idempotente por evento y ciclo de revisión, y toleran una falla de broadcast sin revertir el flujo principal.

### Condición de emisión

`reparacion_finalizada` se emite una sola vez y únicamente cuando:

- La reparación fue validada.
- El ticket quedó `Reparado`.
- El PDF existe en la ruta oficial.
- La entrada de `bitacoras_reparacion` fue creada.
- La transacción E08–E10 fue confirmada.

La emisión se programa mediante un mecanismo posterior al commit. Un reintento idempotente que devuelve una bitácora existente no vuelve a notificar.

### Destinatarios

| Destinatario                    | Regla de selección                                                                           |
| :------------------------------ | :------------------------------------------------------------------------------------------- |
| Subdirector Administrativo      | Todos los usuarios activos, no eliminados, con ese rol.                                      |
| Responsable del Lugar           | Usuarios activos, no eliminados, con ese rol y `usuario_area.activo = true` para el área.    |
| Personal de Mantenimiento       | No recibe el aviso originado por su propia finalización durante el MVP.                       |
| Usuario Registrado              | No recibe este evento.                                                                        |

La consulta se realiza en backend, elimina destinatarios duplicados y excluye expresamente `bitacoras_reparacion.generado_por`.

## Datos de `notifications.data`

```json
{
  "tipo": "reparacion_finalizada",
  "event_key": "reparacion_finalizada:40",
  "titulo": "Reparación finalizada",
  "mensaje": "La reparación del Ticket #125 fue finalizada exitosamente.",
  "ticket_id": 125,
  "bitacora_id": 40,
  "generado_por": 7,
  "url": "/archivero-reparaciones/40"
}
```

Reglas del payload:

- `event_key` utiliza el ID de bitácora y permite detectar reintentos.
- `url` es una ruta interna del frontend, no una URL absoluta.
- La URL no concede permisos; el Archivero vuelve a autorizar el recurso.
- No se guardan nombres, correos, roles, rutas físicas o contenido del PDF.
- `data.tipo` es el discriminador estable para frontend.

## Modelo de datos

La tabla activa debe contener:

| Campo               | Tipo PostgreSQL              | Regla                                     |
| :------------------ | :--------------------------- | :---------------------------------------- |
| `id`                | UUID                         | Llave primaria.                           |
| `type`              | VARCHAR                      | Clase Laravel de la notificación.         |
| `notifiable_type`   | VARCHAR                      | Tipo polimórfico, actualmente `User`.     |
| `notifiable_id`     | BIGINT                       | Usuario receptor.                         |
| `data`              | JSONB                        | Payload funcional del evento.             |
| `read_at`           | TIMESTAMP nullable           | Fecha de lectura.                         |
| `created_at`        | TIMESTAMP nullable           | Fecha de creación.                        |
| `updated_at`        | TIMESTAMP nullable           | Fecha de actualización.                   |

Debe existir el índice polimórfico sobre `notifiable_type` y `notifiable_id`.

La tabla heredada `notificaciones` no se reutiliza. Antes de retirarla:

1. Se verifica si contiene filas.
2. Si está vacía, la migración puede eliminarla.
3. Si contiene datos, la migración se detiene y exige respaldo o decisión explícita.
4. Nunca se borran registros heredados silenciosamente.

## Contrato REST mínimo

| Método | Ruta                                           | Finalidad                                         |
| :----- | :--------------------------------------------- | :------------------------------------------------ |
| GET    | `/api/notifications`                           | Consultar notificaciones propias y conteo.        |
| PATCH  | `/api/notifications/{notification}/read`       | Marcar una notificación propia como leída.        |
| PATCH  | `/api/notifications/read-all`                  | Marcar todas las notificaciones propias como leídas. |

### Listado

- Orden: `created_at DESC`.
- `per_page`: predeterminado 10 y máximo 50.
- Devuelve paginación y `unread_count`.
- Solo consulta `$request->user()->notifications()`.
- No acepta IDs de usuario como filtro.

### Lectura

- Marcar como leída es idempotente.
- Si ya tiene `read_at`, conserva la primera fecha.
- Una notificación ajena responde `404` para no revelar su existencia.
- `read-all` actualiza únicamente las no leídas del usuario autenticado.

No existe endpoint de eliminación.

## Arquitectura de tiempo real

```text
Commit E08-E10
      ↓
Evento funcional confirmado
      ↓
Selección de destinatarios
      ↓
Notificación Laravel
      ├── database ──→ PostgreSQL ──→ API REST
      └── broadcast ─→ cola ─→ Reverb ─→ canal privado
                                             ↓
                                      Laravel Echo
                                             ↓
                                  Campana de React
```

### Canal privado

- Convención: `App.Models.User.{id}`.
- El callback autoriza únicamente cuando el usuario autenticado coincide con `{id}`.
- La ruta de autorización se registra bajo:
  - `POST /api/broadcasting/auth`
  - Middleware `api` y `auth:sanctum`.
- Echo utiliza el `apiClient` actual como authorizer para enviar el token Bearer.

### Dependencias y procesos

- Backend:
  - `laravel/reverb`
- Frontend:
  - `laravel-echo`
  - `pusher-js`

`pusher-js` se usa únicamente como cliente del protocolo compatible con Reverb; no implica contratar o configurar Pusher Channels.

Procesos locales:

- Laravel API.
- Worker de colas.
- Servidor `php artisan reverb:start`.
- React/Vite.

Variables backend:

- `BROADCAST_CONNECTION`
- `REVERB_APP_ID`
- `REVERB_APP_KEY`
- `REVERB_APP_SECRET`
- `REVERB_SERVER_HOST`
- `REVERB_SERVER_PORT`
- `REVERB_HOST`
- `REVERB_PORT`
- `REVERB_SCHEME`

Variables frontend:

- `VITE_REVERB_APP_KEY`
- `VITE_REVERB_HOST`
- `VITE_REVERB_PORT`
- `VITE_REVERB_SCHEME`

`REVERB_SERVER_HOST` y `REVERB_SERVER_PORT` indican dónde escucha el proceso Reverb; `REVERB_HOST` y `REVERB_PORT` indican dónde Laravel entrega los broadcasts.

## Degradación controlada

- El canal `database` persiste la notificación inmediatamente después del commit.
- El broadcast se procesa mediante la cola.
- Si Reverb falla, la fila de `notifications` permanece disponible.
- La campana consulta REST al iniciar sesión, al montarse y al recuperar una conexión.
- No se implementa polling continuo en el MVP.
- Una falla WebSocket puede registrarse en consola sin bloquear el resto de la interfaz.
- La ausencia de Reverb no modifica el resultado ya confirmado de la reparación.

## Orden y dependencias

| HU   | Responsable único          | Depende de                                      |
| :--- | :------------------------- | :---------------------------------------------- |
| HU01 | Tech Lead                  | Contrato y cierre confirmado de ÉPICA 10        |
| HU02 | Fullstack Backend          | HU01-E11 y HU02-E10                             |
| HU03 | Fullstack Backend          | HU02-E11                                        |
| HU04 | Fullstack Frontend/UX-UI   | HU02-E11 y contrato de HU03-E11                 |
| HU05 | QA                         | HU02-E11, HU03-E11 y HU04-E11                   |

HU02 entrega primero un sistema funcional mediante REST. HU03 añade tiempo real sin cambiar el contrato persistente. HU04 puede comenzar la campana con mocks de HU01, pero solo termina al integrar ambos canales.

---

# HU01-E11-Definir contrato de notificaciones internas

## Descripción

**Como** Tech Lead,  
**quiero** definir el contrato funcional, persistente y de tiempo real de las notificaciones,  
**para** que backend, frontend y QA implementen el cierre del flujo sin depender de servicios externos.

## Prioridad

Muy alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/epica-11-contrato-notificaciones.md`.
- Confirmar los cuatro eventos oficiales del MVP y sus destinatarios.
- Definir condición posterior al commit e idempotencia.
- Definir destinatarios, exclusiones y datos activos.
- Aprobar el esquema estándar con `data` JSONB.
- Definir retiro seguro de `notificaciones`.
- Definir endpoints, DTO, paginación y errores.
- Definir canal privado, autenticación Sanctum y payload broadcast.
- Definir degradación REST y procesos requeridos.
- Documentar variables de entorno para desarrollo y ÉPICA 15.

## Impacto en el modelo de datos

Define:

- Nueva tabla `notifications`.
- Retiro condicionado de `notificaciones`.
- Uso de `users`, `tipos_usuarios` y `usuario_area` para destinatarios.
- Uso de `bitacoras_reparacion` como fuente del evento.

No agrega llaves específicas como `ticket_id` o `bitacora_id` a la tabla estándar.

## Dependencias

- HU01-E10-Definir contrato del Archivero Digital.
- Flujo E08-E10 y punto posterior al commit documentados.
- Autenticación Sanctum actual identificada.
- Roles oficiales y relaciones de área confirmados.

## Subtareas

1. **Definir evento y destinatarios** — Documentar condición de emisión, usuarios activos, áreas activas, exclusiones, deduplicación y `event_key`.
2. **Definir persistencia y REST** — Especificar migración JSONB, retiro heredado, endpoints, DTO, propiedad, lectura y paginación.
3. **Definir Reverb y seguridad** — Establecer dependencias, canal privado, autorización Sanctum, variables y comportamiento ante desconexión.
4. **Formalizar integración y operación** — Delimitar responsabilidades E10-E11-E15, procesos locales, pruebas y criterio posterior al commit.

## Criterios de aceptación

1. El contrato identifica los cuatro eventos y su condición posterior a cada transición confirmada.
2. Los destinatarios y exclusiones utilizan nombres oficiales de roles.
3. El payload JSON y la URL coinciden con las rutas de ÉPICA 10.
4. El esquema utiliza `notifications.data` JSONB sin columnas funcionales adicionales.
5. Está definido cómo auditar y retirar `notificaciones`.
6. Los endpoints solo operan sobre el usuario autenticado.
7. El canal privado y su autenticación Bearer están documentados.
8. La persistencia continúa disponible si Reverb falla.
9. El contrato identifica los procesos que deberá desplegar ÉPICA 15.
10. Correo y proveedores externos quedan expresamente fuera del MVP.

## Definition of Done

1. **Dado que** el flujo confirmó una valoración o reparación, **cuando** el equipo consulte el contrato, **entonces** encontrará la condición, destinatarios y payload exactos del evento correspondiente.
2. **Dado que** las notificaciones deben sobrevivir a una desconexión, **cuando** se revise la arquitectura, **entonces** la persistencia REST será obligatoria y Reverb será complementario.
3. **Dado que** los canales son privados, **cuando** backend y frontend implementen el contrato, **entonces** la autorización verificará que el canal pertenezca al usuario autenticado.
4. **Dado que** existe una tabla heredada, **cuando** se prepare la migración, **entonces** no podrá eliminar datos sin auditoría y decisión explícita.

## Reglas de negocio

- Solo el sistema genera notificaciones.
- El evento se procesa después del commit.
- Un reintento idempotente no vuelve a notificar.
- Cada destinatario recibe su propia fila.
- La URL no concede permisos.
- `data.tipo` identifica el comportamiento frontend.
- No se configura correo.
- Reverb no sustituye PostgreSQL.

## Definition of Ready

- ÉPICA 10 tiene contrato aprobado.
- La tabla heredada fue identificada.
- Se conocen el método de autenticación y rutas frontend.
- Los procesos disponibles en el servidor objetivo están documentados.

---

# HU02-E11-Persistir y consultar notificaciones

## Descripción

**Como** usuario destinatario,  
**quiero** que los avisos se guarden y poder consultar o actualizar únicamente los míos,  
**para** mantenerme informado aunque no estuviera conectado al ocurrir el evento.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Migración nueva:
  - `backend/database/migrations/XXXX_XX_XX_XXXXXX_create_notifications_table.php`
- Migración condicionada:
  - `backend/database/migrations/XXXX_XX_XX_XXXXXX_retire_legacy_notificaciones_table.php`
- Evento:
  - `backend/app/Events/RepairFinished.php`
- Listener:
  - `backend/app/Listeners/SendRepairFinishedNotifications.php`
- Notificación:
  - `backend/app/Notifications/RepairFinishedNotification.php`
- Controlador:
  - `backend/app/Http/Controllers/Api/NotificationController.php`
- Request recomendado:
  - `backend/app/Http/Requests/IndexNotificationsRequest.php`
- Servicio a integrar:
  - `backend/app/Services/RepairService.php`
- Rutas:
  - `backend/routes/api.php`

La notificación usa inicialmente `database`. HU03 incorpora `broadcast` sin alterar el payload.

## Impacto en el modelo de datos

- Crea `notifications` con UUID, morphs, `data` JSONB, `read_at` y timestamps.
- Conserva el trait `Notifiable` ya presente.
- Retira `notificaciones` solo después de comprobar que no contenga información pendiente.
- No agrega columnas específicas del evento.

Consulta:

- `bitacoras_reparacion`
- `reparaciones`
- `tickets`
- `users`
- `tipos_usuarios`
- `usuario_area`

## Dependencias

- HU01-E11-Definir contrato de notificaciones internas.
- HU02-E10-Implementar archivado automático y API.
- Relaciones `User ↔ Area` disponibles.
- Datos activos y soft deletes considerados.

## Subtareas

1. **Preparar persistencia estándar** — Crear la tabla JSONB, verificar índices, conservar `Notifiable` y retirar de forma condicionada la tabla heredada.
2. **Implementar evento posterior al commit** — Emitir `RepairFinished` solo cuando se cree por primera vez el cierre íntegro E08-E10.
3. **Seleccionar destinatarios** — Consultar Subdirector Administrativo y Responsable del Lugar activos, aplicar áreas activas, excluir al originador y deduplicar.
4. **Crear notificación persistente** — Generar payload y `event_key`, guardar una fila por destinatario e impedir duplicaciones en reintentos.
5. **Implementar consulta propia** — Devolver página reciente, fechas, datos, lectura y `unread_count` sin aceptar filtros de usuario.
6. **Implementar marcado de lectura** — Resolver la notificación desde la relación del usuario y marcar una o todas de manera idempotente.
7. **Integrar valoraciones** — Avisar al autor tras autorizar o rechazar y a los Subdirectores tras corregir y reenviar.

## Criterios de aceptación

1. La tabla estándar utiliza JSONB y el identificador UUID esperado por Laravel.
2. Ningún dato heredado se elimina silenciosamente.
3. El evento solo se emite después del commit exitoso de ÉPICA 10.
4. Todos los Subdirectores Administrativos activos reciben una fila.
5. Solo los Responsables del Lugar activos asociados al área reciben una fila.
6. Personal de Mantenimiento originador y Usuario Registrado no reciben el evento.
7. Un destinatario aparece una sola vez.
8. Cada fila contiene exactamente los datos mínimos y la URL del Archivero.
9. Un reintento del cierre no duplica notificaciones.
10. `GET /api/notifications` devuelve únicamente datos propios, ordenados y paginados.
11. El listado incluye el conteo actualizado de no leídas.
12. Marcar una notificación propia o todas actualiza `read_at`.
13. Una notificación ajena responde `404` y no cambia.
14. No existe endpoint para enviar o eliminar notificaciones.
15. Personal de Mantenimiento recibe únicamente las decisiones sobre sus propias valoraciones.
16. Todos los Subdirectores activos reciben las valoraciones corregidas y reenviadas.

## Definition of Done

1. **Dado que** ÉPICA 10 confirmó por primera vez un cierre íntegro, **cuando** se procese `RepairFinished`, **entonces** cada destinatario válido tendrá una notificación persistente única.
2. **Dado que** un usuario autenticado consulta o marca notificaciones, **cuando** la API procese la solicitud, **entonces** solo leerá o modificará registros pertenecientes a ese usuario.
3. **Dado que** el cierre se reintenta o un destinatario coincide por más de una relación, **cuando** se resuelva el evento, **entonces** no se crearán filas duplicadas.
4. **Dado que** la tabla heredada contiene información, **cuando** se ejecute su retiro, **entonces** la migración se detendrá sin borrar los registros.

## Reglas de negocio

- Solo usuarios activos y no eliminados reciben avisos.
- `usuario_area.activo` debe ser verdadero.
- Se excluye `bitacoras_reparacion.generado_por`.
- La persistencia sucede después del commit.
- El backend genera el payload completo.
- `read_at` conserva la primera lectura.
- Las consultas parten de la relación `notifications()` del usuario.
- La URL interna no evita la política del Archivero.

## Definition of Ready

- HU01 está terminada.
- ÉPICA 10 puede producir una bitácora.
- La tabla heredada fue auditada en el ambiente objetivo.
- Existen usuarios activos e inactivos de los roles requeridos.
- Existen relaciones de área activas e inactivas.

---

# HU03-E11-Transmitir notificaciones con Reverb

## Descripción

**Como** usuario conectado,  
**quiero** recibir inmediatamente mis notificaciones persistidas,  
**para** conocer una reparación finalizada sin recargar la aplicación.

## Prioridad

Alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Dependencia backend:
  - `laravel/reverb`
- Configuración nueva o publicada:
  - `backend/config/broadcasting.php`
  - `backend/config/reverb.php`
- Canal nuevo:
  - `backend/routes/channels.php`
- Archivos a modificar:
  - `backend/bootstrap/app.php`
  - `backend/.env.example`
  - `backend/app/Notifications/RepairFinishedNotification.php`
- Autorización:
  - `POST /api/broadcasting/auth`
  - Middleware `api`, `auth:sanctum`
- Canal:
  - `App.Models.User.{id}` mediante una suscripción privada de Echo.

La notificación incorpora `broadcast` además de `database`. No implementa correo.

## Impacto en el modelo de datos

No agrega tablas funcionales. Utiliza la infraestructura de colas ya definida por Laravel para transmitir el broadcast.

La fila de `notifications` debe persistirse aunque la transmisión falle.

## Dependencias

- HU02-E11-Persistir y consultar notificaciones.
- Worker de colas disponible.
- Puertos locales para Reverb definidos.
- Token Sanctum aceptado en la ruta de autorización.

## Subtareas

1. **Instalar y configurar Reverb** — Agregar el paquete, publicar configuración, documentar variables y establecer `BROADCAST_CONNECTION=reverb`.
2. **Registrar broadcasting con Sanctum** — Crear `channels.php`, usar `withBroadcasting` con prefijo `api` y proteger la autorización.
3. **Proteger canal por usuario** — Autorizar `App.Models.User.{id}` únicamente cuando el ID coincida con el usuario autenticado.
4. **Agregar canal broadcast** — Emitir el mismo contrato funcional después de persistir y procesarlo mediante la cola.
5. **Verificar degradación y operación** — Comprobar REST con Reverb detenido y documentar API, worker y Reverb para desarrollo y despliegue.

## Criterios de aceptación

1. Reverb funciona localmente sin credenciales de servicios externos.
2. `BROADCAST_CONNECTION` utiliza `reverb`.
3. La autorización privada utiliza `auth:sanctum`.
4. Un usuario solo puede suscribirse a su propio canal.
5. Una solicitud sin token o con ID ajeno es rechazada.
6. La notificación usa `database` y `broadcast`.
7. El broadcast contiene el mismo ID y datos necesarios para deduplicar.
8. El trabajo de broadcast se procesa mediante el worker.
9. Detener Reverb no elimina ni impide consultar la fila persistida.
10. Reiniciar la conexión permite recuperar el estado mediante REST.
11. No se configuran Pusher Channels, Resend ni correo.
12. `.env.example` documenta variables sin incluir secretos reales.

## Definition of Done

1. **Dado que** un destinatario está conectado a su canal privado, **cuando** se persista una nueva notificación, **entonces** Reverb transmitirá el aviso al usuario correcto mediante la cola.
2. **Dado que** un usuario intenta autorizar un canal ajeno, **cuando** Sanctum y el callback evalúen la solicitud, **entonces** la suscripción será rechazada sin exponer eventos.
3. **Dado que** Reverb o el worker están temporalmente fuera de servicio, **cuando** el usuario consulte REST, **entonces** encontrará la notificación persistida y el flujo principal seguirá confirmado.
4. **Dado que** el equipo prepare ÉPICA 15, **cuando** consulte la configuración, **entonces** encontrará procesos, variables y puertos requeridos sin credenciales externas.

## Reglas de negocio

- Cada usuario escucha únicamente su canal privado.
- El broadcast complementa el canal `database`.
- La indisponibilidad WebSocket no revierte operaciones de negocio.
- Los secretos no se versionan.
- Los broadcasts usan cola.
- El payload no expone información adicional a la persistida.
- `pusher-js` no representa un proveedor externo.

## Definition of Ready

- HU02 está terminada.
- La notificación persiste correctamente sin Reverb.
- La autenticación Bearer funciona en rutas Sanctum.
- El ambiente puede ejecutar un worker y abrir el puerto de Reverb.

---

# HU04-E11-Operar campana de notificaciones

## Descripción

**Como** usuario autenticado,  
**quiero** consultar y gestionar mis avisos desde una campana actualizada,  
**para** distinguir novedades y acceder al cierre de reparación relacionado.

## Prioridad

Muy alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Dependencias frontend:
  - `laravel-echo`
  - `pusher-js`
- Configuración:
  - `frontend/src/realtime/echo.ts`
- Tipos:
  - `frontend/src/modules/notifications/types/notification.ts`
- Servicio:
  - `frontend/src/modules/notifications/services/notificationsService.ts`
- Hook:
  - `frontend/src/modules/notifications/hooks/useNotifications.ts`
- Componente:
  - `frontend/src/modules/notifications/components/NotificationBell.tsx`
- Archivos a modificar:
  - `frontend/src/layouts/MainLayout.tsx`
  - `frontend/.env.example`

La implementación sustituye el cascarón actual de `Bell` y reutiliza `apiClient` para REST y autorización privada.

## Impacto en el modelo de datos

No modifica el modelo. Consume HU02 y se suscribe al canal definido en HU03.

## Dependencias

- HU02-E11-Persistir y consultar notificaciones.
- Contrato del canal de HU03-E11.
- Ruta `/archivero-reparaciones/:id` de HU03-E10.
- Usuario autenticado con ID disponible en `AuthContext`.

## Subtareas

1. **Crear cliente y estado de notificaciones** — Definir tipos, servicio y hook para carga inicial, contador, lectura individual/global y deduplicación por ID.
2. **Configurar Echo autenticado** — Crear una instancia con variables Reverb y authorizer basado en `apiClient`, suscribirse al usuario y liberar el canal al desmontar o cerrar sesión.
3. **Construir campana y panel** — Mostrar badge, últimas notificaciones, distinción de no leídas, fecha, estados de carga/vacío y acción global.
4. **Integrar lectura y navegación** — Marcar al seleccionar, actualizar el contador y navegar únicamente a rutas internas reconocidas.
5. **Resolver reconexión y responsividad** — Reconsultar REST al recuperar conexión, evitar duplicados y adaptar panel a móvil y escritorio.

## Criterios de aceptación

1. Todos los usuarios autenticados ven la campana; quienes no tengan avisos ven contador vacío.
2. El montaje consulta REST y muestra el `unread_count` real.
3. El panel muestra título, mensaje, fecha y estado de las notificaciones recientes.
4. Las no leídas se distinguen visualmente.
5. Seleccionar una notificación propia la marca como leída y actualiza el contador.
6. `Marcar todas como leídas` actualiza el panel sin recargar.
7. La URL válida navega a `/archivero-reparaciones/{id}`.
8. Una ruta ausente o no reconocida no se ejecuta.
9. Echo escucha únicamente `App.Models.User.{id}`.
10. Un broadcast nuevo se incorpora una vez y aumenta el contador.
11. Una respuesta REST y un broadcast coincidentes se deduplican por ID.
12. Al cerrar sesión o cambiar de usuario se abandona el canal y se limpia el estado.
13. Sin Reverb, la campana continúa funcionando al abrirse o recargarse mediante REST.
14. Los errores de red no bloquean navegación, cierre de sesión u otras funciones.
15. El panel funciona en móvil y escritorio y es accesible por teclado.

## Definition of Done

1. **Dado que** un usuario inicia sesión, **cuando** se monte la campana, **entonces** cargará sus notificaciones persistidas y mostrará el conteo correcto.
2. **Dado que** llega un aviso por el canal privado, **cuando** Echo lo procese, **entonces** el panel lo incorporará una sola vez sin recargar la aplicación.
3. **Dado que** el usuario selecciona o marca avisos, **cuando** la API confirme la lectura, **entonces** la interfaz actualizará estado y contador y navegará solo a una ruta interna válida.
4. **Dado que** Reverb no está disponible, **cuando** el usuario abra o recargue la interfaz, **entonces** podrá recuperar y gestionar sus notificaciones mediante REST.

## Reglas de negocio

- El frontend no determina destinatarios.
- La visibilidad de una URL no sustituye permisos.
- Solo se navega a rutas internas permitidas.
- El contador procede del estado persistido más eventos deduplicados.
- El cliente abandona canales al terminar la sesión.
- La campana no permite redactar ni eliminar.
- Los fallos WebSocket no se presentan como fallo del cierre de reparación.
- No se implementan sonidos ni notificaciones del navegador.

## Definition of Ready

- HU02 está disponible o existe un mock aprobado.
- HU03 define variables, canal y autorización.
- El componente visual existente fue identificado.
- Existen usuarios destinatarios con notificaciones de prueba.
- La ruta del Archivero está integrada.

---

# HU05-E11-Validar notificaciones internas

## Descripción

**Como** responsable de QA,  
**quiero** validar persistencia, destinatarios, lectura, tiempo real y degradación,  
**para** garantizar que el flujo termine con avisos seguros sin depender de servicios externos.

## Prioridad

Muy alta.

## Responsable único

QA.

## Alcance técnico

- Pruebas backend recomendadas:
  - `backend/tests/Feature/RepairFinishedNotificationTest.php`
  - `backend/tests/Feature/NotificationApiTest.php`
  - `backend/tests/Feature/BroadcastAuthorizationTest.php`
- Evidencia funcional:
  - `docs/evidencias/epica-11/matriz-pruebas.md`
  - `docs/evidencias/epica-11/resultado-pruebas.md`
- Validaciones mínimas:
  - `cd backend && php artisan test`
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

La recepción WebSocket y la campana se validan manualmente en dos sesiones. Las pruebas de persistencia no deben depender de Reverb activo.

## Impacto en el modelo de datos

Las pruebas verifican:

- `notifications`
- Ausencia controlada o retiro de `notificaciones`.
- `users`
- `tipos_usuarios`
- `usuario_area`
- `tickets`
- `bitacoras_reparacion`

No modifican el esquema productivo. Los datos se aíslan y limpian en el ambiente de pruebas.

## Dependencias

- HU02-E11-Persistir y consultar notificaciones.
- HU03-E11-Transmitir notificaciones con Reverb.
- HU04-E11-Operar campana de notificaciones.
- Flujo E08-E10 integrado.
- Dos sesiones de navegador con usuarios distintos.

## Subtareas

1. **Preparar matriz y destinatarios** — Crear casos con usuarios activos, inactivos, eliminados y áreas activas/inactivas, y relacionarlos con criterios.
2. **Automatizar persistencia y propiedad** — Probar evento posterior al commit, datos, idempotencia, REST, conteos, lectura y aislamiento entre usuarios.
3. **Validar canales y degradación** — Probar autorización propia/ajena, worker, Reverb activo/inactivo, reconexión y conservación en PostgreSQL.
4. **Validar interfaz y regresión** — Probar campana en dos sesiones, navegación, responsividad, accesibilidad, suite, lint, build y flujo E08-E10.

## Criterios de aceptación

1. Cada criterio de HU02, HU03 y HU04 tiene al menos un caso.
2. Se comprueba que no se notifique antes del commit.
3. Se validan todos los Subdirectores Administrativos activos.
4. Se validan Responsables del Lugar con área activa, inactiva y ajena.
5. Personal de Mantenimiento originador y Usuario Registrado no reciben el evento.
6. Se prueba deduplicación de destinatarios y reintento del cierre.
7. Se comprueba que cada usuario solo consulte y modifique sus filas.
8. Se validan conteo, lectura individual y lectura global.
9. Se rechaza la autorización a un canal ajeno.
10. Dos sesiones reciben únicamente sus eventos.
11. Con Reverb detenido, la notificación persiste y aparece mediante REST.
12. Al restablecer conexión no aparecen duplicados.
13. La navegación vuelve a aplicar permisos del Archivero.
14. Suite backend, lint y build concluyen correctamente.
15. No quedan defectos críticos o altos abiertos.

## Definition of Done

1. **Dado que** se confirma una reparación archivada, **cuando** QA revise destinatarios y PostgreSQL, **entonces** encontrará una notificación única para cada usuario válido y ninguna para los excluidos.
2. **Dado que** distintos usuarios consultan, leen o autorizan canales, **cuando** se ejecuten los casos de seguridad, **entonces** ninguno podrá acceder o suscribirse a datos ajenos.
3. **Dado que** Reverb o el worker se interrumpe, **cuando** se consulte la aplicación por REST, **entonces** la notificación persistida seguirá disponible sin afectar el cierre principal.
4. **Dado que** backend y frontend están integrados, **cuando** se ejecuten aceptación, regresión, lint y build, **entonces** no habrá defectos críticos o altos abiertos y quedará evidencia reproducible.

## Reglas de negocio

- QA verifica API, base de datos, cola, canal y frontend.
- Las pruebas de broadcast no sustituyen las de persistencia.
- Cada defecto se relaciona con una HU y criterio.
- No se aprueba con defectos críticos o altos.
- Los secretos usados en pruebas no se documentan.
- La matriz no requiere servicios externos.
- Los datos y trabajos de cola de prueba se limpian.

## Definition of Ready

- HU02 a HU04 están integradas.
- ÉPICA 10 produce un cierre confirmado.
- Reverb y el worker pueden iniciarse y detenerse en el ambiente.
- Existen usuarios y áreas controlados.
- QA conoce las variables y puertos locales.

---

## Definition of Done de la Épica

1. **Dado que** ÉPICA 10 confirma una reparación archivada, **cuando** se emita `reparacion_finalizada` después del commit, **entonces** cada destinatario válido tendrá una notificación persistente única.
2. **Dado que** un Subdirector autoriza o rechaza una valoración, **cuando** la decisión queda confirmada, **entonces** su autor activo recibirá el resultado y podrá navegar a Mis valoraciones.
3. **Dado que** Personal de Mantenimiento corrige y reenvía una valoración rechazada, **cuando** la transición queda confirmada, **entonces** todos los Subdirectores activos recibirán el aviso y podrán navegar a Valoraciones por aprobar.
4. **Dado que** un usuario autenticado abre la campana, **cuando** consulte, lea o reciba avisos, **entonces** solo operará sobre sus propias notificaciones y verá el contador correcto.
5. **Dado que** Reverb y el worker están disponibles, **cuando** se cree una notificación, **entonces** la campana del destinatario conectado se actualizará sin recargar.
6. **Dado que** el tiempo real no está disponible, **cuando** el usuario recupere mediante REST, **entonces** encontrará el aviso persistido sin afectar el flujo principal.
7. **Dado que** backend y frontend están integrados, **cuando** QA ejecute seguridad, degradación, regresión, lint y build, **entonces** no habrá defectos críticos o altos abiertos y quedará evidencia reproducible.

## Criterio de cierre

ÉPICA 11 se considera terminada cuando HU01 a HU05 cumplen su Definition of Done y los cuatro eventos acordados generan avisos persistentes, privados, consultables y actualizables en tiempo real sin usar servicios externos.
