# ÉPICA 10 — Bitácora de Mantenimiento / Archivero Digital de Reparaciones Exitosas

## Identificación

- **Estado real:** Pendiente de implementación funcional; existe la tabla `bitacoras_reparacion`, pero no tiene modelo, servicio, API, permisos ni interfaz.
- **Prioridad:** Muy alta.
- **Actores funcionales:** Subdirector Administrativo, Personal de Mantenimiento y Responsable del Lugar.
- **Dependencia principal:** ÉPICA 09 — Generación del Informe Final de Mantenimiento (PDF).
- **Épica consumidora:** ÉPICA 11 — Sistema de Notificaciones Internas.
- **Enfoque:** Índice documental automático, consultable y protegido para reparaciones cerradas exitosamente.

## Aclaración funcional

En el MVP, la palabra **bitácora** no representa un historial de eventos, cambios de estado o acciones de usuarios. Esa finalidad corresponde a `historial_ticket` y permanece diferida.

`bitacoras_reparacion` representa el índice del **Archivero Digital de Reparaciones Exitosas**. Cada registro resume una reparación terminada, enlaza sus fuentes de datos y conserva la ruta del PDF generado por ÉPICA 09.

## Objetivo

Crear automáticamente una entrada documental después de finalizar una reparación y generar correctamente su PDF, para que los usuarios autorizados consulten las reparaciones exitosas de acuerdo con su rol, sin duplicar la información completa del ticket.

## Resultado esperado

Al terminar la épica, el sistema debe cubrir este flujo:

1. ÉPICA 08 valida y prepara el cierre de la reparación.
2. El ticket adopta el estado `Reparado` dentro de la transacción de cierre.
3. ÉPICA 09 genera y almacena el PDF en la ruta oficial.
4. ÉPICA 10 valida que el archivo exista.
5. El sistema crea una única entrada en `bitacoras_reparacion`.
6. La transacción se confirma únicamente cuando reparación, PDF y bitácora son consistentes.
7. El usuario recibe la confirmación del cierre sin capturar datos adicionales.
8. Los usuarios autorizados consultan el Archivero conforme a su alcance.
9. ÉPICA 11 podrá emitir `reparacion_finalizada` después de la confirmación.

Si la creación de la bitácora falla, el cierre se revierte y se elimina el PDF recién generado. No debe existir un ticket confirmado como `Reparado` sin su archivo y registro documental una vez integrada esta épica.

## Alcance esencial

- Contrato del registro automático y de sus permisos.
- Ajuste mínimo de integridad para `bitacoras_reparacion`.
- Modelo, relaciones y política de acceso.
- Servicio explícito de archivado integrado al cierre.
- Listado paginado con búsqueda por folio o título.
- Consulta del detalle documental.
- Reutilización de la descarga protegida de ÉPICA 09.
- Interfaz responsive del Archivero Digital.
- Pruebas de atomicidad, idempotencia, permisos y regresión.
- Punto de integración posterior a la confirmación para ÉPICA 11.

## Fuera de alcance

- Historial cronológico de eventos o estados.
- Modelos, endpoints o interfaz para `historial_ticket`.
- Registro de acciones de valoración, autorización o rechazo.
- Creación, edición o eliminación manual de bitácoras.
- Regeneración del PDF desde el Archivero.
- Duplicación de sede, área, prioridad, materiales o evidencias.
- Etiquetas, favoritos, comentarios, firma, impresión masiva o exportación ZIP.
- Búsqueda de texto dentro del contenido del PDF.
- Eliminación o restauración de reparaciones archivadas.
- Notificaciones internas; corresponden a ÉPICA 11.

## Contraste con la implementación actual

