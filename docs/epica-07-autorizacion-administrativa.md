# ÉPICA 07 — Autorización administrativa de valoraciones

## Identificación

- **Estado real:** Parcialmente implementada; requiere corrección, terminación y validación.
- **Prioridad:** Muy alta.
- **Actor funcional principal:** Subdirector Administrativo.
- **Actor funcional secundario:** Personal de Mantenimiento.
- **Dependencia funcional:** ÉPICA 06 — Registro de la valoración técnica y solicitud de materiales.

## Objetivo

Permitir que el Subdirector Administrativo consulte una valoración técnica y su solicitud de materiales, y que la autorice o rechace de manera segura y consistente. Si la valoración se rechaza, el Personal de Mantenimiento debe poder corregirla y reenviarla para una nueva revisión.

## Resultado esperado

Al terminar la épica, el sistema debe cubrir el siguiente flujo:

1. El Personal de Mantenimiento registra una valoración con observaciones y al menos un material.
2. El ticket queda en estado `Valorado` y la valoración en estado `Pendiente de autorización`.
3. El Subdirector Administrativo consulta las valoraciones pendientes y revisa su detalle.
4. Si la autoriza, el ticket queda `Autorizado` y la valoración `Autorizada`.
5. Si la rechaza, registra un motivo; el ticket queda `Rechazado` y la valoración `Rechazada`.
6. El Personal de Mantenimiento responsable corrige la valoración rechazada y la reenvía.
7. Al reenviarla, el ticket vuelve a `Valorado` y la valoración a `Pendiente de autorización`.

## Alcance

- Consulta, búsqueda, filtrado y ordenamiento de valoraciones pendientes.
- Consulta del detalle de una valoración.
- Autorización y rechazo administrativo.
- Captura obligatoria del motivo de rechazo.
- Corrección y reenvío de una valoración rechazada.
- Control de acceso por rol y propiedad de la valoración.
- Pruebas del flujo completo y de sus restricciones.

## Fuera de alcance

- Ejecución y cierre de la reparación.
- Gestión de inventario o compra de materiales.
- Notificaciones en tiempo real.
- Auditoría o línea del tiempo mediante `historial_ticket`.
- Pantalla completa de bitácora.
- Generación de PDF.
- Autorización parcial de materiales individuales.

## Contraste con la implementación actual

| Capacidad                 | Estado             | Pendiente principal                         |
| :------------------------ | :----------------- | :------------------------------------------ |
| Consultar pendientes      | Parcial            | Agregar búsqueda, filtros y ordenamiento.   |
| Ver detalle               | Parcial            | Crear un endpoint individual de detalle.    |
| Autorizar                 | Parcial            | Validar estados y concurrencia.             |
| Rechazar                  | Parcial            | Validar la transición y el motivo.          |
| Corregir y reenviar       | No implementado    | Construir el flujo en backend y frontend.   |
| Cantidades de materiales  | Inconsistente      | Alinear contrato, captura y visualización.  |
| Pruebas específicas       | No implementado    | Agregar integración y evidencia funcional.  |

### Evidencia técnica del contraste

- **Consulta:** existen `GET /api/valoraciones/pendientes` y `ValoracionesPorAprobarPage.tsx`.
- **Detalle:** la lista actual carga relaciones y abre un modal, pero no existe un endpoint individual.
- **Autorización:** existe `POST /api/valoraciones/{valoracion}/autorizar`.
- **Rechazo:** existen `POST /api/valoraciones/{valoracion}/rechazar` y `RechazarValoracionRequest`.
- **Corrección y reenvío:** no existe una ruta ni un método para actualizar y reenviar una valoración rechazada.
- **Historial futuro:** `historial_ticket` existe en las migraciones, pero queda fuera del MVP y no se utiliza en esta épica.
- **Cantidades:** `materiales_ticket` contiene `cantidad`, pero el registro actual fija `1` y el DTO no la expone.
- **Pruebas:** `backend/tests` no contiene casos específicos para valoración o autorización.

> **Contrato de entrada desde ÉPICA 06:** cada material se entrega con `id`, `descripcion`, `cantidad`, `costo_unitario` y `subtotal`; la valoración incluye `costo_estimado`. Los importes se serializan como cadenas decimales con dos posiciones. El código actual todavía usa `costo`, fija `cantidad = 1` y omite campos, por lo que debe alinearse mediante HU02-E06 antes de iniciar la integración de HU02, HU04, HU05 o HU06 de esta épica.

## Estados y transiciones oficiales de esta épica

| Acción                    | Ticket                          | Valoración                                       |
| :------------------------ | :------------------------------ | :----------------------------------------------- |
| Registro desde ÉPICA 06   | `Pendiente` → `Valorado`        | No existe → `Pendiente de autorización`          |
| Autorizar                 | `Valorado` → `Autorizado`       | `Pendiente de autorización` → `Autorizada`       |
| Rechazar                  | `Valorado` → `Rechazado`        | `Pendiente de autorización` → `Rechazada`        |
| Corregir y reenviar       | `Rechazado` → `Valorado`        | `Rechazada` → `Pendiente de autorización`        |

