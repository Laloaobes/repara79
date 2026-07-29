# ÉPICA 06 — Valoración técnica del ticket

## Identificación

- **Estado real:** Parcialmente implementada; el flujo básico existe, pero requiere corregir contrato, validaciones, estados, concurrencia, materiales, interfaz y pruebas.
- **Prioridad:** Muy alta.
- **Actor funcional principal:** Personal de Mantenimiento.
- **Dependencia principal:** ÉPICA 05 debe entregar tickets registrados en estado `Pendiente`.
- **Dependencia posterior:** ÉPICA 07 consume la valoración en estado `Pendiente de autorización`.
- **Enfoque:** Completar y estabilizar el flujo vertical de valoración del MVP sin incorporar funciones de autorización.

## Objetivo

Permitir que el Personal de Mantenimiento consulte un ticket pendiente, revise el desperfecto, registre observaciones y los materiales estimados con cantidades y costos unitarios reales, y envíe una valoración consistente para revisión administrativa.

## Resultado esperado

Al terminar la épica, el sistema debe cubrir este flujo:

1. ÉPICA 05 deja un ticket válido en estado `Pendiente`.
2. El Personal de Mantenimiento consulta los tickets pendientes y abre su detalle.
3. Revisa la información y evidencia inicial registradas en el ticket.
4. Captura observaciones y al menos un material con descripción, cantidad y costo unitario.
5. La interfaz muestra subtotales y total estimado como ayuda antes del envío.
6. Backend valida nuevamente datos, rol, estado, unicidad y cálculos.
7. En una sola transacción crea `solicitudes_materiales` y `materiales_ticket`, registra al autor, cambia el ticket a `Valorado` y deja la solicitud `Pendiente de autorización`.
8. El autor puede consultar la valoración enviada, pero no modificarla mientras espera una decisión.
9. ÉPICA 07 recibe el contrato completo para consultar, autorizar, rechazar o solicitar corrección.

## Alcance esencial

- Consulta de tickets pendientes de valoración.
- Búsqueda por folio o título y filtro por área.
- Consulta del detalle completo del ticket antes de valorar.
- Registro de observaciones obligatorias.
- Captura dinámica de uno o más materiales.
- Cantidad entera y costo unitario por material.
- Cálculo informativo de subtotales y total en frontend.
- Cálculo oficial de subtotales y total en Backend.
- Registro transaccional de valoración, materiales y transición del ticket.
- Consulta de valoraciones propias.
- Control de acceso, estado, unicidad y concurrencia.
- Contrato estable para E07, E09 y E13.
- Pruebas específicas y regresión del flujo.

## Recortes deliberados por tiempo

- No se implementan borradores persistidos de valoración.
- No se permite editar una valoración enviada mientras esté `Pendiente de autorización`.
- No se permite eliminar materiales individualmente después del envío.
- La corrección y el reenvío de una valoración rechazada pertenecen a ÉPICA 07.
- La consulta, autorización y rechazo del Subdirector Administrativo pertenecen a ÉPICA 07.
- No se autoriza o rechaza cada material por separado.
- No se administran inventario, existencias, proveedores, compras o consumo real.
- `codigo_material`, `inventario_ref`, `estado_individual` y `motivo_rechazo` individual no participan en el contrato público del MVP.
- No se almacena subtotal o total; se calculan a partir de `cantidad × costo_unitario`.
- No se implementa `historial_ticket`.
- No se generan notificaciones, PDF o bitácora en esta épica.

El formulario puede agregar o quitar renglones localmente antes de enviar. Una vez confirmado el registro, la valoración se considera formalmente enviada y permanece inmutable hasta que ÉPICA 07 habilite una corrección por rechazo.

## Contraste con la implementación actual

| Capacidad | Estado actual | Pendiente principal |
| :-- | :-- | :-- |
| Consulta general de tickets | Parcial | Aplicar consulta operativa de pendientes, búsqueda, área y orden. |
| Consulta del detalle | Parcial | Restringir la acción de valorar por rol, estado y ausencia de valoración. |
| Registro de valoración | Parcial | Validar estado, material obligatorio, concurrencia y contrato definitivo. |
| Cantidad de materiales | Incorrecto | Recibir y persistir la cantidad real en lugar de fijar `1`. |
| Costo unitario | Inconsistente | Sustituir el campo público `costo` por `costo_unitario`. |
| Estado de la solicitud | Incorrecto | Usar `Pendiente de autorización`, no `Pendiente`. |
| Estado del ticket | Parcial | Consultar `Valorado` del catálogo y no crearlo durante la operación. |
| Cálculos monetarios | Parcial | Exponer cantidad, costo unitario, subtotal y total con precisión consistente. |
| Consulta de valoraciones propias | Parcial | Alinear DTO y retirar edición posicional después del envío. |
| Eliminación de materiales | Incorrecto | Retirar el endpoint basado en índice posicional del flujo enviado. |
| Concurrencia | No implementado | Garantizar que solo una solicitud valore un ticket. |
| Pruebas específicas | No implementado | Agregar pruebas backend y validación funcional. |