| Capacidad                      | Estado actual       | Pendiente principal                                        |
| :----------------------------- | :------------------ | :--------------------------------------------------------- |
| Tabla `bitacoras_reparacion`   | Parcial             | Endurecer nulabilidad, unicidad y longitud del título.     |
| Modelo y relaciones            | No implementado     | Crear modelo Eloquent y relaciones necesarias.             |
| Registro automático            | No implementado     | Integrar servicio después de generar el PDF.               |
| Integridad del cierre          | No implementado     | Revertir datos y archivos si falla el archivado.           |
| Consulta por rol               | No implementado     | Aplicar alcance por Personal de Mantenimiento, área o acceso global. |
| API paginada                   | No implementado     | Crear listado y detalle protegidos.                         |
| Interfaz del Archivero         | No implementado     | Crear módulo, navegación, listado y detalle.                |
| Descarga del PDF               | Definida en E09     | Reutilizar el endpoint y componente existentes.            |
| Historial de eventos           | Fuera del MVP       | No implementar `historial_ticket`.                          |
| Pruebas específicas            | No implementado     | Validar creación, permisos, concurrencia y regresión.       |

### Evidencia técnica del contraste

- `bitacoras_reparacion` existe en las migraciones y en el esquema actualizado.
- Sus campos son actualmente nullable y no existen restricciones únicas sobre `ticket_id` o `reparacion_id`.
- `titulo` tiene longitud 150, insuficiente para agregar `Ticket #{id} - ` a un título de ticket que ya admite 150 caracteres.
- Las llaves foráneas actuales utilizan `nullOnDelete`, lo cual permitiría perder los enlaces de un registro que pretende ser documental.
- No existe `BitacoraReparacion.php`, `RepairArchiveService.php`, controlador, política o rutas del Archivero.
- `User.php` todavía no define la relación con áreas mediante `usuario_area`.
- El frontend no contiene un módulo de archivo de reparaciones.

## Datos persistidos

| Campo                | Origen o regla                                                                 |
| :------------------- | :------------------------------------------------------------------------------ |
| `ticket_id`          | `reparaciones.ticket_id`; obligatorio y único.                                  |
| `reparacion_id`      | Reparación finalizada; obligatorio y único.                                     |
| `titulo`             | `Ticket #{ticket.id} - {ticket.titulo}`; generado automáticamente.              |
| `descripcion_final`  | Copia documental de `reparaciones.estado_final`.                                |
| `archivo_pdf`        | Ruta relativa devuelta por ÉPICA 09.                                            |
| `generado_por`       | `reparaciones.realizado_por`, no el usuario que consulte después.               |
| `fecha_generacion`   | Fecha de generación devuelta por el servicio PDF de ÉPICA 09.                   |

`descripcion_final` y `titulo` conservan el resumen documental del momento del cierre. El resto de la información se obtiene mediante relaciones.

## Ajuste del modelo de datos

La migración de esta épica debe:

- Hacer obligatorios los siete campos funcionales.
- Ampliar `titulo` a `VARCHAR(255)`.
- Agregar unicidad a `ticket_id`.
- Agregar unicidad a `reparacion_id`.
- Impedir la eliminación física del ticket, reparación o usuario de Personal de Mantenimiento mientras exista una bitácora asociada.
- Conservar `archivo_pdf` como ruta relativa.
- No agregar `area_id`, sede, prioridad, materiales o fotografías.

Antes de aplicar restricciones en un ambiente con datos, se debe auditar la tabla. La migración no elimina ni completa silenciosamente registros heredados inválidos.

## Flujo transaccional oficial

| Orden | Operación                                                | Resultado antes de confirmar |
| :---- | :------------------------------------------------------- | :--------------------------- |
| 1     | Validar reparación, propiedad, textos y evidencias       | Sin cambios confirmados      |
| 2     | Preparar estado `Reparado` y fecha de finalización       | Cambios dentro de transacción |
| 3     | Generar y almacenar el PDF                               | Archivo temporal controlado  |
| 4     | Crear `bitacoras_reparacion`                             | Registro dentro de transacción |
| 5     | Confirmar transacción                                    | Cierre íntegro               |
| 6     | Responder al cliente                                     | Reparación y archivo disponibles |
| 7     | Habilitar evento posterior de ÉPICA 11                   | Solo después del commit      |