No se admiten transiciones diferentes dentro de esta épica.

## Orden y dependencias de implementación

| HU   | Responsable único           | Depende de                     |
| :--- | :-------------------------- | :----------------------------- |
| HU01 | Tech Lead                   | ÉPICA 06                       |
| HU02 | Fullstack Backend           | HU01                           |
| HU03 | Fullstack Backend           | HU01                           |
| HU04 | Fullstack Frontend/UX-UI    | HU02 y HU03                    |
| HU05 | Fullstack Backend           | HU01 y HU03                    |
| HU06 | Fullstack Frontend/UX-UI    | HU05                           |
| HU07 | QA                          | HU02, HU03, HU04, HU05 y HU06  |

### Condiciones para iniciar cada HU

- **HU01:** se conoce el contrato vigente de valoración y materiales de ÉPICA 06.
- **HU02:** el contrato API y los estados definidos en HU01 están aprobados.
- **HU03:** el contrato y las transiciones de HU01 están aprobados. Puede desarrollarse en paralelo con HU02.
- **HU04:** los endpoints de HU02 y HU03 están disponibles o existe un mock con el mismo contrato.
- **HU05:** la transición de rechazo y el contrato de materiales están cerrados.
- **HU06:** el endpoint de reenvío de HU05 está disponible o existe un mock aprobado.
- **HU07:** el flujo integrado está desplegado en el ambiente de pruebas.

---

# HU01-E07-Definir contrato de autorización

## Descripción

**Como** Tech Lead,  
**quiero** definir y aprobar el contrato técnico, las transiciones de estado y los límites de la autorización administrativa,  
**para** que backend, frontend y QA implementen el mismo flujo sin interpretaciones contradictorias.

## Prioridad

