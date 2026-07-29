# ÉPICA 08 — Ejecución de la reparación

## Identificación

- **Estado real:** Pendiente de implementación funcional; el esquema contiene tablas base sin uso.
- **Prioridad:** Muy alta.
- **Actor funcional principal:** Personal de Mantenimiento.
- **Dependencia principal:** ÉPICA 07 — Autorización administrativa de valoraciones.
- **Enfoque:** MVP operativo para el plazo restante del proyecto.

## Objetivo

Permitir que el Personal de Mantenimiento tome un ticket autorizado, registre el inicio de la reparación, documente el trabajo esencial y finalice la atención con evidencia fotográfica suficiente, manteniendo estados y permisos consistentes con ÉPICA 07.

## Resultado esperado

Al terminar la épica, el sistema debe cubrir este flujo:

1. ÉPICA 07 deja el ticket en estado `Autorizado` y su solicitud de materiales en `Autorizada`.
2. El Personal de Mantenimiento consulta los tickets autorizados disponibles.
3. Un integrante de mantenimiento revisa el estado inicial precargado, lo corrige si es necesario, inicia la reparación y queda registrado como responsable.
4. El ticket cambia de `Autorizado` a `En reparación`.
5. El responsable documenta el proceso, el resultado y las evidencias mínimas.
6. Al finalizar correctamente, el ticket cambia de `En reparación` a `Reparado`.
7. La reparación queda disponible como fuente de datos para el reporte final de ÉPICA 09 y el Archivero Digital de ÉPICA 10.

La solicitud de materiales permanece `Autorizada` durante toda la ejecución. ÉPICA 08 no modifica su estado.

## Alcance esencial

- Bandeja de tickets autorizados y reparaciones propias en curso.
- Inicio transaccional de una reparación.
- Asignación de la reparación al usuario que la inicia.
- Registro de la descripción del proceso y del resultado.
- Una evidencia inicial obligatoria.
- Una evidencia durante la reparación obligatoria.
- Una evidencia final obligatoria.
- Finalización transaccional de la reparación.
- Cambios consistentes del estado del ticket.
- Control de acceso, propiedad, archivos y concurrencia.
- Pruebas del flujo completo.

## Recortes deliberados por tiempo

- No se implementa `historial_ticket`; su auditoría y línea del tiempo quedan para una versión posterior.
- No se desarrolla el Archivero Digital en esta épica; corresponde a ÉPICA 10.
- No se genera el PDF en esta épica. ÉPICA 09 extenderá automáticamente la finalización, sin agregar un botón independiente.
- No se implementan notificaciones dentro de esta épica. Una épica posterior del MVP implementará notificaciones internas; Resend y el correo externo permanecen descartados.
- No se administran inventarios, compras o consumo de materiales.
- No se permite asignar varios integrantes de Personal de Mantenimiento a una reparación.
- No se implementan comentarios, pausas o reapertura de reparaciones.
- No se cargan cantidades ilimitadas de fotografías.
- No se crea un endpoint independiente para cada fotografía.
- La evidencia se envía al finalizar la reparación para reducir operaciones parciales.

Estos recortes no impiden ampliar posteriormente la relación `reparaciones → evidencias_reparacion`.

El flujo completo del MVP queda repartido así: ÉPICA 08 valida y prepara el cierre, ÉPICA 09 genera y guarda el PDF y ÉPICA 10 crea `bitacoras_reparacion`. ÉPICA 08 deja los datos fuente y el punto de integración para automatizar ese cierre, sin intervención adicional del usuario.

## Contraste con la implementación actual