Si falla un paso anterior al commit, se revierte la base de datos y se eliminan los archivos creados por el intento.

## Permisos del Archivero

| Rol                          | Listado y detalle permitidos                                                            |
| :--------------------------- | :-------------------------------------------------------------------------------------- |
| Subdirector Administrativo   | Todas las reparaciones archivadas.                                                       |
| Personal de Mantenimiento    | Solo registros donde `generado_por` coincide con su usuario.                             |
| Responsable del Lugar        | Registros de tickets cuyas áreas tenga activas en `usuario_area`.                        |
| Usuario Registrado           | Sin acceso al Archivero en el MVP.                                                       |

La relación para Responsable del Lugar es:

`bitacoras_reparacion → reparaciones → tickets.area_id → usuario_area`

No se agrega `area_id` a la bitácora.

## Contrato API mínimo

| Método | Ruta                                           | Finalidad                                      |
| :----- | :--------------------------------------------- | :--------------------------------------------- |
| GET    | `/api/bitacoras-reparacion`                    | Listar registros dentro del alcance del usuario. |
| GET    | `/api/bitacoras-reparacion/{bitacora}`         | Consultar el detalle autorizado.               |
| GET    | `/api/tickets/{ticket}/reporte-reparacion`     | Abrir o descargar el PDF mediante ÉPICA 09.    |

No existen rutas `POST`, `PUT`, `PATCH` o `DELETE` para bitácoras.

### Parámetros del listado

- `search`: folio numérico o coincidencia parcial del título.
- `page`: página solicitada.
- `per_page`: valor predeterminado 15 y máximo 50.
- Orden fijo: `fecha_generacion DESC`.

### Respuesta resumida

- ID de bitácora.
- Título documental.
- Descripción final.
- Fecha de generación.
- Personal de Mantenimiento responsable.
- Folio y título actual del ticket.
- Área y sede consultadas por relación.
- `report_available`.
- Ruta API protegida del reporte.

La API no devuelve la ruta física ni `archivo_pdf` como URL pública.

## Orden y dependencias

| HU   | Responsable único          | Depende de                                      |
| :--- | :------------------------- | :---------------------------------------------- |
| HU01 | Tech Lead                  | HU01-E09 y contrato de cierre E08-E09           |
| HU02 | Fullstack Backend          | HU01-E10 y HU02-E09                             |
| HU03 | Fullstack Frontend/UX-UI   | HU01-E10 y contrato API de HU02-E10             |
| HU04 | QA                         | HU02-E10, HU03-E10 y flujo integrado E08-E10    |

HU03 puede iniciar con datos simulados aprobados. HU04 comienza cuando el archivado automático, API e interfaz estén integrados.

---

# HU01-E10-Definir contrato del Archivero Digital

## Descripción

**Como** Tech Lead,  
**quiero** definir el contrato de persistencia, integración y permisos del Archivero,  
**para** que la reparación, el PDF y la bitácora formen un único cierre consistente y sin responsabilidades duplicadas.

## Prioridad