### Evidencia técnica del contraste

- Existe `POST /api/valoraciones` bajo el rol `Personal de Mantenimiento`.
- Existe `GET /api/valoraciones/mis-valoraciones`.
- `TicketController::index()` ya permite que Personal de Mantenimiento consulte todos los tickets, pero no procesa filtros del servidor.
- `TicketController::show()` ya carga ticket, catálogos, usuario y valoración.
- `StoreValoracionRequest.php` permite omitir materiales y solo recibe `descripcion` y `costo`.
- `ValoracionController::store()` no valida que el ticket esté `Pendiente`.
- La verificación previa de existencia ocurre fuera de una sección con bloqueo concurrente.
- El controlador fija `cantidad = 1`, escribe `estado_general = Pendiente` y usa `firstOrCreate()` para `Valorado`.
- `Valoracion.php` calcula el total con cantidad por costo unitario, pero serializa materiales sin ID ni cantidad.
- `DELETE /api/valoraciones/{valoracion}/materiales/{materialIndex}` usa la posición de la colección como identidad.
- `TicketDetailPage.tsx` marca los materiales como opcionales y no captura cantidad.
- `MisValoracionesPage.tsx` permite eliminar materiales de una valoración `Pendiente`, aunque una valoración enviada debe permanecer sin cambios hasta la decisión administrativa.
- `materiales_ticket` ya contiene `cantidad` y `costo_unitario`; no se requieren columnas nuevas para el contrato base.
- La restricción única de `solicitudes_materiales.ticket_id` ya representa una valoración por ticket.
- No existen pruebas específicas de valoración en Backend o Frontend.

## Contrato oficial de materiales

### Entrada

Cada elemento de `materiales` enviado al registrar una valoración contiene únicamente:

| Campo | Tipo | Regla |
| :-- | :-- | :-- |
| `descripcion` | string | Obligatoria, recortada y con máximo de 150 caracteres. |
| `cantidad` | integer | Obligatoria y mayor o igual a `1`. |
| `costo_unitario` | decimal | Obligatorio, mayor o igual a `0` y compatible con `NUMERIC(10,2)`. |

El cliente no envía `id`, `subtotal`, `total`, estados individuales, código de inventario ni datos de revisión administrativa.

### Salida

Cada material persistido se representa públicamente con:

| Campo | Fuente |
| :-- | :-- |
| `id` | `materiales_ticket.id` |
| `descripcion` | Alias público de `materiales_ticket.nombre_material` |
| `cantidad` | `materiales_ticket.cantidad` |
| `costo_unitario` | `materiales_ticket.costo_unitario` |
| `subtotal` | Cálculo `cantidad × costo_unitario` |

`costo_unitario`, `subtotal` y `costo_estimado` se serializan como cadenas decimales con dos posiciones. Esto evita pérdida de precisión y coincide con el criterio monetario de ÉPICA 13.

`descripcion` se conserva como nombre público para no exponer el nombre físico `nombre_material` y para mantener un contrato uniforme con E07. El campo público anterior `costo` queda sustituido por `costo_unitario`.

## Estados y transiciones oficiales

| Acción | Ticket | Solicitud de materiales |
| :-- | :-- | :-- |
| Antes de valorar | `Pendiente` | No existe |
| Envío correcto de E06 | `Pendiente` → `Valorado` | No existe → `Pendiente de autorización` |
| Revisión de E07 | Permanece `Valorado` hasta decidir | Permanece `Pendiente de autorización` hasta decidir |

No se admiten otras transiciones dentro de E06.

## Límites entre ÉPICA 06 y ÉPICA 07

| Responsabilidad | Épica |
| :-- | :-- |
| Consultar tickets `Pendiente` y revisar su detalle | E06 |
| Crear valoración, materiales y costo estimado | E06 |
| Cambiar el ticket a `Valorado` | E06 |
| Dejar la solicitud `Pendiente de autorización` | E06 |
| Consultar valoraciones propias enviadas | E06 |
| Consultar bandeja y detalle administrativo | E07 |
| Autorizar o rechazar la valoración | E07 |
| Mostrar motivo, corregir y reenviar tras rechazo | E07 |

## Orden y dependencias

| HU | Responsable único | Depende de |
| :-- | :-- | :-- |
| HU01 | Tech Lead | Contrato de tickets de ÉPICA 05 y decisiones E06–E07 |
| HU02 | Fullstack Backend | HU01-E06 |
| HU03 | Fullstack Frontend/UX-UI | HU01-E06 y contrato API de HU02-E06 |
| HU04 | QA | HU02-E06 y HU03-E06 |

HU02 puede comenzar cuando HU01 cierre el contrato. HU03 puede avanzar con mocks aprobados, pero no puede terminar hasta integrarse con HU02. HU04 valida el flujo integrado y la regresión hacia E05 y E07.