| Capacidad                   | Estado actual         | Pendiente principal                           |
| :-------------------------- | :-------------------- | :-------------------------------------------- |
| Tablas de reparación        | Parcial               | Ajustar campos para inicio y finalización.    |
| Estados del ticket          | Hecho como catálogo   | Implementar sus transiciones.                 |
| Modelos y relaciones        | No implementado       | Crear modelos Eloquent.                       |
| API de reparación           | No implementado       | Crear rutas, requests, servicio y controller. |
| Interfaz de reparación      | No implementado       | Crear página, formulario y servicio.          |
| Evidencias fotográficas     | Estructura sin uso    | Validar, almacenar y consultar archivos.      |
| Historial de transiciones   | Fuera del MVP         | Conservar la tabla sin implementación.        |
| Pruebas específicas         | No implementado       | Agregar pruebas API y evidencia funcional.    |

### Evidencia técnica del contraste

- `reparaciones` y `evidencias_reparacion` existen en las migraciones.
- `reparaciones` exige actualmente textos que todavía no existen al iniciar el trabajo.
- No existe `fecha_inicio`; `fecha_reparacion` puede utilizarse como fecha de finalización.
- Los estados `Autorizado`, `En reparación` y `Reparado` existen en `CatalogosTicketsSeeder.php`.
- No existen `Reparacion.php`, `EvidenciaReparacion.php`, `RepairController.php` ni rutas de reparación.
- No existe una página o servicio frontend para ejecutar reparaciones.

## Estados y transiciones oficiales

| Acción                    | Ticket                          | Solicitud de materiales                          |
| :------------------------ | :------------------------------ | :----------------------------------------------- |
| Autorización en ÉPICA 07  | `Valorado` → `Autorizado`       | `Pendiente de autorización` → `Autorizada`       |
| Iniciar reparación        | `Autorizado` → `En reparación`  | Permanece `Autorizada`                           |
| Finalizar reparación      | `En reparación` → `Reparado`    | Permanece `Autorizada`                           |

No se admiten transiciones distintas dentro del MVP de esta épica.

## Orden y dependencias

| HU   | Responsable único          | Depende de              |
| :--- | :------------------------- | :---------------------- |
| HU01 | Tech Lead                  | HU03-E07                |
| HU02 | Fullstack Backend          | HU01-E08 y HU03-E07     |
| HU03 | Fullstack Frontend/UX-UI   | HU02-E08                |
| HU04 | QA                         | HU02-E08 y HU03-E08     |

HU02 puede iniciar cuando HU01 cierre el contrato. HU03 puede trabajar con mocks aprobados, pero no puede terminar antes de integrar HU02. HU04 inicia cuando el flujo backend y frontend esté integrado.

---

# HU01-E08-Definir contrato de reparación

## Descripción

**Como** Tech Lead,  
**quiero** definir el contrato mínimo de ejecución de reparaciones,  
**para** que backend, frontend y QA implementen un flujo consistente con la autorización administrativa.

## Prioridad