Muy alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/epica-10-contrato-archivero.md`.
- Confirmar la semántica de `bitacoras_reparacion` como índice documental.
- Aprobar el ajuste de nulabilidad, longitud, unicidad y llaves foráneas.
- Definir el resultado interno que ÉPICA 09 entrega:
  - `relative_path`
  - `generated_at`
- Definir la firma de `RepairArchiveService`.
- Definir el orden transaccional y la limpieza ante fallos.
- Definir DTO, paginación, búsqueda, respuestas y errores.
- Definir la matriz de acceso para los cuatro roles.
- Establecer el punto posterior al commit que utilizará ÉPICA 11.

## Impacto en el modelo de datos

Define el ajuste de:

- `bitacoras_reparacion`
- Relaciones de `reparaciones`, `tickets` y `users`.
- Relación `users ↔ areas` mediante `usuario_area`.

No crea otra tabla de bitácora.

## Dependencias

- HU01-E09-Definir contrato del informe PDF.
- Contrato de reparación de ÉPICA 08.
- Esquema real de PostgreSQL/Supabase identificado.
- Roles oficiales y asignaciones mediante `usuario_area`.

## Subtareas

1. **Delimitar la bitácora documental** — Documentar qué representa, qué campos conserva y por qué no sustituye a `historial_ticket`.
2. **Definir integridad del cierre** — Especificar restricciones, transacción, idempotencia, concurrencia y compensación de archivos.
3. **Definir API y permisos** — Establecer endpoints de solo lectura, DTO, paginación, búsqueda y alcance por rol.
4. **Formalizar integraciones posteriores** — Definir el resultado de ÉPICA 09 y el punto seguro posterior al commit para ÉPICA 11.

## Criterios de aceptación

1. El contrato distingue expresamente Archivero Digital de historial de eventos.
2. Los siete campos persistidos tienen fuente y regla definidas.
3. Un ticket y una reparación pueden aparecer como máximo una vez.
4. El contrato resuelve títulos de ticket con longitud máxima.
5. Está definido el rollback cuando falla el registro después de generar el PDF.
6. Los cuatro roles tienen un alcance explícito.
7. La API es de solo lectura y no expone rutas físicas.
8. ÉPICA 11 dispone de un punto posterior al commit sin implementar notificaciones todavía.

## Definition of Done

1. **Dado que** existen interpretaciones anteriores de bitácora, **cuando** se consulte el contrato, **entonces** quedará establecido que el MVP archiva reparaciones exitosas y no eventos del ticket.
2. **Dado que** ÉPICA 09 entrega un PDF, **cuando** se revise el flujo integrado, **entonces** estarán definidos el orden de persistencia, commit y compensación ante fallos.
3. **Dado que** tres roles consultan alcances distintos, **cuando** backend y frontend usen el contrato, **entonces** podrán aplicar una misma matriz de permisos.
4. **Dado que** el esquema actual admite registros incompletos o duplicados, **cuando** concluya HU01, **entonces** estará especificado un ajuste seguro y verificable.

## Reglas de negocio

- Una bitácora representa exactamente una reparación exitosa.
- La creación es automática y no tiene endpoint público.
- El registro solo nace después de generar el PDF.
- `generado_por` siempre identifica al integrante de Personal de Mantenimiento responsable de la reparación.
- `fecha_generacion` corresponde al PDF, no al momento de consulta.
- `historial_ticket` permanece fuera del MVP.
- La bitácora no duplica datos consultables por relaciones.

## Definition of Ready

- Los contratos de ÉPICAS 08 y 09 están disponibles.
- La tabla actual fue inspeccionada.
- La numeración definitiva de épicas está aprobada.
- La matriz de roles y áreas fue confirmada.

---

# HU02-E10-Implementar archivado automático y API

## Descripción

**Como** usuario autorizado,  
**quiero** que cada reparación exitosa quede archivada automáticamente y pueda consultarse mediante servicios protegidos,  
**para** disponer de un índice documental íntegro dentro de mi ámbito de acceso.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Migración recomendada:
  - `backend/database/migrations/XXXX_XX_XX_XXXXXX_harden_bitacoras_reparacion_for_archive.php`
- Modelo nuevo:
  - `backend/app/Models/BitacoraReparacion.php`
- Servicio nuevo:
  - `backend/app/Services/RepairArchiveService.php`
- Controlador nuevo:
  - `backend/app/Http/Controllers/Api/RepairArchiveController.php`
- Política nueva:
  - `backend/app/Policies/BitacoraReparacionPolicy.php`
- Recurso API nuevo:
  - `backend/app/Http/Resources/BitacoraReparacionResource.php`
- Modelos a relacionar:
  - `backend/app/Models/Reparacion.php`
  - `backend/app/Models/Ticket.php`
  - `backend/app/Models/User.php`
  - `backend/app/Models/Area.php`
- Servicio a integrar:
  - `backend/app/Services/RepairService.php`
- Rutas en:
  - `backend/routes/api.php`

Las rutas permanecen bajo `auth:sanctum`. La política y el alcance de consulta complementan el middleware de roles.

## Impacto en el modelo de datos

La migración debe:

- Verificar que no existan registros heredados incompletos o duplicados.
- Cambiar `titulo` a longitud 255.
- Hacer obligatorios `ticket_id`, `reparacion_id`, `titulo`, `descripcion_final`, `archivo_pdf`, `generado_por` y `fecha_generacion`.
- Crear índices únicos independientes para `ticket_id` y `reparacion_id`.
- Ajustar llaves foráneas para restringir eliminación física de las fuentes.

El servicio inserta una fila en `bitacoras_reparacion` por reparación. No modifica ni copia catálogos o evidencias.

## Dependencias

- HU01-E10-Definir contrato del Archivero Digital.
- HU02-E09-Generar y proteger el informe PDF.
- HU02-E08-Implementar API de reparación.
- Disco `public` disponible para verificar la ruta recibida.
- Datos de roles y `usuario_area` consistentes.

## Subtareas

1. **Endurecer persistencia y relaciones** — Crear la migración, el modelo, casts y relaciones con ticket, reparación, Personal de Mantenimiento responsable y áreas.
2. **Implementar archivado transaccional** — Validar reparación, estado, PDF y Personal de Mantenimiento responsable; generar campos automáticos; controlar concurrencia e integrar el servicio al cierre.
3. **Aplicar alcance y consultas** — Implementar política, filtros por rol, búsqueda, paginación, carga anticipada y recurso de respuesta.
4. **Exponer API de solo lectura** — Registrar listado y detalle, reutilizar la ruta protegida del PDF y estandarizar errores sin exponer almacenamiento.
5. **Asegurar idempotencia y compensación** — Devolver el registro existente ante un reintento equivalente y revertir datos/archivo ante inconsistencias.

## Criterios de aceptación

1. Una reparación cerrada con PDF genera exactamente una bitácora.
2. El título sigue `Ticket #{id} - {titulo del ticket}` sin truncarse.
3. `descripcion_final`, `generado_por` y `fecha_generacion` provienen de las fuentes oficiales.
4. La ruta guardada coincide con la ruta relativa entregada por ÉPICA 09 y el archivo existe.
5. No puede crearse una bitácora duplicada para el ticket o reparación.
6. No existe un endpoint público para crear, editar o eliminar registros.
7. Subdirector obtiene todos los registros.
8. Personal de Mantenimiento obtiene únicamente los generados por sus reparaciones.
9. Responsable del Lugar obtiene únicamente tickets de sus áreas activas.
10. Usuario Registrado recibe `403`.
11. El listado está paginado, ordenado por fecha descendente y busca por folio o título.
12. El detalle no devuelve la ruta física y reutiliza el endpoint protegido del PDF.
13. Si falla el archivado, no se confirma el cierre y se elimina el PDF creado por el intento.
14. El flujo integrado devuelve `archive_id`, `archived: true`, `report_available: true` y las rutas API correspondientes.