---

# HU01-E06-Definir contrato de valoración técnica

## Descripción

**Como** Tech Lead,  
**quiero** definir el contrato completo de valoración, materiales, cálculos y estados,  
**para** que Backend, Frontend/UX-UI, QA y ÉPICA 07 utilicen una única interpretación del flujo.

## Prioridad

Muy alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/epica-06-contrato-valoracion.md`.
- Confirmar la transición `Pendiente → Valorado`.
- Confirmar `Pendiente de autorización` como estado inicial de `solicitudes_materiales`.
- Definir que el envío crea la valoración completa y que no existen borradores persistidos.
- Definir los endpoints utilizados:
  - `GET /api/tickets` con `estado=Pendiente`, `search`, `area_id` y `sort`.
  - `GET /api/tickets/{ticket}`.
  - `POST /api/valoraciones`.
  - `GET /api/valoraciones/mis-valoraciones`.
- Definir petición, respuesta, permisos y errores `200`, `201`, `403`, `404` y `422`.
- Definir límites de longitud, cantidad de renglones, enteros e importes compatibles con el esquema.
- Adoptar el contrato público:
  - `id`
  - `descripcion`
  - `cantidad`
  - `costo_unitario`
  - `subtotal`
- Definir `costo_estimado` como suma de subtotales calculada por Backend.
- Definir importes de salida como cadenas decimales con dos posiciones.
- Establecer que el estado enviado no permite edición o eliminación hasta un rechazo de E07.
- Identificar archivos, DTO y ejemplos que se entregarán a E07.

## Impacto en el modelo de datos

No crea tablas. Define el uso de:

- `tickets.estado_id`
- `estados_ticket`
- `solicitudes_materiales`
- `materiales_ticket`
- `users`

Debe confirmar:

- `solicitudes_materiales.ticket_id`: obligatorio y único.
- `solicitudes_materiales.estado_general`: `Pendiente de autorización` para nuevos registros.
- `solicitudes_materiales.observaciones`: obligatoria para nuevos registros.
- `solicitudes_materiales.valorado_por`: usuario autenticado.
- `solicitudes_materiales.fecha_creacion`: fecha del servidor.
- `materiales_ticket.solicitud_id`: obligatorio.
- `materiales_ticket.nombre_material`: persistencia de `descripcion`.
- `materiales_ticket.cantidad`: entero mayor o igual a `1`.
- `materiales_ticket.costo_unitario`: decimal no negativo.

Los campos administrativos permanecen nulos hasta E07. Los campos individuales e inventario no se usan en el MVP.

## Dependencias

- ÉPICA 05 debe entregar tickets válidos en estado `Pendiente`.
- Los estados `Pendiente` y `Valorado` deben existir en `estados_ticket`.
- El rol `Personal de Mantenimiento` debe existir en `tipos_usuarios`.
- Las decisiones de ÉPICA 07 deben conservar la misma interpretación de materiales y estados.
- Debe conocerse la estructura real de PostgreSQL y las migraciones ejecutadas.

## Subtareas

1. **Levantar contrato y brechas actuales** — Contrastar controlador, requests, modelos, rutas, migraciones, DTO TypeScript y pantallas con las decisiones E06–E07.
2. **Definir estados y atomicidad** — Documentar precondiciones, transición conjunta, inmutabilidad posterior, concurrencia y respuesta ante reintentos.
3. **Definir DTO de valoración** — Especificar observaciones, materiales, tipos, límites, alias público, decimales, subtotales, total y campos excluidos.
4. **Definir endpoints y errores** — Documentar método, ruta, rol, parámetros, petición, respuesta y códigos para consulta, detalle, registro y valoraciones propias.
5. **Alinear entregables posteriores** — Registrar ejemplos JSON y las condiciones que E07, E09, E13 y QA deben consumir sin reinterpretar el contrato.

## Criterios de aceptación

1. El documento identifica los cuatro endpoints, sus permisos, parámetros, DTO y códigos de respuesta.
2. Solo `Personal de Mantenimiento` puede registrar valoraciones.
3. El contrato exige observaciones y al menos un material.
4. Cada material exige `descripcion`, `cantidad` y `costo_unitario`.
5. La salida incluye `id`, `descripcion`, `cantidad`, `costo_unitario` y `subtotal`.
6. El total se calcula en Backend y no se recibe como fuente confiable del cliente.
7. Los importes de salida se representan como cadenas decimales con dos posiciones.
8. La transición deja ticket `Valorado` y solicitud `Pendiente de autorización` en una sola operación.
9. El contrato explica cómo impedir dos valoraciones concurrentes para el mismo ticket.
10. Una valoración enviada no puede editarse o perder materiales dentro de E06.
11. Los campos individuales e inventario quedan excluidos del contrato.
12. E07 puede consumir el documento sin tomar decisiones adicionales sobre materiales o estado inicial.

## Definition of Done

1. **Dado que** el código actual usa nombres y cantidades inconsistentes, **cuando** se apruebe el contrato de E06, **entonces** Backend, Frontend/UX-UI y E07 compartirán los mismos campos, tipos, cálculos y ejemplos.
2. **Dado que** un ticket solo puede valorarse una vez, **cuando** se consulte el contrato, **entonces** estarán definidas la precondición `Pendiente`, la unicidad, el bloqueo concurrente y la respuesta de conflicto.
3. **Dado que** el envío concluye la valoración inicial, **cuando** se documente la transición, **entonces** ticket y solicitud cambiarán conjuntamente a `Valorado` y `Pendiente de autorización`.
4. **Dado que** los importes participan en autorización, PDF y Dashboard, **cuando** se serialicen, **entonces** conservarán dos posiciones decimales y serán calculados por el servidor.

## Reglas de negocio

- Solo `Personal de Mantenimiento` registra una valoración.
- Cualquier integrante de mantenimiento puede valorar un ticket disponible en estado `Pendiente`.
- Un ticket tiene como máximo una valoración.
- La valoración exige observaciones no vacías y al menos un material.
- `cantidad` es un entero mayor o igual a `1`.
- `costo_unitario` es decimal y mayor o igual a `0`.
- El servidor determina subtotales y total.
- El estado de la solicitud es `Pendiente de autorización`.
- Los catálogos se consultan y no se crean durante la operación.
- Una valoración enviada no se modifica hasta que E07 permita corregirla por rechazo.
- `historial_ticket` no participa.

## Definition of Ready

- El flujo de registro de tickets de E05 es conocido.
- El esquema vigente y los modelos pueden consultarse.
- Las decisiones consolidadas de E06 y E07 están disponibles.
- Los nombres oficiales de roles y estados están confirmados.
- Las discrepancias del contrato actual están inventariadas.

---

# HU02-E06-Completar API de valoración técnica

## Descripción

**Como** Personal de Mantenimiento,  
**quiero** consultar tickets pendientes y enviar una valoración completa mediante servicios seguros,  
**para** dejar el ticket listo para revisión administrativa sin datos o estados parciales.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Controladores existentes:
  - `backend/app/Http/Controllers/Api/TicketController.php`
  - `backend/app/Http/Controllers/Api/ValoracionController.php`
- Request a corregir:
  - `backend/app/Http/Requests/StoreValoracionRequest.php`
- Requests recomendados:
  - `backend/app/Http/Requests/IndexPendingValuationTicketsRequest.php`
  - `backend/app/Http/Requests/IndexOwnValoracionesRequest.php`
- Servicio recomendado:
  - `backend/app/Services/ValoracionService.php`
- Recursos recomendados:
  - `backend/app/Http/Resources/ValoracionResource.php`
  - `backend/app/Http/Resources/MaterialTicketResource.php`
- Modelos existentes:
  - `backend/app/Models/Ticket.php`
  - `backend/app/Models/Valoracion.php`
  - `backend/app/Models/MaterialTicket.php`
- Rutas en `backend/routes/api.php`:
  - conservar `GET /tickets`;
  - conservar `GET /tickets/{ticket}`;
  - corregir `POST /valoraciones`;
  - conservar y alinear `GET /valoraciones/mis-valoraciones`;
  - retirar la eliminación de materiales por índice posicional del flujo enviado.
- Pruebas recomendadas:
  - `backend/tests/Feature/Valoracion/ValoracionFlowTest.php`
  - factories o helpers de usuarios, tickets, estados y materiales necesarios.

## Impacto en el modelo de datos

No requiere columnas nuevas. Utiliza:

- `tickets.estado_id`
- `solicitudes_materiales.ticket_id`
- `solicitudes_materiales.estado_general`
- `solicitudes_materiales.observaciones`
- `solicitudes_materiales.valorado_por`
- `solicitudes_materiales.fecha_creacion`
- `materiales_ticket.solicitud_id`
- `materiales_ticket.nombre_material`
- `materiales_ticket.cantidad`
- `materiales_ticket.costo_unitario`

Antes de cambiar datos existentes debe auditar:

- solicitudes con `estado_general = Pendiente`;
- solicitudes sin observaciones, autor o fecha;
- materiales con cantidad inválida;
- materiales creados con el contrato anterior.

Si existen filas heredadas, debe crear una migración auditable para normalizar únicamente estados inequívocos de `Pendiente` a `Pendiente de autorización`. No debe inventar cantidades o costos desconocidos ni eliminar datos silenciosamente.

`estado_individual`, `motivo_rechazo` individual, `codigo_material` e `inventario_ref` permanecen sin uso y no se exponen.

## Dependencias

- HU01-E06-Definir contrato de valoración técnica.
- ÉPICA 05 entrega tickets `Pendiente`.
- `CatalogosTicketsSeeder.php` contiene `Pendiente` y `Valorado`.
- Existen usuarios de los cuatro roles para pruebas.
- El responsable Tech Lead entregó ejemplos definitivos de DTO y errores.

## Subtareas

1. **Validar consulta de pendientes** — Extender la consulta de tickets para admitir estado `Pendiente`, búsqueda, área y orden, preservando el alcance de datos por rol y las relaciones necesarias.
2. **Corregir validación de entrada** — Exigir observaciones y entre uno y el máximo contractual de materiales con descripción, cantidad entera y costo unitario decimal válidos.
3. **Implementar registro concurrente** — Mover estado, existencia y unicidad dentro de una transacción con bloqueo del ticket para que solo una solicitud concurrente pueda valorar.
4. **Persistir contrato definitivo** — Mapear `descripcion` a `nombre_material`, guardar cantidad y costo unitario reales, asignar autor y fecha, y omitir campos individuales e inventario.
5. **Aplicar transición oficial** — Consultar `Valorado` del catálogo, fallar si no existe y actualizar ticket y solicitud en la misma transacción.
6. **Estandarizar recursos y cálculos** — Exponer materiales con ID, cantidad, costo unitario, subtotal y total como decimales de dos posiciones calculados por servidor.
7. **Alinear valoraciones propias** — Devolver relaciones y DTO definitivos sin permitir edición o eliminación mientras espera autorización.
8. **Retirar identidad posicional** — Eliminar o desregistrar el endpoint que borra materiales por índice y reservar futuras modificaciones por ID para el reenvío de E07.
9. **Auditar datos heredados** — Reportar filas incompatibles y aplicar solo una normalización reversible o claramente auditable cuando los datos permitan determinar el valor correcto.
10. **Automatizar reglas críticas** — Probar permisos, filtros, contrato, cálculos, estados, unicidad, concurrencia, rollback, catálogos faltantes y ausencia de cambios parciales.

## Criterios de aceptación

1. Personal de Mantenimiento puede consultar tickets `Pendiente` con búsqueda, área y orden admitidos.
2. La consulta de detalle devuelve la información necesaria para inspeccionar el ticket.
3. Un rol distinto no puede registrar una valoración.
4. Un ticket distinto de `Pendiente` no puede valorarse.
5. Un ticket con valoración existente no puede valorarse nuevamente.
6. La petición exige observaciones y al menos un material válido.
7. Cada material persiste descripción, cantidad y costo unitario recibidos.
8. El servidor ignora o rechaza subtotal, total, estado, autor o fecha enviados por el cliente.
9. Un registro correcto deja solicitud `Pendiente de autorización` y ticket `Valorado`.
10. La creación de valoración, materiales y transición ocurre en una sola transacción.
11. Dos intentos concurrentes sobre el mismo ticket producen un solo registro exitoso.
12. La ausencia de `Pendiente` o `Valorado` en el catálogo produce un error controlado y no crea estados.
13. La respuesta incluye ID, descripción, cantidad, costo unitario, subtotal y costo estimado con dos decimales.
14. `GET /valoraciones/mis-valoraciones` devuelve únicamente registros del usuario autenticado.
15. Una valoración enviada no expone una operación de eliminación por índice.
16. Un error no deja solicitud sin materiales, ticket `Valorado` sin valoración o registros parciales.
17. Las pruebas específicas se ejecutan sobre PostgreSQL de pruebas cuando el ambiente de E14 esté disponible.

## Definition of Done

1. **Dado que** existe un ticket `Pendiente` sin valoración, **cuando** Personal de Mantenimiento envíe observaciones y materiales válidos, **entonces** se crearán la solicitud y sus materiales, el ticket quedará `Valorado` y la solicitud `Pendiente de autorización`.
2. **Dado que** un material incluye cantidad y costo unitario, **cuando** la API lo persista y serialice, **entonces** conservará ambos valores y devolverá subtotal y total con dos posiciones decimales.
3. **Dado que** dos usuarios intentan valorar simultáneamente el mismo ticket, **cuando** se procesen las solicitudes, **entonces** solo una finalizará correctamente y la otra recibirá un error controlado sin registros parciales.
4. **Dado que** el usuario carece del rol, el ticket no está pendiente o el payload es inválido, **cuando** la API evalúe la operación, **entonces** la rechazará sin modificar solicitud, materiales o estado.
5. **Dado que** una valoración ya fue enviada, **cuando** el autor consulte sus valoraciones, **entonces** verá el contrato completo sin una operación que elimine materiales por posición.

## Reglas de negocio

- Solo `Personal de Mantenimiento` accede al registro y a sus valoraciones propias.
- El servidor verifica estado, existencia y unicidad dentro de la transacción.
- Un ticket solo admite una fila en `solicitudes_materiales`.
- El autor se obtiene de la sesión y nunca del payload.
- Fecha y estados se obtienen del servidor.
- Debe persistirse al menos un material.
- `descripcion` se guarda en `nombre_material`.
- El cliente no controla subtotal o total.
- Los importes de respuesta conservan dos posiciones decimales.
- `estado_individual` no participa en autorización.
- Los catálogos faltantes producen fallo controlado.
- Los materiales enviados permanecen inmutables hasta el flujo de corrección de E07.

## Definition of Ready

- HU01-E06 está terminada.
- Existen tickets `Pendiente` y usuarios de prueba.
- Los estados oficiales fueron sembrados.
- El esquema real y los datos heredados fueron auditados.
- Existe una base PostgreSQL aislada o un plan aprobado para ejecutar las pruebas allí.

---

# HU03-E06-Valorar tickets desde la interfaz

## Descripción

**Como** Personal de Mantenimiento,  
**quiero** localizar un ticket pendiente, revisar su información y enviar su valoración con materiales,  
**para** preparar una solicitud clara y verificable para la autorización administrativa.

## Prioridad

Muy alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Página recomendada:
  - `frontend/src/modules/tickets/pages/PendingValuationTicketsPage.tsx`
- Página existente a ajustar:
  - `frontend/src/modules/tickets/pages/TicketDetailPage.tsx`
  - `frontend/src/modules/tickets/pages/MisValoracionesPage.tsx`
- Componentes recomendados:
  - `frontend/src/modules/tickets/components/valuation/ValuationForm.tsx`
  - `frontend/src/modules/tickets/components/valuation/MaterialRowsEditor.tsx`
  - `frontend/src/modules/tickets/components/valuation/ValuationSummary.tsx`
- Servicios y tipos:
  - `frontend/src/modules/tickets/services/ticketsService.ts`
  - `frontend/src/modules/tickets/services/valoracionesService.ts`
  - `frontend/src/modules/tickets/types/valuation.ts`
- Rutas y navegación:
  - agregar una ruta protegida para tickets por valorar;
  - conservar acceso al detalle del ticket;
  - conservar `mis-valoraciones`;
  - mostrar las acciones únicamente a `ROLES.PERSONAL_MANTENIMIENTO`.
- Contratos consumidos:
  - consulta de tickets pendientes;
  - detalle de ticket;
  - creación de valoración;
  - valoraciones propias.

## Impacto en el modelo de datos

No modifica directamente el modelo. Envía:

- `ticket_id`
- `observaciones`
- `materiales[].descripcion`
- `materiales[].cantidad`
- `materiales[].costo_unitario`

Consume del servidor ID, estado, autor, fechas, subtotales y total. No envía campos administrativos, de inventario o totales como fuente de verdad.

## Dependencias

- HU01-E06-Definir contrato de valoración técnica.
- HU02-E06-Completar API de valoración técnica.
- Puede iniciar con mocks que respeten exactamente HU01.
- ÉPICA 05 entrega el detalle e información del ticket.
- Backend debe entregar ejemplos de éxito y errores antes de la integración final.

## Subtareas

1. **Crear bandeja de pendientes** — Implementar ruta protegida, navegación, búsqueda, filtro por área, orden, estados de carga, vacío, error y acceso al detalle.
2. **Separar formulario de valoración** — Extraer la captura actual del detalle y mostrarla solo para Personal de Mantenimiento cuando el ticket esté `Pendiente` y no tenga valoración.
3. **Capturar materiales completos** — Permitir agregar, editar y quitar renglones locales con descripción, cantidad y costo unitario, conservando al menos uno.
4. **Mostrar resumen estimado** — Calcular subtotales y total como ayuda visual con formato MXN y aclarar que Backend confirma el importe oficial.
5. **Validar y confirmar envío** — Validar observaciones, materiales y límites; solicitar confirmación, impedir doble envío y usar el DTO definitivo.
6. **Procesar respuesta y errores** — Reflejar el estado `Valorado`, limpiar el formulario solo tras éxito y conservar la captura ante errores recuperables.
7. **Alinear valoraciones propias** — Mostrar materiales con cantidad, costo unitario, subtotal y total sin habilitar eliminación o edición mientras están pendientes.
8. **Mejorar accesibilidad y respuesta visual** — Garantizar etiquetas, teclado, foco, mensajes comprensibles y uso en móvil y escritorio.

## Criterios de aceptación

1. Solo Personal de Mantenimiento visualiza la ruta y acción de valoración.
2. La bandeja muestra exclusivamente tickets pendientes devueltos por el contrato operativo.
3. Búsqueda, área y orden se envían usando los parámetros de HU01.
4. El detalle muestra título, descripción, área, sede, ubicación, prioridad, tipo, reportante, fecha y evidencia inicial disponibles.
5. El formulario solo aparece si el ticket está `Pendiente` y no tiene valoración.
6. Observaciones y al menos un material son obligatorios.
7. Cada material exige descripción, cantidad entera mínima de `1` y costo unitario mínimo de `0`.
8. El usuario puede agregar o quitar renglones antes del envío sin persistir operaciones parciales.
9. Cada subtotal usa cantidad por costo unitario y el total visible suma todos los subtotales.
10. El payload no incluye subtotales, total, estado, autor o fecha.
11. La confirmación bloquea dobles envíos mientras la petición está en curso.
12. Un éxito muestra el ticket `Valorado` y la valoración `Pendiente de autorización`.
13. Un error `422` conserva los datos capturados y muestra campos o reglas que deben corregirse.
14. Mis Valoraciones muestra ID, descripción, cantidad, costo unitario, subtotal y total del servidor.
15. No existe acción para eliminar materiales de una valoración enviada.
16. El recorrido es utilizable mediante teclado y en resoluciones móviles y de escritorio.

## Definition of Done

1. **Dado que** Personal de Mantenimiento consulta la bandeja de pendientes, **cuando** busque, filtre u ordene, **entonces** podrá localizar y abrir un ticket elegible sin visualizar acciones administrativas.
2. **Dado que** el ticket está `Pendiente` y no tiene valoración, **cuando** el usuario capture observaciones y materiales válidos, **entonces** verá subtotales y total estimado antes de confirmar el envío.
3. **Dado que** el usuario confirma una valoración válida, **cuando** Backend responda correctamente, **entonces** la interfaz mostrará el ticket `Valorado`, la solicitud `Pendiente de autorización` y bloqueará un segundo registro.
4. **Dado que** Backend rechaza la petición por validación, estado o concurrencia, **cuando** la interfaz procese el error, **entonces** conservará la captura recuperable, habilitará nuevamente el formulario y comunicará la causa.
5. **Dado que** una valoración ya fue enviada, **cuando** su autor la consulte, **entonces** verá cantidades, costos, subtotales y total sin controles de edición o eliminación.

## Reglas de negocio

- Las guardas frontend complementan y no sustituyen la autorización Backend.
- El formulario no aparece para tickets no pendientes o ya valorados.
- Debe permanecer al menos un renglón válido antes del envío.
- Los renglones se modifican localmente hasta confirmar.
- Los subtotales y el total frontend son informativos.
- El servidor es la fuente oficial de estado e importes.
- El formulario se limpia únicamente después de una respuesta exitosa.
- Una valoración enviada es de solo lectura hasta el flujo de corrección de E07.
- Las acciones permanecen deshabilitadas durante la petición.

## Definition of Ready

- HU01-E06 está aprobada.
- HU02-E06 está disponible o existe un mock aprobado.
- Existen tickets pendientes con catálogos y evidencia representativos.
- Los tipos, mensajes y límites del contrato están definidos.
- Existe una cuenta de Personal de Mantenimiento para integración.

---

# HU04-E06-Validar flujo de valoración técnica

## Descripción

**Como** QA,  
**quiero** validar el flujo completo de valoración, materiales, costos y transición de estados,  
**para** asegurar que ÉPICA 07 reciba solicitudes correctas, seguras y reproducibles.

## Prioridad

Muy alta.

## Responsable único

QA.

## Alcance técnico

- Crear `docs/qa/epica-06-plan-validacion.md`.
- Crear `docs/qa/epica-06-evidencias.md`.
- Revisar pruebas automatizadas de HU02.
- Ejecutar aceptación sobre Backend y Frontend integrados.
- Cubrir roles, propiedad, estado, validaciones, materiales, decimales, unicidad, concurrencia y rollback.
- Ejecutar regresión de creación y consulta de tickets de E05.
- Preparar datos que E07 pueda consumir para autorización y rechazo.
- Ejecutar pruebas, lint y build disponibles.
- Registrar defectos con severidad, evidencia, responsable y estado.
- Emitir dictamen `Aprobada`, `Aprobada con observaciones` o `Requiere correcciones`.

## Impacto en el modelo de datos

No modifica el esquema. Requiere datos controlados en una base de pruebas:

- usuarios de los cuatro roles;
- estados `Pendiente` y `Valorado`;
- tickets pendientes, valorados y no elegibles;
- solicitudes en `Pendiente de autorización`;
- materiales con distintas cantidades y costos decimales;
- intentos concurrentes sobre un mismo ticket.

Las pruebas deben verificar directamente la ausencia de solicitudes, materiales o estados parciales después de un fallo.

## Dependencias

- HU01-E06-Definir contrato de valoración técnica.
- HU02-E06-Completar API de valoración técnica.
- HU03-E06-Valorar tickets desde la interfaz.
- Flujo de tickets de ÉPICA 05 disponible.
- Ambiente integrado y datos aislados de producción.

## Subtareas

1. **Preparar matriz y datos** — Relacionar criterios con casos, roles, tickets, materiales, decimales, resultados esperados y evidencia.
2. **Verificar API automatizada** — Revisar permisos, validaciones, estados, cálculos, concurrencia, catálogos faltantes, rollback y alcance de valoraciones propias.
3. **Ejecutar recorrido funcional** — Probar bandeja, detalle, captura dinámica, resumen, confirmación, éxito, errores y consulta posterior.
4. **Validar precisión y contrato** — Comparar manualmente cantidades, costos, subtotales, total y serialización decimal contra la respuesta Backend.
5. **Ejecutar seguridad y regresión** — Probar los cuatro roles, estados no elegibles, acceso indebido, E05 y disponibilidad de datos para E07.
6. **Emitir dictamen** — Consolidar resultados, comandos, evidencia, defectos, riesgos aceptados y condición final de la épica.

## Criterios de aceptación

1. Cada criterio de HU01–HU03 tiene al menos un caso relacionado.
2. Los cuatro roles se prueban en acceso a consulta, detalle y registro.
3. Solo Personal de Mantenimiento registra exitosamente.
4. Solo tickets `Pendiente` sin valoración aceptan el flujo.
5. Se prueban cero, uno y varios materiales, y únicamente uno o varios válidos concluyen correctamente.
6. Se prueban cantidades cero, negativas, decimales y enteras válidas.
7. Se prueban costos negativos, cero y decimales válidos.
8. Subtotales y total coinciden con un cálculo manual documentado.
9. La respuesta conserva dos posiciones decimales.
10. Dos solicitudes concurrentes crean como máximo una valoración.
11. Un fallo provocado no deja cambios parciales.
12. El endpoint posicional de eliminación no permanece disponible para valoraciones enviadas.
13. La interfaz conserva la captura ante errores recuperables e impide doble envío.
14. La visualización funciona en móvil, escritorio y navegación por teclado.
15. La regresión de creación y consulta de tickets termina correctamente.
16. E07 puede consultar una solicitud `Pendiente de autorización` con materiales completos.
17. No permanecen defectos críticos o altos abiertos para aprobar.

## Definition of Done

1. **Dado que** existen tickets elegibles y no elegibles, **cuando** QA ejecute la matriz con los cuatro roles, **entonces** solo Personal de Mantenimiento podrá valorar una vez un ticket `Pendiente`.
2. **Dado que** una valoración contiene varios materiales, **cuando** QA compare datos de entrada, base y respuesta, **entonces** descripción, cantidad, costo unitario, subtotal y total coincidirán con el contrato.
3. **Dado que** dos solicitudes compiten o una operación falla, **cuando** se revise la persistencia, **entonces** existirá como máximo una valoración completa y no habrá estados o materiales parciales.
4. **Dado que** Backend y Frontend están integrados, **cuando** se ejecute el recorrido completo, **entonces** el ticket terminará `Valorado`, la solicitud `Pendiente de autorización` y E07 podrá consumirla.
5. **Dado que** las pruebas y verificaciones concluyeron, **cuando** QA emita el dictamen, **entonces** incluirá evidencia reproducible, defectos cerrados o aceptados y ausencia de bloqueantes críticos o altos.

## Reglas de negocio

- QA valida tanto la respuesta pública como la persistencia.
- La base de pruebas está aislada de producción.
- El cálculo manual documentado es la referencia monetaria.
- Los defectos de estado, autorización, duplicidad o pérdida de datos son críticos o altos según su impacto.
- Una prueba visual no sustituye la validación Backend.
- E06 no se aprueba si E07 requiere reinterpretar materiales o estado.
- El dictamen de E06 no sustituye la consolidación de E14.

## Definition of Ready

- HU01, HU02 y HU03 están terminadas.
- El ambiente integrado está estable.
- Existen datos para los cuatro roles y estados requeridos.
- Las pruebas automatizadas de HU02 pueden ejecutarse.
- QA conoce los contratos de E05, E06 y la entrada esperada de E07.

---

## Definition of Done de la Épica

1. **Dado que** existe un ticket `Pendiente` sin valoración, **cuando** Personal de Mantenimiento registre observaciones y materiales válidos, **entonces** el ticket quedará `Valorado` y existirá una solicitud `Pendiente de autorización` con su autor, fecha y materiales completos.
2. **Dado que** cada material tiene cantidad y costo unitario, **cuando** el sistema calcule la valoración, **entonces** subtotales y total coincidirán con la suma decimal calculada por Backend y se mostrarán correctamente en Frontend.
3. **Dado que** un usuario, estado, payload o reintento no cumple las reglas, **cuando** intente registrar la valoración, **entonces** Backend impedirá la operación sin dejar solicitudes, materiales o estados parciales.
4. **Dado que** la valoración fue enviada, **cuando** su autor la consulte, **entonces** verá el contrato completo y no podrá modificarla hasta un rechazo administrado por E07.
5. **Dado que** todas las HU están integradas, **cuando** QA ejecute aceptación, concurrencia, regresión, lint y build, **entonces** no existirán defectos críticos o altos abiertos y quedará evidencia reproducible.

## Criterio de cierre

ÉPICA 06 se considera terminada cuando HU01 a HU04 cumplen su Definition of Done y ÉPICA 07 puede consultar una valoración `Pendiente de autorización` con ticket `Valorado`, observaciones, autor, materiales con cantidades y costos unitarios, subtotales y total, sin requerir correcciones adicionales al contrato.