Muy alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/epica-07-contrato-autorizacion.md`.
- Definir los DTO de listado, detalle, decisión y reenvío.
- Confirmar los endpoints:
  - `GET /api/valoraciones/pendientes`
  - `GET /api/valoraciones/{valoracion}`
  - `POST /api/valoraciones/{valoracion}/autorizar`
  - `POST /api/valoraciones/{valoracion}/rechazar`
  - `PUT /api/valoraciones/{valoracion}/reenviar`
- Definir los parámetros admitidos por el listado: `search`, `area_id` y `sort`.
- Definir las transiciones oficiales incluidas en esta épica.
- Consumir sin reinterpretar la nomenclatura definida por ÉPICA 06:
  - `id`
  - `descripcion`
  - `cantidad`
  - `costo_unitario`
  - `subtotal`
- Consumir `costo_estimado` y los importes como cadenas decimales con dos posiciones.
- Determinar que el importe total sea calculado en servidor y no aceptado como dato confiable enviado por el cliente.
- Definir los códigos de respuesta mínimos: `200`, `403`, `404` y `422`.

## Impacto en el modelo de datos

No modifica tablas. Define el uso oficial de:

- `solicitudes_materiales`
- `materiales_ticket`
- `tickets`
- `estados_ticket`

## Dependencias

- ÉPICA 06 debe tener definido cómo registra observaciones y materiales.
- El catálogo debe contener `Valorado`, `Autorizado` y `Rechazado` mediante `CatalogosTicketsSeeder.php`.
- Los roles oficiales deben estar disponibles en `tipos_usuarios`.

## Subtareas

1. Levantar el contrato actual de `ValoracionController.php`, `Valoracion.php`, `MaterialTicket.php`, `valoracionesService.ts` y `ticketsService.ts`.
2. Documentar las diferencias entre el contrato actual y el contrato objetivo.
3. Definir ejemplos JSON de petición, respuesta correcta y error para cada endpoint.
4. Definir las transiciones y validaciones de autorización, rechazo y reenvío.
5. Verificar el contrato contra los módulos existentes de backend, frontend y pruebas, y registrar la decisión arquitectónica final.

## Criterios de aceptación

1. El documento especifica campos, tipos, obligatoriedad y nulabilidad de cada DTO.
2. Cada endpoint tiene método HTTP, ruta, rol permitido, petición, respuesta y códigos de error.
3. Las transiciones de ticket y valoración coinciden con la tabla de estados de esta épica.
4. La cantidad, el costo unitario, el subtotal y el total tienen una única interpretación compartida.
5. El documento indica qué historias pueden desarrollarse en paralelo y cuáles están bloqueadas.

## Definition of Done

1. **Dado que** backend, frontend y QA necesitan un contrato común, **cuando** consulten `docs/epica-07-contrato-autorizacion.md`, **entonces** podrán identificar sin información adicional todos los endpoints, DTO, estados, permisos y errores de la épica.
2. **Dado que** el modelo actual maneja de forma inconsistente la cantidad de materiales, **cuando** se apruebe el contrato, **entonces** existirá una decisión explícita y única sobre el nombre, tipo y cálculo de cada campo monetario y de cantidad.
3. **Dado que** las HU posteriores dependen de esta definición, **cuando** el Tech Lead marque HU01 como terminada, **entonces** el documento incluirá dependencias, ejemplos y decisiones suficientes para implementar y verificar cada integración.

## Reglas de negocio

- Solo existen los roles oficiales del proyecto; el rol administrativo es `Subdirector Administrativo`.
- El servidor es la fuente de verdad para permisos, estados, subtotales y total estimado.
- Una valoración administrativa se procesa como unidad; esta épica no autoriza materiales por separado.
- Las decisiones de contrato aprobadas no deben modificarse unilateralmente durante el desarrollo.

## Definition of Ready

- ÉPICA 06 y el esquema vigente pueden consultarse.
- El Tech Lead tiene acceso a los responsables funcionales y técnicos.
- Los estados y roles oficiales están identificados.
- Se conoce la limitación actual relacionada con `cantidad` y `costo`.

---

# HU02-E07-Exponer valoraciones pendientes

## Descripción

**Como** Subdirector Administrativo,  
**quiero** consultar y localizar las valoraciones pendientes y revisar su detalle completo,  
**para** contar con la información necesaria antes de tomar una decisión.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Módulo: `backend/app/Http/Controllers/Api/ValoracionController.php`.
- Rutas: `backend/routes/api.php` dentro de `role:Subdirector Administrativo`.
- Modelo principal: `backend/app/Models/Valoracion.php`.
- Modelo relacionado: `backend/app/Models/MaterialTicket.php`.
- Request recomendado: `backend/app/Http/Requests/IndexValoracionesPendientesRequest.php`.
- Endpoints:
  - `GET /api/valoraciones/pendientes`
  - `GET /api/valoraciones/{valoracion}`
- Filtros del listado:
  - `search`: folio o título del ticket.
  - `area_id`: área registrada.
  - `sort`: `fecha_desc`, `fecha_asc`, `costo_desc` o `costo_asc`.
- El detalle debe incluir ticket, área, sede, usuario reportante, Personal de Mantenimiento responsable de la valoración, observaciones, materiales, subtotales y total estimado.

## Impacto en el modelo de datos

Solo consulta datos. No requiere una migración.

Debe ajustar la serialización de `Valoracion.php` para que cada material incluya `id`, `descripcion`, `cantidad`, `costo_unitario` y `subtotal`. El total debe calcularse con `cantidad * costo_unitario`.

## Dependencias

- HU01-E07-Definir contrato de autorización.
- Contrato de materiales entregado por ÉPICA 06.
- `CatalogosTicketsSeeder.php` ejecutado en el ambiente de desarrollo.

## Subtareas

1. Crear `IndexValoracionesPendientesRequest.php` con reglas para los filtros admitidos.
2. Ajustar `pendientes()` para consultar únicamente `estado_general = Pendiente de autorización` y evitar consultas N+1.
3. Implementar `show(Valoracion $valoracion)` con las mismas relaciones del contrato.
4. Aplicar búsqueda, filtro de área y ordenamiento con valores permitidos.
5. Actualizar los accessors o recursos de `Valoracion.php` para exponer materiales y totales correctamente.
6. Registrar la ruta de detalle bajo el middleware administrativo.
7. Mantener una estructura de respuesta uniforme: `success`, `message` cuando aplique y `data`.

## Criterios de aceptación

1. El listado devuelve exclusivamente valoraciones con `estado_general = Pendiente de autorización`.
2. La búsqueda permite localizar una valoración por folio o título de ticket.
3. El filtro por área y los cuatro ordenamientos definidos producen resultados correctos.
4. El detalle contiene todos los campos aprobados en HU01 y calcula correctamente subtotales y total.
5. Un usuario sin rol `Subdirector Administrativo` recibe `403` en ambos endpoints.
6. Una valoración inexistente devuelve `404`.

## Definition of Done

1. **Dado que** existe una valoración pendiente, **cuando** el Subdirector Administrativo consulte el listado o su detalle, **entonces** la API responderá con los datos completos y los totales calculados conforme al contrato de HU01.
2. **Dado que** existen valoraciones autorizadas o rechazadas, **cuando** se solicite el listado de pendientes, **entonces** esas valoraciones no aparecerán en la respuesta.
3. **Dado que** un usuario autenticado no es Subdirector Administrativo, **cuando** intente consumir cualquiera de los endpoints de esta HU, **entonces** la API responderá `403` sin exponer la información.

## Reglas de negocio

- Solo el Subdirector Administrativo puede consultar la bandeja administrativa.
- El endpoint de detalle es de solo lectura.
- El total estimado no se almacena ni se recibe desde el cliente; se calcula a partir de los materiales.
- Los filtros inválidos producen `422` y no se ignoran silenciosamente.
- La ausencia de resultados produce una colección vacía, no un error.

## Definition of Ready

- HU01 está aprobada.
- Existen valoraciones de prueba en distintos estados y áreas.
- Las relaciones de `Ticket`, `Valoracion` y `MaterialTicket` funcionan.
- Se conoce el formato oficial del folio de ticket.

---

# HU03-E07-Procesar decisión administrativa

## Descripción

**Como** Subdirector Administrativo,  
**quiero** autorizar o rechazar una valoración pendiente,  
**para** permitir el inicio de la reparación o solicitar una corrección fundamentada.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Controlador: `backend/app/Http/Controllers/Api/ValoracionController.php`.
- Request existente a conservar y ajustar: `backend/app/Http/Requests/RechazarValoracionRequest.php`.
- Servicio recomendado: `backend/app/Services/ValoracionAuthorizationService.php`.
- Rutas existentes:
  - `POST /api/valoraciones/{valoracion}/autorizar`
  - `POST /api/valoraciones/{valoracion}/rechazar`
- Tabla de decisiones: `solicitudes_materiales`.
- Tabla del estado operativo: `tickets` mediante `estado_id`.

## Impacto en el modelo de datos

No crea tablas ni utiliza `historial_ticket`.

Cada decisión actualiza de forma transaccional:

- `solicitudes_materiales.estado_general`
- `solicitudes_materiales.motivo_rechazo`
- `solicitudes_materiales.validado_por`
- `solicitudes_materiales.fecha_validacion`
- `solicitudes_materiales.veces_revisada`
- `tickets.estado_id`

La decisión administrativa vigente queda representada en `solicitudes_materiales` mediante estado, motivo, responsable, fecha y contador de revisiones.

## Dependencias

- HU01-E07-Definir contrato de autorización.
- Puede desarrollarse en paralelo con HU02.
- Deben existir los estados oficiales sembrados por `CatalogosTicketsSeeder.php`.
- Debe existir al menos una valoración pendiente con un material válido.

## Subtareas

1. Crear `ValoracionAuthorizationService.php` para concentrar las transacciones de autorizar y rechazar.
2. Validar dentro de la transacción que ticket y valoración conservan los estados previos permitidos.
3. Bloquear la valoración durante la decisión para impedir dos procesamientos concurrentes.
4. Validar que una autorización tenga al menos un material con cantidad válida.
5. Autorizar actualizando valoración, revisor, fecha, contador y ticket.
6. Rechazar validando un motivo no vacío de máximo 500 caracteres y actualizando valoración, revisor, fecha, contador y ticket.
7. Evitar la creación dinámica de estados durante la operación; usar los estados sembrados y fallar de forma controlada si falta un catálogo.
8. Mantener los métodos del controlador limitados a validación, delegación y respuesta HTTP.

## Criterios de aceptación

1. Solo una valoración `Pendiente de autorización` cuyo ticket esté `Valorado` puede autorizarse o rechazarse.
2. Autorizar cambia la valoración a `Autorizada` y el ticket a `Autorizado` en una sola transacción.
3. Rechazar exige un motivo, cambia la valoración a `Rechazada` y el ticket a `Rechazado` en una sola transacción.
4. Cada decisión registra `validado_por`, `fecha_validacion` y el incremento de `veces_revisada`.
5. Una segunda decisión sobre la misma valoración devuelve `422` y no modifica datos.
6. Dos solicitudes concurrentes no pueden procesar exitosamente la misma valoración.
7. Un rol distinto a Subdirector Administrativo recibe `403`.

## Definition of Done

1. **Dado que** una valoración y su ticket se encuentran respectivamente en `Pendiente de autorización` y `Valorado`, **cuando** el Subdirector Administrativo la autorice, **entonces** ambos registros cambiarán a `Autorizada` y `Autorizado` y se registrarán revisor y fecha.
2. **Dado que** una valoración está pendiente, **cuando** el Subdirector Administrativo la rechace con un motivo válido, **entonces** la valoración y el ticket quedarán `Rechazada` y `Rechazado` y se conservarán motivo, revisor y fecha.
3. **Dado que** una decisión ya fue procesada o los estados no coinciden, **cuando** se intente procesarla otra vez, **entonces** la API responderá `422` sin efectuar cambios.
4. **Dado que** ocurre un error al actualizar cualquiera de los registros de la decisión, **cuando** la transacción falle, **entonces** valoración y ticket conservarán su estado previo.

## Reglas de negocio

- Solo el Subdirector Administrativo puede autorizar o rechazar.
- Una valoración debe tener al menos un material válido para ser autorizada.
- El motivo de rechazo es obligatorio, se recorta en sus extremos y admite hasta 500 caracteres.
- `veces_revisada` aumenta una vez por cada decisión administrativa exitosa.
- Los estados se obtienen del catálogo; el flujo no debe crearlos con `firstOrCreate`.

## Definition of Ready

- HU01 está aprobada.
- Las tablas y llaves foráneas involucradas existen.
- Los estados oficiales están sembrados.
- Hay usuarios de prueba con los cuatro roles oficiales.
- Se dispone de una valoración pendiente con materiales.

---

# HU04-E07-Operar bandeja administrativa

## Descripción

**Como** Subdirector Administrativo,  
**quiero** revisar, filtrar y resolver las valoraciones pendientes desde una interfaz clara,  
**para** tomar decisiones informadas sin abandonar la bandeja administrativa.

## Prioridad

Muy alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Página existente: `frontend/src/modules/tickets/pages/ValoracionesPorAprobarPage.tsx`.
- Servicio existente: `frontend/src/modules/tickets/services/valoracionesService.ts`.
- Tipos compartidos existentes: `frontend/src/modules/tickets/services/ticketsService.ts`.
- Ruta existente: `/valoraciones-por-aprobar` en `frontend/src/App.tsx`.
- Guard existente: `ROLES.SUBDIRECTOR_ADMINISTRATIVO`.
- Componentes recomendados:
  - `frontend/src/modules/tickets/components/authorization/ValoracionFilters.tsx`
  - `frontend/src/modules/tickets/components/authorization/ValoracionPendienteCard.tsx`
  - `frontend/src/modules/tickets/components/authorization/ValoracionDetailModal.tsx`
  - `frontend/src/modules/tickets/components/authorization/RechazarValoracionForm.tsx`

## Impacto en el modelo de datos

No modifica el modelo de datos. Consume los contratos de HU02 y HU03.

## Dependencias

- HU02-E07-Exponer valoraciones pendientes.
- HU03-E07-Procesar decisión administrativa.
- Puede iniciar con mocks únicamente si respetan el contrato aprobado en HU01.
- El responsable Backend debe entregar ejemplos de respuesta y errores antes de la integración final.

## Subtareas

1. Actualizar los tipos TypeScript para representar `cantidad`, `costo_unitario`, `subtotal` y total.
2. Extender `valoracionesService.ts` con parámetros de búsqueda, filtro, ordenamiento y consulta de detalle.
3. Separar la página actual en los componentes recomendados para reducir acoplamiento.
4. Implementar búsqueda por folio/título, filtro por área y selector de ordenamiento.
5. Cargar el detalle al seleccionar una valoración y mostrar ticket, ubicación, reportante, Personal de Mantenimiento responsable de la valoración, observaciones, materiales y total.
6. Solicitar confirmación explícita antes de autorizar.
7. Mostrar el formulario de rechazo con contador/límite de 500 caracteres y validación de motivo.
8. Bloquear acciones mientras hay una solicitud en proceso para impedir dobles envíos.
9. Retirar de la bandeja la valoración procesada y mostrar confirmación o error recuperable.
10. Conservar el estado vacío, la carga y los mensajes de error existentes.

## Criterios de aceptación

1. La bandeja solo es accesible visualmente para `Subdirector Administrativo`.
2. La búsqueda, el filtro de área y el ordenamiento usan los parámetros definidos en HU02.
3. El detalle muestra cantidades, costos unitarios, subtotales y total sin recalcular un resultado distinto al servidor.
4. Autorizar requiere confirmación explícita y no permite doble envío.
5. Rechazar no se habilita sin un motivo válido de hasta 500 caracteres.
6. Después de una decisión exitosa, la valoración desaparece de pendientes y se muestra una confirmación.
7. Ante `403`, `404` o `422`, la interfaz conserva un estado consistente y comunica el error.
8. La interfaz funciona en vista móvil y de escritorio conforme al diseño actual.

## Definition of Done

1. **Dado que** el Subdirector Administrativo accede a `/valoraciones-por-aprobar`, **cuando** busca, filtra, ordena y selecciona una valoración, **entonces** la interfaz mostrará los resultados y el detalle entregados por HU02 sin campos ambiguos.
2. **Dado que** el Subdirector confirma una autorización o captura un motivo de rechazo válido, **cuando** ejecuta la acción, **entonces** la interfaz consumirá el endpoint correspondiente de HU03 una sola vez y actualizará la bandeja al recibir éxito.
3. **Dado que** la API devuelve un error de permisos, validación o concurrencia, **cuando** la interfaz reciba la respuesta, **entonces** mostrará un mensaje comprensible, liberará el estado de carga y evitará representar una decisión no confirmada.

## Reglas de negocio

- La interfaz no sustituye las validaciones del servidor.
- El botón de autorización requiere confirmación.
- El rechazo requiere un motivo no vacío y de máximo 500 caracteres.
- Los botones permanecen deshabilitados durante el procesamiento.
- El total mostrado debe provenir del contrato del backend.

## Definition of Ready

- HU02 y HU03 están disponibles en desarrollo o existe un mock aprobado.
- Los DTO y códigos de error de HU01 no tienen cambios pendientes.
- Existe acceso de prueba como Subdirector Administrativo.
- Hay datos con diferentes áreas, fechas y costos.
- El diseño considera móvil y escritorio.

---

# HU05-E07-Reenviar valoración corregida

## Descripción

**Como** Personal de Mantenimiento responsable de una valoración,  
**quiero** corregir una valoración rechazada y reenviarla,  
**para** atender el motivo del rechazo y solicitar una nueva revisión administrativa.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Controlador: `backend/app/Http/Controllers/Api/ValoracionController.php`.
- Request nuevo: `backend/app/Http/Requests/ReenviarValoracionRequest.php`.
- Servicio recomendado: extender `backend/app/Services/ValoracionAuthorizationService.php` o crear `ValoracionResubmissionService.php` si HU01 así lo determina.
- Ruta nueva bajo `role:Personal de Mantenimiento`:
  - `PUT /api/valoraciones/{valoracion}/reenviar`
- Modelos:
  - `backend/app/Models/Valoracion.php`
  - `backend/app/Models/MaterialTicket.php`

El endpoint recibe en una sola operación las observaciones corregidas y la colección completa de materiales. No se utilizará `materialIndex` como identificador para la corrección.

## Impacto en el modelo de datos

No requiere una tabla nueva.

En una transacción:

- Actualiza `solicitudes_materiales.observaciones`.
- Cambia `solicitudes_materiales.estado_general` de `Rechazada` a `Pendiente de autorización`.
- Limpia `motivo_rechazo`, `validado_por` y `fecha_validacion` para iniciar un nuevo ciclo de revisión.
- Reemplaza o sincroniza los registros de `materiales_ticket` de la valoración.
- Cambia el ticket de `Rechazado` a `Valorado`.
- Conserva `veces_revisada`; solo una nueva decisión administrativa vuelve a incrementarla.

## Dependencias

- HU01-E07-Definir contrato de autorización.
- HU03-E07-Procesar decisión administrativa.
- ÉPICA 06 debe haber definido el formato final de los materiales.
- El responsable Backend debe terminar HU03 antes de integrar el nuevo ciclo de revisión.

## Subtareas

1. Crear `ReenviarValoracionRequest.php` con observaciones obligatorias y al menos un material válido.
2. Registrar `PUT /valoraciones/{valoracion}/reenviar` bajo el middleware de Personal de Mantenimiento.
3. Verificar que `valorado_por` coincida con el usuario autenticado.
4. Verificar que la valoración esté `Rechazada` y el ticket `Rechazado`.
5. Actualizar observaciones y sincronizar materiales por ID cuando corresponda, sin aceptar índices posicionales como identidad.
6. Restablecer motivo, revisor y fecha del ciclo de revisión actual.
7. Cambiar los estados de valoración y ticket en la misma transacción.
8. Devolver la valoración actualizada con ticket, estado y materiales.

## Criterios de aceptación

1. Solo el integrante de Personal de Mantenimiento indicado por `valorado_por` puede reenviar su valoración.
2. Solo una valoración `Rechazada` con ticket `Rechazado` puede reenviarse.
3. El payload exige observaciones y al menos un material con descripción, cantidad y costo unitario válidos.
4. Un reenvío exitoso cambia la valoración a `Pendiente de autorización` y el ticket a `Valorado`.
5. Un reenvío exitoso limpia motivo, revisor y fecha del ciclo anterior.
6. Un reenvío inválido devuelve `422` y no deja cambios parciales.
7. Un integrante distinto de Personal de Mantenimiento no puede inferir la existencia de la valoración; recibe `404` o la política definida en HU01.

## Definition of Done

1. **Dado que** una valoración pertenece al Personal de Mantenimiento autenticado y está rechazada, **cuando** envíe observaciones y materiales válidos mediante el endpoint de reenvío, **entonces** la valoración quedará `Pendiente de autorización`, el ticket `Valorado` y se limpiarán los datos de la revisión anterior.
2. **Dado que** una valoración no pertenece al usuario o no está rechazada, **cuando** se intente reenviar, **entonces** la API impedirá la operación sin modificar observaciones, materiales ni estados.
3. **Dado que** ocurre un error al sincronizar los materiales o actualizar el ticket, **cuando** la transacción falle, **entonces** se revertirán todos los cambios del reenvío.

## Reglas de negocio

- Solo el integrante de Personal de Mantenimiento que creó la valoración puede corregirla y reenviarla.
- La corrección y el reenvío constituyen una sola operación atómica.
- Debe existir al menos un material.
- `cantidad` debe ser un entero mayor o igual a 1.
- `costo_unitario` debe ser numérico y mayor o igual a 0.
- El reenvío no incrementa `veces_revisada`.

## Definition of Ready

- HU01 y HU03 están terminadas.
- Existe una valoración rechazada con motivo.
- El contrato final de materiales de ÉPICA 06 está disponible.
- El estado `Valorado` existe en el catálogo.
- Se cuenta con dos usuarios de mantenimiento para comprobar propiedad y acceso.

---

# HU06-E07-Corregir valoración desde mantenimiento

## Descripción

**Como** Personal de Mantenimiento responsable de una valoración rechazada,  
**quiero** consultar el motivo, corregir las observaciones y materiales y reenviar la valoración,  
**para** subsanar las observaciones administrativas desde la interfaz.

## Prioridad

Muy alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Página existente: `frontend/src/modules/tickets/pages/MisValoracionesPage.tsx`.
- Servicio existente: `frontend/src/modules/tickets/services/valoracionesService.ts`.
- Tipos compartidos: `frontend/src/modules/tickets/services/ticketsService.ts`.
- Componente recomendado:
  - `frontend/src/modules/tickets/components/valuation/EditRejectedValoracionModal.tsx`
- Endpoint de HU05:
  - `PUT /api/valoraciones/{valoracion}/reenviar`

## Impacto en el modelo de datos

No modifica directamente el modelo. Envía el DTO aprobado a HU05.

## Dependencias

- HU05-E07-Reenviar valoración corregida.
- HU01-E07-Definir contrato de autorización.
- El responsable Backend debe entregar el endpoint y ejemplos de error antes de la integración final.

## Subtareas

1. Actualizar los tipos TypeScript para materiales con ID, cantidad, costo unitario y subtotal.
2. Agregar `reenviarValoracion()` a `valoracionesService.ts`.
3. Mostrar siempre el motivo cuando la valoración esté `Rechazada`.
4. Mostrar el botón `Corregir y reenviar` únicamente para valoraciones rechazadas del usuario.
5. Crear el modal de edición precargado con observaciones y materiales actuales.
6. Permitir agregar, modificar y quitar materiales conservando al menos uno.
7. Validar descripción, cantidad entera mínima de 1 y costo unitario mínimo de 0.
8. Mostrar subtotales y total durante la edición como ayuda visual, sin enviarlos como fuente de verdad.
9. Solicitar confirmación antes del reenvío y bloquear dobles envíos.
10. Actualizar la tarjeta a `Pendiente de autorización` después del éxito y limpiar el motivo del ciclo activo.
11. Mostrar errores de validación, permisos o estado sin perder la captura del usuario.

## Criterios de aceptación

1. Solo las valoraciones `Rechazada` muestran la acción de corrección.
2. El formulario se abre con observaciones, materiales y motivo de rechazo actuales.
3. No se permite reenviar con observaciones vacías, sin materiales o con cantidades/costos inválidos.
4. El servicio consume exactamente `PUT /valoraciones/{id}/reenviar` con el DTO de HU05.
5. Después del éxito, la interfaz muestra la valoración como `Pendiente de autorización` y ya no ofrece corregirla.
6. Ante un `422`, el usuario conserva su captura y recibe un mensaje que le permite corregirla.
7. La interfaz es utilizable en móvil y escritorio.

## Definition of Done

1. **Dado que** el Personal de Mantenimiento visualiza una valoración propia en estado `Rechazada`, **cuando** abra la corrección, **entonces** verá el motivo y los datos actuales en un formulario editable.
2. **Dado que** el usuario corrige observaciones y materiales con valores válidos, **cuando** confirme el reenvío, **entonces** la interfaz consumirá una sola vez el endpoint de HU05 y reflejará el nuevo estado `Pendiente de autorización` al recibir éxito.
3. **Dado que** la API rechaza el reenvío, **cuando** la interfaz procese el error, **entonces** conservará la captura, habilitará nuevamente las acciones y mostrará un mensaje comprensible.

## Reglas de negocio

- El frontend solo habilita la corrección para una valoración rechazada.
- El motivo de rechazo es de solo lectura.
- Debe permanecer al menos un material antes del reenvío.
- Los subtotales del formulario son informativos; el backend determina el valor oficial.
- Las acciones permanecen bloqueadas durante la petición.

## Definition of Ready

- HU05 está disponible o existe un mock aprobado.
- Se dispone de una cuenta de Personal de Mantenimiento con valoración rechazada.
- Los tipos TypeScript de HU01 están definidos.
- Existen mensajes acordados para errores `403`, `404` y `422`.
- El diseño contempla móvil y escritorio.

---

# HU07-E07-Validar flujo de autorización

## Descripción

**Como** responsable de QA,  
**quiero** validar el flujo completo de autorización, rechazo, corrección y reenvío,  
**para** comprobar que las reglas, permisos, datos y transiciones de la épica funcionan sin regresiones.

## Prioridad

Muy alta.

## Responsable único

QA.

## Alcance técnico

- Pruebas backend recomendadas:
  - `backend/tests/Feature/ValoracionConsultaTest.php`
  - `backend/tests/Feature/ValoracionDecisionTest.php`
  - `backend/tests/Feature/ValoracionReenvioTest.php`
- Evidencia funcional recomendada:
  - `docs/evidencias/epica-07/matriz-pruebas.md`
  - `docs/evidencias/epica-07/resultado-pruebas.md`
- Comandos mínimos:
  - `cd backend && php artisan test`
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

El frontend no tiene actualmente un framework de pruebas automatizadas configurado. Agregarlo queda fuera de esta HU; la interfaz se valida con una matriz manual reproducible y evidencia, mientras el backend se cubre con PHPUnit.

## Impacto en el modelo de datos

Las pruebas deben usar datos controlados y comprobar `tickets`, `solicitudes_materiales` y `materiales_ticket`. No cambian el esquema productivo.

## Dependencias

- HU02-E07-Exponer valoraciones pendientes.
- HU03-E07-Procesar decisión administrativa.
- HU04-E07-Operar bandeja administrativa.
- HU05-E07-Reenviar valoración corregida.
- HU06-E07-Corregir valoración desde mantenimiento.
- Ambiente de pruebas con migraciones y seeders actualizados.

## Subtareas

1. Crear una matriz que relacione cada criterio de aceptación con al menos un caso de prueba.
2. Preparar datos para los cuatro roles oficiales y para cada estado involucrado.
3. Automatizar en PHPUnit consultas, filtros, detalle, permisos, autorización, rechazo, concurrencia lógica, reenvío, propiedad y rollback.
4. Validar manualmente la bandeja administrativa en móvil y escritorio.
5. Validar manualmente la corrección y reenvío en móvil y escritorio.
6. Ejecutar regresión sobre creación y consulta de tickets y creación de valoraciones de ÉPICA 06.
7. Ejecutar pruebas, lint y build y conservar sus resultados.
8. Reportar defectos con pasos, resultado esperado, resultado obtenido y evidencia.
9. Emitir el resultado final de QA únicamente cuando no queden defectos críticos o altos abiertos.

## Criterios de aceptación

1. Todos los criterios de HU02 a HU06 están cubiertos por la matriz.
2. Las pruebas automatizadas verifican cambios de estado, revisor, fecha, persistencia de motivo y ausencia de cambios parciales.
3. Los cuatro roles oficiales se prueban en al menos un escenario de autorización.
4. Se comprueba que solo el integrante de Personal de Mantenimiento autor de la valoración puede reenviarla.
5. Se ejecuta regresión de ÉPICA 06 y del acceso a tickets.
6. Lint, build y suite backend finalizan correctamente o las excepciones quedan justificadas y aprobadas.
7. El resultado final incluye evidencia reproducible y lista de defectos encontrados/cerrados.

## Definition of Done

1. **Dado que** todas las HU de desarrollo de ÉPICA 07 están integradas, **cuando** QA ejecute la matriz completa, **entonces** cada criterio de aceptación tendrá resultado, evidencia y trazabilidad hacia su caso de prueba.
2. **Dado que** se prueban roles, estados y propietarios no autorizados, **cuando** intenten consultar, decidir o reenviar fuera de sus permisos, **entonces** el sistema bloqueará la operación sin alterar datos.
3. **Dado que** se ejecutan las validaciones técnicas y funcionales, **cuando** no existan defectos críticos o altos abiertos y las verificaciones obligatorias concluyan correctamente, **entonces** QA podrá marcar la épica como aprobada.

## Reglas de negocio

- QA no modifica reglas de negocio para hacer pasar una prueba.
- Cada defecto debe relacionarse con una HU y un criterio de aceptación.
- No se aprueba la épica con defectos críticos o altos abiertos.
- Las pruebas deben comprobar tanto la respuesta HTTP como el estado persistido.

## Definition of Ready

- HU02 a HU06 están integradas en un ambiente estable.
- Las migraciones y seeders están actualizados.
- Existen credenciales o datos para los cuatro roles.
- QA dispone del contrato aprobado en HU01.
- Se conocen los comandos de validación y el procedimiento para restaurar datos de prueba.

---

## Definition of Done de la Épica

1. **Dado que** existe una valoración con materiales en estado `Pendiente de autorización` y un ticket `Valorado`, **cuando** el Subdirector Administrativo la consulte y autorice, **entonces** la valoración quedará `Autorizada`, el ticket `Autorizado` y se registrarán revisor y fecha.
2. **Dado que** existe una valoración pendiente de autorización, **cuando** el Subdirector Administrativo la rechace con un motivo y el Personal de Mantenimiento responsable la corrija y reenvíe, **entonces** el flujo regresará coherentemente a valoración `Pendiente de autorización` y ticket `Valorado`.
3. **Dado que** un usuario carece del rol o de la propiedad requerida, **cuando** intente consultar la bandeja, decidir o reenviar una valoración, **entonces** el backend impedirá la operación sin modificar datos y el frontend mostrará un estado de error consistente.
4. **Dado que** todas las HU están integradas, **cuando** QA ejecute pruebas de aceptación, regresión, lint y build, **entonces** no existirán defectos críticos o altos abiertos y quedará evidencia reproducible del resultado.

## Criterio de cierre

La épica puede cambiar de `Parcialmente implementada` a `Terminada` únicamente cuando HU01 a HU07 cumplan su Definition of Done. La existencia previa de código para consulta, autorización o rechazo no sustituye la validación de su HU correspondiente.