## Definition of Done

1. **Dado que** ÉPICA 09 generó correctamente el PDF de una reparación completa, **cuando** el servicio de cierre invoque el archivado, **entonces** se creará una única bitácora con los siete campos oficiales.
2. **Dado que** ocurre un reintento equivalente o una solicitud concurrente, **cuando** el servicio procese la operación, **entonces** devolverá el único registro válido sin duplicarlo.
3. **Dado que** falla la validación, persistencia o confirmación, **cuando** se revierta la operación, **entonces** no quedarán un ticket cerrado, una bitácora parcial o un PDF huérfano.
4. **Dado que** un usuario autenticado consulta listado o detalle, **cuando** se aplique su rol y relaciones, **entonces** solo recibirá registros dentro de su alcance.

## Reglas de negocio

- Solo se archivan tickets `Reparado` dentro del cierre válido.
- Debe existir una reparación completa y un PDF verificable.
- La creación se realiza en un servicio explícito, no mediante `TicketObserver`.
- El cliente no envía título, descripción, Personal de Mantenimiento responsable, fecha o ruta.
- Un ticket y una reparación tienen como máximo una bitácora.
- Un reintento solo es idempotente si reparación y ruta coinciden.
- Las consultas aplican el alcance antes de paginar.
- Responsable del Lugar requiere `usuario_area.activo = true`.
- `Usuario Registrado` no accede.
- No se permite eliminación física de las fuentes archivadas.
- La API no serializa rutas físicas del servidor.