Muy alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/epica-08-contrato-reparaciones.md`.
- Confirmar las transiciones `Autorizado → En reparación → Reparado`.
- Confirmar que la solicitud de materiales permanece `Autorizada`.
- Definir el ajuste de `reparaciones`:
  - `ticket_id`: único y obligatorio para nuevos registros.
  - `realizado_por`: responsable de la ejecución.
  - `estado_inicial`: se precarga con `tickets.descripcion_desperfecto`, puede ser corregido por Personal de Mantenimiento y se guarda al iniciar.
  - `proceso_reparacion`: nullable hasta finalizar.
  - `estado_final`: nullable hasta finalizar.
  - `fecha_inicio`: nueva marca de tiempo.
  - `fecha_reparacion`: fecha de finalización.
- Definir `tipo_evidencia` con los valores técnicos exactos `inicial`, `durante` y `final`.
- Mantener `tipo_evidencia` como `VARCHAR`; no crear catálogo, enum ni identificadores adicionales para el MVP.
- Definir tres campos de carga separados: `evidencia_inicial`, `evidencia_durante` y `evidencia_final`.
- Establecer que Laravel asigna `tipo_evidencia` según el campo recibido; el usuario nunca captura ni selecciona este valor.
- Confirmar los endpoints:
  - `GET /api/reparaciones`
  - `POST /api/tickets/{ticket}/reparacion`
  - `POST /api/reparaciones/{reparacion}/finalizar`
- Definir los DTO, permisos, respuestas y errores.

## Impacto en el modelo de datos

Define el ajuste de:

- `reparaciones`
- `evidencias_reparacion`
- `tickets`

No crea tablas adicionales.

## Dependencias

- HU03-E07-Procesar decisión administrativa debe entregar el estado `Autorizado`.
- Deben existir los estados oficiales en `estados_ticket`.
- Debe conocerse la estructura real desplegada en PostgreSQL/Supabase.

## Subtareas

1. **Definir estados y propiedad** — Documentar las transiciones permitidas y establecer que cualquier integrante de mantenimiento puede tomar un ticket autorizado, pero solo quien lo inicia puede finalizarlo.
2. **Definir ajuste del esquema** — Especificar campos, nulabilidad, fechas y relaciones requeridas para iniciar una reparación antes de capturar su resultado.
3. **Definir contrato API** — Documentar endpoints, DTO, códigos `200`, `201`, `403`, `404` y `422`, y ejemplos mínimos de petición y respuesta.
4. **Definir evidencia y seguridad** — Establecer campos de carga, categorías automáticas, formatos, tamaño, cantidad de archivos, almacenamiento y reglas de eliminación ante fallos.

## Criterios de aceptación

1. El documento contiene estados, responsables, campos, endpoints, DTO y errores.
2. El contrato permite iniciar una reparación sin exigir anticipadamente el proceso o resultado final.
3. El contrato establece una evidencia obligatoria para cada categoría técnica: `inicial`, `durante` y `final`.
4. Cada archivo admite `jpg`, `jpeg`, `png` o `webp` y un máximo de 5 MB.
5. Solo el usuario que inicia la reparación puede finalizarla.
6. El contrato establece que `tipo_evidencia` se asigna automáticamente en backend.
7. El contrato establece que `estado_inicial` se precarga desde el ticket, permanece editable y se valida antes de iniciar.

## Definition of Done

1. **Dado que** ÉPICA 07 entrega un ticket `Autorizado`, **cuando** se consulte el contrato de ÉPICA 08, **entonces** estarán definidas sin ambigüedad las transiciones hasta `Reparado` y sus permisos.
2. **Dado que** el esquema actual exige información que aún no existe al iniciar, **cuando** HU01 termine, **entonces** estará definido un ajuste compatible con el inicio y la finalización separados.
3. **Dado que** el plazo exige un MVP, **cuando** se revise el contrato, **entonces** solo incluirá los archivos, campos y endpoints necesarios para ejecutar y cerrar una reparación de forma segura.

## Reglas de negocio

- Solo `Personal de Mantenimiento` ejecuta reparaciones.
- Un ticket solo puede tener una reparación.
- Iniciar una reparación reclama el ticket para el usuario autenticado.
- `estado_inicial` parte de `tickets.descripcion_desperfecto`, pero Personal de Mantenimiento puede corregirlo antes de confirmar.
- Solo el responsable registrado puede finalizarla.
- `historial_ticket` no participa en el MVP.
- Los estados se obtienen del catálogo y no se crean durante la operación.

## Definition of Ready

- HU03-E07 tiene contrato de autorización aprobado.
- La estructura de las tablas actuales está identificada.
- Los estados oficiales están sembrados.
- Los límites del MVP fueron aceptados.

---

# HU02-E08-Implementar API de reparación

## Descripción

**Como** Personal de Mantenimiento,  
**quiero** consultar, iniciar y finalizar reparaciones autorizadas mediante servicios seguros,  
**para** registrar el trabajo realizado y cerrar correctamente el ticket.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Migración recomendada:
  - `backend/database/migrations/XXXX_XX_XX_XXXXXX_prepare_reparaciones_for_execution.php`
- Modelos nuevos:
  - `backend/app/Models/Reparacion.php`
  - `backend/app/Models/EvidenciaReparacion.php`
- Modelo a relacionar:
  - `backend/app/Models/Ticket.php`
- Requests:
  - `backend/app/Http/Requests/StartRepairRequest.php`
  - `backend/app/Http/Requests/FinishRepairRequest.php`
- Controlador:
  - `backend/app/Http/Controllers/Api/RepairController.php`
- Servicio:
  - `backend/app/Services/RepairService.php`
- Rutas en `backend/routes/api.php`, bajo `role:Personal de Mantenimiento`:
  - `GET /reparaciones`
  - `POST /tickets/{ticket}/reparacion`
  - `POST /reparaciones/{reparacion}/finalizar`
- Almacenamiento:
  - Disco `public`
  - Directorio raíz `evidencias/ticket-{ticket}`
  - Subdirectorios `inicial`, `durante` y `final`

## Impacto en el modelo de datos

La migración debe:

- Agregar `fecha_inicio` nullable.
- Permitir que `proceso_reparacion` y `estado_final` sean null hasta finalizar.
- Conservar `fecha_reparacion` como fecha de finalización.
- Mantener `ticket_id` único y garantizar que los nuevos registros siempre lo informen.
- Conservar la relación uno a muchos con `evidencias_reparacion`.

El flujo actualiza:

- `tickets.estado_id`
- `reparaciones`
- `evidencias_reparacion`

## Dependencias

- HU01-E08-Definir contrato de reparación.
- HU03-E07-Procesar decisión administrativa.
- `php artisan storage:link` configurado en el ambiente.

## Subtareas

1. **Preparar persistencia de reparaciones** — Crear la migración, los modelos y las relaciones con ticket, responsable y evidencias.
2. **Implementar bandeja de reparación** — Devolver tickets `Autorizado` sin reparación y reparaciones `En reparación` pertenecientes al usuario autenticado.
3. **Implementar inicio transaccional** — Validar `estado_inicial`, bloquear el ticket, comprobar `Autorizado`, crear la reparación con el texto confirmado, asignar responsable, registrar `fecha_inicio` y cambiar el ticket a `En reparación`.
4. **Validar finalización** — Crear `FinishRepairRequest.php` para proceso, resultado y los campos `evidencia_inicial`, `evidencia_durante` y `evidencia_final`, y comprobar estado, propiedad y archivos.
5. **Implementar finalización transaccional** — Guardar textos y evidencias, asignar automáticamente `inicial`, `durante` o `final`, establecer `fecha_reparacion` y cambiar el ticket a `Reparado`.
6. **Proteger archivos y consistencia** — Validar tipos y tamaños, usar nombres generados, impedir rutas manipuladas y eliminar archivos almacenados si falla la operación.
7. **Estandarizar rutas y respuestas** — Registrar las rutas protegidas y devolver estructuras uniformes con errores controlados.

## Criterios de aceptación

1. La bandeja contiene tickets autorizados disponibles y reparaciones propias en curso.
2. Un ticket diferente de `Autorizado` no puede iniciar una reparación.
3. Dos usuarios no pueden iniciar exitosamente la misma reparación.
4. Iniciar exige `estado_inicial`, crea un único registro con el texto confirmado, asigna al usuario, establece `fecha_inicio` y cambia el ticket a `En reparación`.
5. Finalizar exige descripción del proceso, resultado y una imagen para cada categoría: inicial, durante y final.
6. Ninguna de las tres categorías de evidencia puede omitirse.
7. Cada categoría admite como máximo un archivo de hasta 5 MB en los formatos aprobados.
8. Solo el responsable puede finalizar la reparación.
9. Finalizar cambia el ticket a `Reparado` y establece `fecha_reparacion`.
10. Un error no deja estados parciales, registros incompletos ni archivos huérfanos.
11. Cada archivo se guarda en `evidencias/ticket-{id}/{tipo}/` y la base de datos conserva únicamente su ruta relativa.

## Definition of Done

1. **Dado que** existe un ticket `Autorizado` sin reparación, **cuando** un usuario de mantenimiento confirme o corrija el estado inicial y lo inicie, **entonces** se guardará el texto definitivo, se creará una única reparación a su nombre y el ticket quedará `En reparación`.
2. **Dado que** una reparación está en curso y pertenece al usuario autenticado, **cuando** envíe las descripciones y las evidencias inicial, durante y final válidas, **entonces** se persistirá la información y el ticket quedará `Reparado`.
3. **Dado que** otro usuario, un estado inválido o un archivo no permitido intenta procesar la reparación, **cuando** la API valide la solicitud, **entonces** rechazará la operación sin modificar datos ni conservar archivos.
4. **Dado que** dos usuarios intentan tomar simultáneamente el mismo ticket, **cuando** se procesen ambas solicitudes, **entonces** solo una podrá crear la reparación.

## Reglas de negocio

- Solo `Personal de Mantenimiento` accede a estas rutas.
- Cualquier integrante de mantenimiento puede iniciar un ticket autorizado disponible.
- `estado_inicial` es obligatorio, se recorta en sus extremos y admite un máximo definido en el contrato.
- El primer usuario que inicia queda como responsable exclusivo.
- Un ticket tiene como máximo una reparación.
- Solo se finaliza desde `En reparación`.
- `proceso_reparacion` y `estado_final` son obligatorios al finalizar.
- Se requiere una evidencia inicial, una durante la reparación y una final.
- Laravel asigna automáticamente `tipo_evidencia`; el cliente no envía una categoría editable.
- Cada archivo admite hasta 5 MB.
- Los archivos no se almacenan con su nombre original.
- Las evidencias se separan físicamente en los directorios `inicial`, `durante` y `final` del ticket.
- `evidencias_reparacion.imagen` contiene una ruta relativa al disco `public`.
- Las operaciones de inicio y finalización son transaccionales.

## Definition of Ready

- HU01 está terminada.
- HU03-E07 entrega tickets correctamente autorizados.
- Existen estados y usuarios de mantenimiento de prueba.
- El disco público y `storage:link` están configurados.
- La migración fue revisada contra PostgreSQL/Supabase.

---

# HU03-E08-Ejecutar reparación desde la interfaz

## Descripción

**Como** Personal de Mantenimiento,  
**quiero** consultar mis trabajos, iniciar una reparación y documentar su finalización,  
**para** completar el proceso operativo desde una interfaz clara y segura.

## Prioridad

Muy alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Página nueva:
  - `frontend/src/modules/repairs/pages/RepairsPage.tsx`
- Servicio nuevo:
  - `frontend/src/modules/repairs/services/repairsService.ts`
- Tipos nuevos:
  - `frontend/src/modules/repairs/types/repair.ts`
- Componente recomendado:
  - `frontend/src/modules/repairs/components/FinishRepairForm.tsx`
- Archivos a modificar:
  - `frontend/src/App.tsx`
  - `frontend/src/layouts/MainLayout.tsx`
- Ruta:
  - `/reparaciones`
- Rol:
  - `ROLES.PERSONAL_MANTENIMIENTO`

## Impacto en el modelo de datos

No modifica directamente el modelo. Consume los contratos de HU02.

## Dependencias

- HU02-E08-Implementar API de reparación.
- Puede iniciar con mocks si respetan el contrato aprobado en HU01.
- El responsable Backend debe entregar ejemplos de respuestas y errores antes de la integración.

## Subtareas

1. **Crear módulo de reparaciones** — Agregar tipos, servicio, ruta protegida y acceso en el menú de Personal de Mantenimiento.
2. **Implementar bandeja operativa** — Mostrar tickets autorizados disponibles y reparaciones propias en curso, con búsqueda local por folio o título.
3. **Implementar inicio de reparación** — Abrir un formulario de confirmación con `tickets.descripcion_desperfecto` precargado, permitir su corrección, consumir el endpoint, bloquear dobles envíos y mover el ticket a la sección en curso.
4. **Crear formulario de finalización** — Capturar proceso y resultado, y mostrar bloques separados para las evidencias obligatorias inicial, durante y final, sin pedir al usuario el tipo.
5. **Validar y previsualizar evidencias** — Mostrar vista previa, permitir reemplazo, validar formato/tamaño y revocar URLs temporales al limpiar el formulario.
6. **Integrar finalización y errores** — Enviar `multipart/form-data`, confirmar la acción, reflejar el estado `Reparado` y conservar la captura ante errores recuperables.

## Criterios de aceptación

1. La ruta y el menú solo están disponibles para Personal de Mantenimiento.
2. La bandeja distingue trabajos autorizados disponibles de reparaciones propias en curso.
3. La búsqueda localiza por folio o título sin requerir filtros adicionales.
4. Iniciar muestra un estado inicial editable y precargado, exige confirmación y no permite doble envío.
5. El formulario exige proceso, resultado y evidencias inicial, durante y final.
6. No se habilita la finalización mientras falte cualquiera de las tres evidencias.
7. Los archivos inválidos se rechazan antes de enviar y los válidos muestran vista previa.
8. Una finalización exitosa retira la reparación de trabajos en curso y muestra confirmación.
9. Los errores `403`, `404` y `422` se muestran sin perder textos o archivos seleccionados cuando sea técnicamente posible.
10. La interfaz funciona en móvil y escritorio.

## Definition of Done

1. **Dado que** existen tickets autorizados, **cuando** el Personal de Mantenimiento abra `/reparaciones` e inicie uno, **entonces** verá la descripción del desperfecto precargada, podrá corregirla y deberá confirmar el estado inicial definitivo.
2. **Dado que** el usuario tiene una reparación propia en curso, **cuando** capture proceso, resultado y las evidencias inicial, durante y final válidas, **entonces** podrá finalizarla y la interfaz reflejará el estado `Reparado`.
3. **Dado que** falta información, un archivo es inválido o la API rechaza la operación, **cuando** la interfaz procese el resultado, **entonces** impedirá un estado visual falso y mostrará una acción de recuperación.

## Reglas de negocio

- La interfaz no sustituye las validaciones del servidor.
- Solo se muestran acciones compatibles con el estado recibido.
- Inicio y finalización requieren confirmación.
- La edición de `estado_inicial` no modifica `tickets.descripcion_desperfecto`.
- Las acciones se deshabilitan durante el procesamiento.
- Se permite una imagen por cada categoría del MVP.
- Las evidencias inicial, durante y final son obligatorias.
- El usuario selecciona archivos en bloques separados y nunca captura `tipo_evidencia`.
- No se muestra historial de reparaciones en esta épica.

## Definition of Ready

- HU02 está disponible o existe un mock aprobado.
- Existe una cuenta de mantenimiento.
- Hay al menos un ticket `Autorizado`.
- Los límites de archivos están definidos.
- El diseño considera móvil y escritorio.

---

# HU04-E08-Validar ejecución de reparación

## Descripción

**Como** responsable de QA,  
**quiero** validar el inicio, documentación y finalización de reparaciones,  
**para** comprobar que el flujo es funcional, seguro y consistente con ÉPICA 07.

## Prioridad

Muy alta.

## Responsable único

QA.

## Alcance técnico

- Prueba backend recomendada:
  - `backend/tests/Feature/RepairFlowTest.php`
- Evidencia funcional recomendada:
  - `docs/evidencias/epica-08/matriz-pruebas.md`
  - `docs/evidencias/epica-08/resultado-pruebas.md`
- Comandos mínimos:
  - `cd backend && php artisan test`
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

El frontend se valida manualmente porque no tiene actualmente un framework de pruebas automatizadas. Agregar uno queda fuera del MVP.

## Impacto en el modelo de datos

Las pruebas deben comprobar:

- `tickets`
- `reparaciones`
- `evidencias_reparacion`

No modifican el esquema productivo.

## Dependencias

- HU02-E08-Implementar API de reparación.
- HU03-E08-Ejecutar reparación desde la interfaz.
- ÉPICA 07 integrada hasta la autorización.
- Ambiente de pruebas con almacenamiento público configurado.

## Subtareas

1. **Preparar matriz y datos** — Relacionar criterios con casos y crear usuarios, tickets y reparaciones en estados controlados.
2. **Automatizar flujo backend** — Probar permisos, inicio, propiedad, concurrencia, asignación automática del tipo de evidencia, archivos, finalización y rollback.
3. **Validar interfaz y archivos** — Probar bandeja, búsqueda, confirmaciones, formulario, vistas previas, responsividad y errores.
4. **Ejecutar regresión y emitir resultado** — Validar ÉPICA 07, ejecutar suite, lint y build, documentar defectos y emitir el dictamen.

## Criterios de aceptación

1. Cada criterio de HU02 y HU03 tiene al menos un caso de prueba.
2. Se prueba el flujo `Autorizado → En reparación → Reparado`.
3. Se verifica que la solicitud de materiales permanezca `Autorizada`.
4. Se comprueban permisos, propiedad y concurrencia con al menos dos usuarios de mantenimiento.
5. Se prueban archivos válidos, formatos inválidos y exceso de tamaño.
6. Se verifica que Laravel asigne exactamente `inicial`, `durante` y `final` a los tres archivos.
7. Se comprueba que un fallo no deje archivos ni registros parciales.
8. Suite backend, lint y build concluyen correctamente.
9. No quedan defectos críticos o altos abiertos.
10. Se comprueba que el estado inicial precargado pueda guardarse sin cambios o corregirse sin alterar la descripción original del ticket.

## Definition of Done

1. **Dado que** el flujo de ÉPICA 08 está integrado, **cuando** QA ejecute la matriz, **entonces** cada criterio tendrá resultado y evidencia reproducible.
2. **Dado que** se prueban estados, roles, propiedad, concurrencia y archivos inválidos, **cuando** una operación no cumpla las reglas, **entonces** el sistema la rechazará sin cambios parciales.
3. **Dado que** se ejecutan regresión y validaciones técnicas, **cuando** no existan defectos críticos o altos y todos los controles obligatorios sean satisfactorios, **entonces** QA podrá aprobar la épica.

## Reglas de negocio

- QA verifica respuesta HTTP, base de datos y almacenamiento.
- Cada defecto se relaciona con una HU y criterio.
- No se aprueba con defectos críticos o altos.
- Las evidencias de prueba no se mezclan con datos productivos.
- Los archivos temporales de prueba se eliminan al finalizar la suite.

## Definition of Ready

- HU02 y HU03 están integradas.
- ÉPICA 07 puede producir un ticket autorizado.
- Existen dos usuarios de mantenimiento para pruebas.
- El ambiente permite guardar y consultar archivos.
- QA conoce el procedimiento para restaurar datos.

---

## Definition of Done de la Épica

1. **Dado que** ÉPICA 07 deja un ticket `Autorizado`, **cuando** un integrante de mantenimiento confirme o corrija el estado inicial e inicie su atención, **entonces** se guardará el texto definitivo, se creará una única reparación, el ticket quedará `En reparación` y se registrará el responsable.
2. **Dado que** el responsable tiene una reparación en curso, **cuando** registre proceso, resultado y evidencias inicial, durante y final válidas, **entonces** el ticket quedará `Reparado` y la reparación tendrá fecha de finalización.
3. **Dado que** un usuario, estado o archivo incumple las reglas, **cuando** intente iniciar o finalizar, **entonces** el sistema rechazará la operación sin datos parciales ni archivos huérfanos.
4. **Dado que** backend y frontend están integrados, **cuando** QA ejecute aceptación, regresión, lint y build, **entonces** no habrá defectos críticos o altos abiertos y quedará evidencia reproducible.

## Criterio de cierre

ÉPICA 08 se considera terminada cuando HU01 a HU04 cumplen su Definition of Done. La existencia previa de tablas o estados no sustituye la implementación funcional.