## Definition of Ready

- HU01 está terminada.
- ÉPICA 09 entrega ruta relativa y fecha de generación.
- El flujo de ÉPICA 08 puede ejecutarse en pruebas.
- La tabla fue auditada para detectar datos heredados incompatibles.
- Existen usuarios y áreas para probar cada alcance.

---

# HU03-E10-Consultar el Archivero Digital

## Descripción

**Como** usuario autorizado,  
**quiero** buscar y consultar reparaciones archivadas,  
**para** localizar sus resultados y abrir el informe final sin acceder a información fuera de mi responsabilidad.

## Prioridad

Alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Página de listado:
  - `frontend/src/modules/archive/pages/RepairArchivePage.tsx`
- Página de detalle:
  - `frontend/src/modules/archive/pages/RepairArchiveDetailPage.tsx`
- Servicio:
  - `frontend/src/modules/archive/services/repairArchiveService.ts`
- Tipos:
  - `frontend/src/modules/archive/types/repairArchive.ts`
- Componente reutilizado de ÉPICA 09:
  - `frontend/src/modules/reports/components/MaintenanceReportAction.tsx`
- Archivos a modificar:
  - `frontend/src/App.tsx`
  - `frontend/src/layouts/MainLayout.tsx`
- Rutas protegidas:
  - `/archivero-reparaciones`
  - `/archivero-reparaciones/:id`

Roles frontend permitidos:

- `ROLES.SUBDIRECTOR_ADMINISTRATIVO`
- `ROLES.PERSONAL_MANTENIMIENTO`
- `ROLES.RESPONSABLE_DEL_LUGAR`

## Impacto en el modelo de datos

No modifica el modelo. Consume listado, detalle y descarga protegida.

## Dependencias

- HU01-E10-Definir contrato del Archivero Digital.
- Contrato API de HU02-E10.
- HU03-E09-Consultar y descargar el informe PDF.
- Backend debe entregar ejemplos por rol y errores `403`, `404` y `422`.

## Subtareas

1. **Crear módulo y navegación** — Agregar tipos, servicio, rutas protegidas y acceso al Archivero para los tres roles autorizados.
2. **Implementar listado paginado** — Mostrar título, folio, área, Personal de Mantenimiento responsable, resultado y fecha, con búsqueda retrasada y estados de carga o vacío.
3. **Implementar detalle documental** — Presentar el resumen persistido y los datos relacionados sin duplicarlos en formularios editables.
4. **Reutilizar consulta del PDF** — Integrar la acción de ÉPICA 09 y manejar disponibilidad, descarga y acceso denegado.
5. **Resolver responsividad y errores** — Adaptar tabla o tarjetas a móvil, conservar página/búsqueda y evitar estados visuales falsos.

## Criterios de aceptación

1. El menú y las rutas aparecen únicamente para los tres roles autorizados.
2. El listado respeta la paginación y el alcance entregados por backend.
3. La búsqueda consulta al servidor por folio o título sin descargar todos los registros.
4. Cada resultado muestra título documental, Personal de Mantenimiento responsable, área, fecha y descripción final.
5. El detalle distingue resumen archivado de información relacionada.
6. El PDF se abre o descarga mediante el componente protegido de ÉPICA 09.
7. No existen controles para crear, editar, regenerar o eliminar.
8. Un estado vacío diferencia “sin reparaciones archivadas” de “sin coincidencias”.
9. Los errores `403`, `404` y de red muestran recuperación adecuada.
10. La interfaz funciona en móvil y escritorio.
11. Cambiar de página o volver del detalle conserva razonablemente la búsqueda.
12. Ninguna respuesta o enlace muestra la ruta física del archivo.

## Definition of Done

1. **Dado que** el usuario pertenece a un rol autorizado, **cuando** abra `/archivero-reparaciones`, **entonces** verá únicamente los registros paginados que backend permita para su alcance.
2. **Dado que** existen registros archivados, **cuando** busque por folio o título y abra uno, **entonces** podrá consultar su resumen y acceder al PDF existente.
3. **Dado que** no hay resultados, falta el archivo o la API rechaza la consulta, **cuando** la interfaz procese la respuesta, **entonces** mostrará un estado claro sin exponer datos ajenos o rutas internas.

## Reglas de negocio

- El frontend no vuelve a filtrar datos sensibles como sustituto del backend.
- El Archivero es de solo lectura.
- La búsqueda remota utiliza el contrato paginado.
- El detalle no ofrece edición.
- La descarga reutiliza el endpoint autenticado.
- Las acciones se deshabilitan mientras se procesan.
- Usuario Registrado no ve navegación ni rutas del módulo.
- La interfaz respeta el diseño actual de REPARA-79.

## Definition of Ready

- HU02 entrega listado y detalle o existe un mock aprobado.
- El componente de descarga de ÉPICA 09 está disponible.
- Existen bitácoras de prueba visibles para cada rol.
- La navegación responsive actual está identificada.
- Los estados vacíos y errores fueron definidos.

---

# HU04-E10-Validar el Archivero Digital

## Descripción

**Como** responsable de QA,  
**quiero** validar el archivado automático, su consulta y sus permisos,  
**para** garantizar que cada reparación exitosa quede documentada una sola vez y solo sea visible dentro del alcance autorizado.

## Prioridad

Muy alta.

## Responsable único

QA.

## Alcance técnico

- Prueba backend recomendada:
  - `backend/tests/Feature/RepairArchiveFlowTest.php`
- Prueba de permisos recomendada:
  - `backend/tests/Feature/RepairArchiveAuthorizationTest.php`
- Evidencia funcional:
  - `docs/evidencias/epica-10/matriz-pruebas.md`
  - `docs/evidencias/epica-10/resultado-pruebas.md`
- Comandos mínimos:
  - `cd backend && php artisan test`
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

El frontend se valida manualmente porque actualmente no tiene un framework de pruebas automatizadas.

## Impacto en el modelo de datos

Las pruebas verifican:

- `bitacoras_reparacion`
- `reparaciones`
- `tickets`
- `users`
- `usuario_area`
- Existencia del PDF en almacenamiento.

No modifican el esquema productivo. Los datos y archivos se aíslan en el ambiente de pruebas.

## Dependencias

- HU02-E10-Implementar archivado automático y API.
- HU03-E10-Consultar el Archivero Digital.
- Flujo E08-E09-E10 integrado.
- Usuarios de los cuatro roles, dos áreas y asignaciones activas/inactivas.

## Subtareas

1. **Preparar matriz y escenarios** — Relacionar criterios con casos, roles, áreas, reparaciones, PDFs y resultados esperados.
2. **Automatizar integridad del cierre** — Probar creación única, campos automáticos, concurrencia, idempotencia, restricciones, rollback y limpieza.
3. **Validar API, permisos e interfaz** — Comprobar alcance por rol, búsqueda, paginación, detalle, navegación, responsividad y descarga protegida.
4. **Ejecutar regresión y dictamen** — Validar ÉPICAS 08 y 09, ejecutar suite, lint y build, documentar defectos y emitir resultado.

## Criterios de aceptación

1. Cada criterio de HU02 y HU03 tiene al menos un caso de prueba.
2. El cierre integrado crea un PDF y exactamente una bitácora.
3. Se verifican los siete campos y el título con un ticket de 150 caracteres.
4. Se prueban reintentos y dos solicitudes concurrentes.
5. Se simula un fallo al insertar la bitácora y se comprueba rollback y limpieza del PDF.
6. Se impide archivar sin PDF, reparación completa o Personal de Mantenimiento responsable.
7. Se prueba Subdirector con registros de varias áreas.
8. Se prueba Personal de Mantenimiento con reparaciones propias y ajenas.
9. Se prueba Responsable del Lugar con área activa, inactiva y no asignada.
10. Se prueba Usuario Registrado sin acceso.
11. Se validan búsqueda, orden y límites de paginación.
12. Se comprueba que no existan rutas mutables ni exposición de la ruta física.
13. Suite backend, lint y build concluyen correctamente.
14. No quedan defectos críticos o altos abiertos.

## Definition of Done

1. **Dado que** una reparación termina con PDF válido, **cuando** QA ejecute el flujo integrado, **entonces** encontrará una única bitácora completa y descargable dentro de la misma confirmación.
2. **Dado que** se fuerzan duplicidad, concurrencia o una falla de persistencia, **cuando** finalice el intento, **entonces** la base de datos y el almacenamiento permanecerán consistentes.
3. **Dado que** se prueban los cuatro roles y distintas relaciones de área, **cuando** consulten listado, detalle o PDF, **entonces** cada respuesta respetará la matriz de permisos.
4. **Dado que** frontend y backend están integrados, **cuando** se ejecuten regresión, lint y build, **entonces** no habrá defectos críticos o altos abiertos y quedará evidencia reproducible.

## Reglas de negocio

- QA valida respuesta, base de datos y almacenamiento.
- Cada defecto se relaciona con una HU y criterio.
- No se aprueba con defectos críticos o altos.
- Los casos negativos no deben revelar registros ajenos.
- Los archivos de prueba se eliminan al terminar.
- La regresión incluye finalización y descarga de PDF.
- La tabla `historial_ticket` no forma parte de la matriz.

## Definition of Ready

- HU02 y HU03 están integradas.
- ÉPICAS 08 y 09 pueden completar el cierre.
- El ambiente permite simular una falla de base de datos o servicio.
- Existen usuarios, áreas y asociaciones controladas.
- QA conoce el procedimiento de limpieza.

---

## Definition of Done de la Épica

1. **Dado que** una reparación completa tiene su PDF generado, **cuando** el sistema confirme el cierre, **entonces** creará exactamente una bitácora con los siete campos oficiales.
2. **Dado que** cualquier etapa posterior a la validación falla, **cuando** se revierta la operación, **entonces** no quedarán un ticket cerrado, una bitácora parcial o un PDF huérfano.
3. **Dado que** un usuario consulta el Archivero, **cuando** backend aplique su rol y relaciones, **entonces** solo devolverá registros dentro de su alcance.
4. **Dado que** un registro autorizado está disponible, **cuando** el usuario abra su detalle, **entonces** podrá consultar el resumen y descargar el PDF sin editar ni regenerar información.
5. **Dado que** backend y frontend están integrados, **cuando** QA ejecute aceptación, regresión, lint y build, **entonces** no habrá defectos críticos o altos abiertos y quedará evidencia reproducible.
6. **Dado que** ÉPICA 11 se integre posteriormente, **cuando** requiera notificar una reparación finalizada, **entonces** dispondrá de un cierre confirmado con PDF y bitácora existentes.

## Criterio de cierre

ÉPICA 10 se considera terminada cuando HU01 a HU04 cumplen su Definition of Done y el flujo E08-E09-E10 confirma de forma atómica una reparación, su PDF y una única entrada consultable en el Archivero Digital.
