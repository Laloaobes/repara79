# Resumen de traspaso — REPARA-79

> **Actualización operativa:** para terminar ÉPICA 07, comenzar ÉPICA 08 y preparar el despliegue temporal Vercel–Railway–Neon, leer primero `docs/resumen-operativo-e07-e08-despliegue-temporal.md`. Ese documento contiene verificaciones y decisiones posteriores a este resumen.

## Finalidad

Este documento permite continuar el trabajo en un chat nuevo sin depender del historial del chat anterior.

Los siguientes trabajos pendientes son:

1. Refinar las ÉPICAS 02 a 05, en el orden E05 → E04 → E03 → E02, con el mismo estándar aplicado a las ÉPICAS 01 y 06 a 15.
2. Implementar las HU asignadas a Fullstack Backend cuando el usuario lo solicite formalmente.
3. Mantener alineación funcional, técnica y de datos entre todas las épicas.

Antes de actuar en un chat nuevo, se deben leer por completo:

- `docs/resumen-traspaso-repara79.md`
- `docs/decisiones-mvp-epicas-06-15.md`
- la épica específica que se vaya a refinar o implementar;
- los archivos reales del módulo afectado;
- `database-design/repara79_schema_actual.sql` como referencia histórica, considerando las diferencias descritas aquí.

## Datos del proyecto

- **Proyecto:** REPARA-79.
- **Repositorio local:** `C:\Users\bsml2\Documents\Repositorios\repara79`
- **Rama actual al generar este resumen:** `develop`.
- **Backend:** Laravel 12, PHP 8.3 objetivo, Sanctum y PostgreSQL.
- **Frontend:** React 19, TypeScript, Vite 6 y Tailwind CSS.
- **Despliegue objetivo:** Ubuntu Server 24.04 LTS, Nginx, PHP-FPM, PostgreSQL, Supervisor y Laravel Reverb.
- **Servidor objetivo:** Dell PowerEdge T110 II, Intel Xeon E3-1220 V2, 8 GB RAM y HDD de 1 TB.
- **Red objetivo:** red local autorizada del CBTA 79.
- **Idioma de trabajo y documentación:** español.

## Estado del árbol de trabajo

Al generar este resumen, los documentos refinados y el SQL de referencia aparecen como archivos no rastreados por Git:

- `database-design/repara79_schema_actual.sql`
- `docs/decisiones-mvp-epicas-06-15.md`
- `docs/epica-01-planeacion-proyecto.md`
- `docs/epica-06-valoracion-tecnica.md`
- `docs/epica-07-autorizacion-administrativa.md`
- `docs/epica-08-ejecucion-reparacion.md`
- `docs/epica-09-informe-final-pdf.md`
- `docs/epica-10-bitacora-archivero-digital.md`
- `docs/epica-11-notificaciones-internas.md`
- `docs/epica-12-administracion-sistema.md`
- `docs/epica-13-dashboard-estadisticas.md`
- `docs/epica-14-aseguramiento-calidad.md`
- `docs/epica-15-infraestructura-despliegue.md`
- `docs/resumen-operativo-e07-e08-despliegue-temporal.md`

Estos archivos contienen trabajo del usuario y del proceso de refinación. Deben preservarse y no eliminarse, restaurarse o sobrescribirse sin autorización.

No se implementó código funcional durante el refinamiento de las ÉPICAS 07 a 15.

## Equipo y roles de planeación

La planeación utiliza exactamente estos responsables:

- `Tech Lead`
- `Fullstack Backend`
- `Fullstack Frontend/UX-UI`
- `QA`

Cada HU tiene un único responsable. Una HU no debe mezclar subtareas cuya ejecución corresponda a roles distintos.

El equipo documentado en el repositorio es:

- José Ismael Montalvo López — Frontend Developer & UI Designer.
- Juan Andrés Medina González — Backend Developer.
- Lezama Zarate Eduardo — DevOps & Backend Support.
- Matías Lira Breyan Sebastián — QA & Integrador.

El usuario indicó que su equipo es responsable de implementar las HU de Fullstack Backend y solicitará formalmente apoyo para programarlas.

## Roles funcionales oficiales

Se deben utilizar siempre estos nombres:

- `Subdirector Administrativo`
- `Personal de Mantenimiento`
- `Responsable del Lugar`
- `Usuario Registrado`

No se debe usar `Técnico` como nombre de rol. Expresiones funcionales como `valoración técnica` o `informe técnico` sí son válidas.

## Estructura obligatoria de cada HU

Cada HU debe contener:

1. Título.
2. Descripción en formato:
   - Como
   - quiero
   - para
3. Prioridad.
4. Responsable único.
5. Alcance técnico.
6. Impacto en el modelo de datos.
7. Dependencias.
8. Subtareas.
9. Criterios de aceptación.
10. Definition of Done.
11. Reglas de negocio.
12. Definition of Ready.

La nomenclatura oficial es:

`HUxx-Exx-Nombre corto descriptivo`

Ejemplo:

`HU02-E08-Implementar API de reparación`

Las subtareas deben:

- tener un título descriptivo breve;
- utilizar la subtarea previamente redactada como descripción;
- no incluir prefijos `ST01`, `ST02` o similares en el título;
- ser únicamente las necesarias;
- indicar archivos, módulos, rutas, datos o entregables cuando corresponda.

Cada Definition of Done debe utilizar exactamente la estructura:

`Dado que ..., cuando ..., entonces ...`

## Criterios de refinación

- Una HU pertenece a un solo responsable.
- Las dependencias entre Backend, Frontend, QA y Tech Lead deben quedar explícitas.
- Si Backend define un endpoint, la HU Frontend relacionada debe mencionarlo.
- Si una HU modifica datos, debe indicar tablas, campos, nulabilidad, índices, relaciones o migraciones.
- Si una HU crea código, debe recomendar módulos, rutas, archivos y nombres.
- Las reglas de seguridad deben residir en Backend; las restricciones visuales de Frontend no las sustituyen.
- Se deben evitar HU y subtareas redundantes.
- El alcance debe proteger funcionalidad, estabilidad, escalabilidad razonable y seguridad sin convertir el MVP en un producto empresarial.
- El horizonte comunicado fue de aproximadamente dos semanas para terminar el trabajo desde E07 hasta E15, aunque la auditoría concluyó que cumplir todas las HU y DoD actuales requiere más tiempo.

## Numeración definitiva de ÉPICAS 07 a 15

1. **ÉPICA 07 — Autorización administrativa de valoraciones.**
2. **ÉPICA 08 — Ejecución de la reparación.**
3. **ÉPICA 09 — Generación del Informe Final de Mantenimiento (PDF).**
4. **ÉPICA 10 — Bitácora de Mantenimiento / Archivero Digital de Reparaciones Exitosas.**
5. **ÉPICA 11 — Sistema de Notificaciones Internas.**
6. **ÉPICA 12 — Administración del Sistema.**
7. **ÉPICA 13 — Estadísticas y Dashboard Avanzado.**
8. **ÉPICA 14 — Aseguramiento de Calidad.**
9. **ÉPICA 15 — Infraestructura y Despliegue Institucional.**

Resend ocupaba una propuesta anterior de ÉPICA 09, pero fue eliminado. No debe recuperarse esa numeración o funcionalidad.

## Documentos refinados

| Épica | Documento |
| :---- | :-------- |
| E01 | `docs/epica-01-planeacion-proyecto.md` |
| E06 | `docs/epica-06-valoracion-tecnica.md` |
| E07 | `docs/epica-07-autorizacion-administrativa.md` |
| E08 | `docs/epica-08-ejecucion-reparacion.md` |
| E09 | `docs/epica-09-informe-final-pdf.md` |
| E10 | `docs/epica-10-bitacora-archivero-digital.md` |
| E11 | `docs/epica-11-notificaciones-internas.md` |
| E12 | `docs/epica-12-administracion-sistema.md` |
| E13 | `docs/epica-13-dashboard-estadisticas.md` |
| E14 | `docs/epica-14-aseguramiento-calidad.md` |
| E15 | `docs/epica-15-infraestructura-despliegue.md` |

Las ÉPICAS 01 y 06 ya fueron refinadas. Las ÉPICAS 02 a 05 todavía deben revisarse en el orden E05 → E04 → E03 → E02.

## Flujo funcional oficial del MVP

```text
Usuario Registrado crea ticket
             ↓
Ticket Pendiente
             ↓
Personal de Mantenimiento registra valoración y materiales
             ↓
Ticket Valorado
Solicitud Pendiente de autorización
             ↓
Subdirector Administrativo decide
     ┌───────┴────────┐
     │                │
 Autoriza          Rechaza
     │                │
Ticket Autorizado  Ticket Rechazado
Solicitud          Solicitud Rechazada
Autorizada             │
     │                 ↓
     │          Corrección y reenvío
     │                 │
     │          Ticket Valorado
     │          Solicitud Pendiente de autorización
     ↓
Personal de Mantenimiento inicia reparación
             ↓
Ticket En reparación
             ↓
Registra proceso, resultado y evidencias
             ↓
Genera PDF
             ↓
Crea bitácora del Archivero
             ↓
Confirma transacción y Ticket Reparado
             ↓
Emite reparacion_finalizada después del commit
             ↓
notifications + REST + Reverb
```

## Decisiones funcionales y técnicas consolidadas

### ÉPICA 06 — Valoración técnica

- E06 cubre el registro completo de la valoración y solicitud de materiales.
- El ticket parte de `Pendiente`.
- Personal de Mantenimiento consulta e inspecciona el ticket.
- Registra observaciones y al menos un material.
- Pulsar `Crear valoración técnica` con datos válidos abre una confirmación y aún no invoca la API.
- `Cancelar` cierra la confirmación, conserva la captura para corregirla y no persiste cambios.
- `Confirmar` ejecuta un único envío; tras una respuesta exitosa:
  - el ticket cambia a `Valorado`;
  - `solicitudes_materiales.estado_general` queda `Pendiente de autorización`.
- La valoración enviada queda sin edición hasta que E07 registre un rechazo con motivo.
- El material debe manejar una cantidad y un costo unitario reales.
- El contrato actual del código todavía usa `descripcion` y `costo`, fija cantidad en uno y requiere corrección.
- La tabla física utiliza `nombre_material`, `cantidad` y `costo_unitario`.
- El DTO público conserva `descripcion` como alias de `nombre_material`.

### ÉPICA 07 — Autorización administrativa

- Solo el Subdirector Administrativo decide.
- Autorizar:
  - solicitud `Autorizada`;
  - ticket `Autorizado`.
- Rechazar:
  - exige motivo;
  - solicitud `Rechazada`;
  - ticket `Rechazado`.
- Solo el integrante de Personal de Mantenimiento autor de la valoración puede corregir y reenviar.
- Reenviar:
  - solicitud `Pendiente de autorización`;
  - ticket `Valorado`;
  - limpia motivo, revisor y fecha del ciclo anterior;
  - conserva `veces_revisada`.
- La decisión es atómica y la solicitud se procesa como una unidad.
- `historial_ticket` no participa.
- E07 ya fue trasladada a ClickUp y el usuario indicó que la actualizará usando su versión refinada.
- En el documento local, las subtareas de E07 todavía usan oraciones numeradas en lugar del formato título más descripción utilizado en E08–E15.

### ÉPICA 08 — Reparación y evidencias

- Un ticket `Autorizado` puede ser tomado por cualquier integrante de Personal de Mantenimiento.
- El primero que lo inicia queda como responsable exclusivo.
- Un ticket tiene como máximo una reparación.
- Transiciones:
  - `Autorizado → En reparación → Reparado`.
- `estado_inicial`:
  - se precarga desde `tickets.descripcion_desperfecto`;
  - el usuario puede corregirlo antes de iniciar;
  - la corrección se guarda en `reparaciones.estado_inicial`;
  - no modifica el ticket original.
- Se agrega `fecha_inicio`.
- `fecha_reparacion` representa la finalización.
- `proceso_reparacion` y `estado_final` deben ser nullable hasta cerrar.
- Evidencias obligatorias:
  - una `inicial`;
  - una `durante`;
  - una `final`.
- Formatos: `jpg`, `jpeg`, `png`, `webp`.
- Tamaño máximo: 5 MB por imagen.
- Laravel asigna `tipo_evidencia`; el usuario no lo selecciona.
- Las rutas se guardan de forma relativa.
- La conversión automática a WebP fue diferida.

### ÉPICA 09 — Informe PDF

- El PDF se genera automáticamente durante el cierre.
- No existe un botón o endpoint para generarlo o regenerarlo manualmente.
- Si la generación o almacenamiento falla:
  - no se confirma el cierre;
  - se eliminan archivos parciales.
- Ruta:
  - `reportes/ticket-{id}/reporte-reparacion-ticket-{id}.pdf`
- El contenido usa únicamente información ya persistida.
- Incluye:
  - encabezado institucional;
  - ticket;
  - valoración;
  - `Materiales autorizados`;
  - reparación;
  - evidencias inicial, durante y final;
  - Personal de Mantenimiento responsable;
  - pie de página.
- No utiliza `historial_ticket`.
- La descarga usa un endpoint autenticado.
- El frontend recupera el archivo como `Blob` y no construye una URL bajo `/storage`.

### ÉPICA 10 — Archivero Digital

- `bitacoras_reparacion` representa un índice documental, no un historial de eventos.
- Se crea automáticamente después de generar el PDF.
- No existe endpoint para crear, editar o eliminar bitácoras.
- Una bitácora corresponde exactamente a un ticket y una reparación.
- Campos oficiales:
  - `ticket_id`
  - `reparacion_id`
  - `titulo`
  - `descripcion_final`
  - `archivo_pdf`
  - `generado_por`
  - `fecha_generacion`
- Título:
  - `Ticket #{id} - {titulo del ticket}`
- `titulo` debe ampliarse a 255 caracteres.
- Los siete campos deben ser obligatorios.
- `ticket_id` y `reparacion_id` deben ser únicos.
- Permisos:
  - Subdirector: todos.
  - Personal de Mantenimiento: reparaciones propias.
  - Responsable del Lugar: áreas activas.
  - Usuario Registrado: sin acceso.
- Si falla el archivado, se revierte el cierre y se elimina el PDF del intento.

### ÉPICA 11 — Notificaciones internas

- No utiliza correo ni servicios externos.
- Tabla activa: tabla estándar `notifications` de Laravel.
- `notifications.data` usa JSONB.
- La tabla heredada `notificaciones` no se reutiliza.
- Antes de eliminarla:
  - se auditan sus filas;
  - si contiene datos, la migración se detiene;
  - nunca se eliminan datos heredados silenciosamente.
- Evento inicial: `reparacion_finalizada`.
- Solo ocurre después de confirmar:
  - reparación;
  - ticket `Reparado`;
  - PDF;
  - bitácora;
  - commit.
- Destinatarios:
  - todos los Subdirectores Administrativos activos;
  - Responsables del Lugar activos asociados al área mediante `usuario_area.activo = true`.
- Excluidos:
  - Personal de Mantenimiento originador;
  - Usuario Registrado.
- Canales:
  - persistencia obligatoria `database`;
  - consulta y lectura por REST;
  - actualización inmediata por `broadcast`, cola, Reverb y Echo.
- Cada usuario consulta y modifica solo sus propias notificaciones.
- Si Reverb falla, REST conserva la funcionalidad.
- Pendiente técnico antes de implementar:
  - definir cómo garantizar que `database` persista aunque el worker esté detenido;
  - encolar únicamente el broadcast o configurar conexiones por canal;
  - definir una garantía concurrente de idempotencia para destinatario + `event_key`, porque el valor está dentro de JSONB y no se especificó un índice único.

### ÉPICA 12 — Administración

- Puede haber varios Subdirectores Administrativos activos.
- Siempre debe permanecer al menos uno.
- Un Subdirector no cambia su propio rol ni desactiva su cuenta.
- Administración no crea usuarios ni administra contraseñas.
- El registro crea cuentas como `Usuario Registrado`.
- Las cuentas pueden activarse o desactivarse.
- Desactivar revoca tokens.
- Un área puede tener varios Responsables del Lugar.
- Un Responsable del Lugar puede pertenecer a varias áreas.
- `usuario_area` es la fuente oficial.
- Si una cuenta deja de ser Responsable del Lugar, sus asignaciones activas se desactivan.
- Sedes, áreas, tipos de desperfectos y prioridades permiten creación y edición.
- No se eliminan cuentas ni catálogos.
- `estados_ticket` y `tipos_usuarios` son de solo lectura.
- Las estadísticas pertenecen a E13.

### ÉPICA 13 — Dashboard

- Las estadísticas globales son exclusivas del Subdirector Administrativo.
- Otros roles conservan su Dashboard básico.
- Las agregaciones se calculan en PostgreSQL, no sobre la lista completa en React.
- Endpoint:
  - `GET /api/dashboard/administrativo`
- Incluye:
  - total;
  - pendientes;
  - en reparación;
  - reparados;
  - costo estimado de materiales autorizados;
  - distribución completa por estado;
  - distribución dinámica por prioridad;
  - cinco áreas con más tickets;
  - cinco tickets recientes.
- Filtros:
  - fecha inicial;
  - fecha final;
  - sede;
  - área.
- Todos los indicadores usan el mismo conjunto filtrado.
- El costo:
  - incluye solo solicitudes `Autorizada`;
  - usa `cantidad × costo_unitario`;
  - no representa gasto real.
- No se agrega librería de gráficas.

### ÉPICA 14 — Aseguramiento de Calidad

- Consolida y certifica la calidad de E06–E13.
- No reemplaza las pruebas propias de cada épica.
- Tech Lead define:
  - plan;
  - matriz;
  - ambientes;
  - compuerta de liberación.
- Backend usa PHPUnit y PostgreSQL exclusivo de pruebas.
- Frontend incorpora:
  - Vitest;
  - React Testing Library;
  - `jsdom`.
- QA ejecuta aceptación, regresión, incidencias y dictamen.
- No se exige 100 % de cobertura.
- No se incorpora Playwright o Cypress.
- Un defecto crítico o alto bloquea la liberación.
- E15 requiere dictamen `Aprobado`.
- Para ahorrar tiempo, las pruebas deben construirse durante cada HU y E14 debe consolidarlas, no repetirlas desde cero.

### ÉPICA 15 — Infraestructura y despliegue

- Ubuntu Server 24.04 LTS actualizado.
- Nginx es el único punto de entrada.
- React se sirve como build estático.
- Vite no se ejecuta en producción.
- API bajo `/api`.
- Reverb escucha localmente y Nginx proxifica `/app` y `/apps`.
- PostgreSQL escucha localmente.
- PHP-FPM usa socket Unix.
- Worker y Reverb se supervisan con Supervisor.
- `APP_ENV=production`.
- `APP_DEBUG=false`.
- No se guardan secretos en Git.
- El seeder actual que crea una cuenta administrativa con credenciales fijas debe retirarse o sustituirse.
- El acceso directo a evidencias y reportes bajo `/storage` debe bloquearse.
- La aplicación usa endpoints autenticados.
- Estructura recomendada:
  - releases;
  - symlink `current`;
  - `.env` y storage compartidos;
  - release anterior disponible.
- El respaldo incluye:
  - PostgreSQL;
  - evidencias;
  - PDF;
  - inventario de versión.
- Un respaldo en el mismo HDD no cuenta como válido.
- Política mínima:
  - diaria;
  - siete copias diarias;
  - cuatro semanales;
  - copia fuera del HDD;
  - restauración aislada verificada.
- Certbot solo se usa si existe un dominio validable.
- El servidor no se expone a Internet durante el MVP.

## Flujo transaccional E08–E11

El orden oficial es:

1. Validar reparación, propiedad, textos y tres evidencias.
2. Preparar ticket `Reparado` y fecha de finalización dentro de una transacción.
3. Generar y almacenar el PDF.
4. Crear `bitacoras_reparacion`.
5. Confirmar la transacción.
6. Eliminar archivos parciales si ocurre un error previo.
7. Después del commit, persistir notificaciones.
8. Transmitir el broadcast mediante cola y Reverb.

Una falla de broadcast nunca revierte el cierre.

## Estado real del código

Al generar este resumen:

- E07 está implementada parcialmente.
- E08–E11 no tienen implementación funcional.
- E12 tiene consulta de usuarios y cambio básico de rol.
- E13 tiene un Dashboard básico que calcula datos en frontend.
- E14 solo tiene pruebas de ejemplo.
- E15 no tiene scripts o configuración de infraestructura versionados.

Rutas API actuales relevantes:

- autenticación y perfil;
- catálogos de tickets;
- listado, alta y detalle de tickets;
- registro y consulta de valoraciones propias;
- eliminación de material mediante índice posicional;
- listado de valoraciones pendientes;
- autorización y rechazo;
- consulta y modificación básica de usuarios.

Problemas actuales importantes:

- `ValoracionController` usa `estado_general = 'Pendiente'`, pero el objetivo es `Pendiente de autorización`.
- Los estados se crean durante operaciones con `firstOrCreate`; el objetivo es usar catálogos sembrados y fallar si falta uno.
- Los materiales actuales:
  - reciben `descripcion` y `costo`;
  - guardan `nombre_material`;
  - fijan `cantidad = 1`;
  - serializan sin cantidad ni ID.
- La eliminación de materiales utiliza un índice posicional.
- No existe endpoint individual de valoración ni reenvío.
- No hay modelos o servicios de reparación, evidencias, PDF, bitácora o notificaciones.
- `backend/.env.example` usa modo local, debug y SQLite.
- `frontend/src/api/axios.ts` cae a `http://localhost:8000/api`.
- `frontend/.env.example` conserva variables de Gemini.
- CORS solo incluye orígenes locales de desarrollo.
- `UsuarioSubdirectorSeeder.php` utiliza credenciales fijas de desarrollo.
- No están instalados:
  - biblioteca PDF;
  - Laravel Reverb;
  - Laravel Echo;
  - `pusher-js`;
  - Vitest;
  - Testing Library.
- Solo existen:
  - `backend/tests/Feature/ExampleTest.php`;
  - `backend/tests/Unit/ExampleTest.php`.

## Diferencias del SQL de referencia

`database-design/repara79_schema_actual.sql` representa el esquema de referencia previo a terminar las épicas posteriores.

Todavía contiene:

- `notificaciones`, que E11 sustituirá por `notifications`;
- `reparaciones.proceso_reparacion` y `estado_final` obligatorios, que E08 hará nullable durante el inicio;
- ausencia de `reparaciones.fecha_inicio`;
- `bitacoras_reparacion` con campos nullable;
- `bitacoras_reparacion.titulo` de 150 caracteres;
- ausencia de unicidad en ticket y reparación de bitácora.

No se debe reescribir la historia de migraciones de un ambiente con datos. Las diferencias se resuelven mediante nuevas migraciones auditables.

## Hallazgos de la auditoría final

Las épicas están alineadas funcionalmente y no existen referencias a HU inexistentes.

Volumen total:

- 43 HU.
- 242 subtareas.
- 509 criterios de aceptación.

Distribución aproximada:

- Fullstack Backend: 13 HU.
- Fullstack Frontend/UX-UI: 11 HU.
- Tech Lead: 10 HU.
- QA: 9 HU.

El plazo de dos semanas no es realista para cumplir todo el contenido y todos los DoD desde el estado actual.

El principal cuello de botella es Backend porque controla la ruta:

`E07 → E08 → E09 → E10 → E11`

Frontend puede avanzar con mocks y QA con matrices, pero la integración depende de datos, endpoints, transacciones, archivos y permisos de Backend.

Una estimación conservadora anterior ubicó el alcance completo entre 45 y 65 persona-días, sin incluir retrasos externos de infraestructura.

## Orden recomendado para implementar Backend

Cuando el usuario solicite formalmente programación:

1. Inspeccionar el estado real y cambios locales antes de editar.
2. Trabajar una HU Backend claramente delimitada.
3. Implementar pruebas de esa HU en el mismo ciclo.
4. Entregar contrato y ejemplos a Frontend cuanto antes.
5. Ejecutar regresión proporcional.
6. No esperar a E14 para comenzar pruebas.

Ruta crítica:

1. HU Backend de E07:
   - consulta/detalle;
   - decisión administrativa;
   - corrección y reenvío.
2. HU Backend de E08:
   - reparación y tres evidencias.
3. HU Backend de E09:
   - PDF y descarga protegida.
4. HU Backend de E10:
   - archivado y consultas.
5. HU Backend de E11:
   - persistencia REST;
   - Reverb y broadcast.
6. E12:
   - cuentas/roles/áreas;
   - catálogos.
7. E13:
   - estadísticas.
8. E14:
   - consolidación de pruebas backend.
9. E15:
   - PostgreSQL, procesos, respaldo y health check.

## Procedimiento esperado para una solicitud de programación

Ante una solicitud como “implementa HU03-E07”:

1. Leer la HU completa.
2. Revisar el contrato de su HU Tech Lead dependiente.
3. Inspeccionar rutas, modelos, requests, controladores, servicios, migraciones y pruebas existentes.
4. Revisar el árbol Git y preservar cambios ajenos.
5. Identificar discrepancias entre la HU y el código actual.
6. Implementar únicamente el alcance autorizado.
7. Crear o actualizar pruebas.
8. Ejecutar:
   - pruebas específicas;
   - suite relacionada;
   - formato o lint aplicable.
9. Reportar:
   - resultado;
   - archivos cambiados;
   - pruebas ejecutadas;
   - decisiones tomadas;
   - dependencias entregables para Frontend y QA;
   - riesgos o pendientes reales.

No se deben implementar varias HU implícitamente si la solicitud solo autoriza una, salvo pasos técnicos inseparables y claramente explicados.

## Procedimiento para refinar ÉPICAS 02 a 05

Para cada épica:

1. Solicitar o leer el documento original.
2. Contrastarlo con:
   - código;
   - modelo de datos;
   - decisiones de este resumen;
   - dependencias con la épica anterior y posterior.
3. Identificar qué está:
   - hecho;
   - parcial;
   - faltante;
   - incorrecto.
4. Recortar funcionalidades no esenciales.
5. Reescribir las HU con el formato obligatorio.
6. Distribuir de forma coherente:
   - Tech Lead;
   - Backend;
   - Frontend/UX-UI;
   - QA.
7. Evitar alterar decisiones ya consolidadas de E06–E15.
8. Añadir las decisiones nuevas a `docs/decisiones-mvp-epicas-06-15.md` o renombrar posteriormente el documento si se decide consolidar E01–E15.
9. Validar tablas Markdown, nomenclatura, subtareas, DoD y referencias.

Al refinar E02–E05 no se deben inventar reglas que contradigan:

- los cuatro roles oficiales;
- la relación usuario-área;
- los estados oficiales;
- la autenticación Sanctum existente;
- el flujo E06–E11;
- los catálogos protegidos de E12.

## Recomendaciones para ClickUp

- Crear cada épica como elemento padre, lista o carpeta según la configuración del equipo.
- Crear cada HU con nomenclatura oficial.
- Asignar un único responsable.
- Crear subtareas con títulos descriptivos, sin `STxx`.
- Copiar criterios, DoD, reglas y DoR en secciones separadas.
- Registrar dependencias reales.
- Estado inicial recomendado:
  - `Planeada` o `Por preparar`.
- Cambiar a `Lista para desarrollo` solo cuando se cumpla el Definition of Ready.
- Etiquetas recomendadas:
  - `Backend`
  - `Frontend`
  - `QA`
  - `Tech Lead`
  - `MVP`
  - `Bloqueante`

Las ÉPICAS 08–15 pueden registrarse en ClickUp. E07 será actualizada por el usuario usando la versión refinada.

## Mensaje sugerido para iniciar un chat de refinación

> Continuaremos con REPARA-79. Lee completamente `docs/resumen-traspaso-repara79.md`, `docs/decisiones-mvp-epicas-06-15.md` y la épica original que adjuntaré. Debes refinarla con el mismo estándar de E07–E15, contrastarla con el repositorio y preservar todas las decisiones consolidadas. No implementes código funcional salvo que lo solicite expresamente.

## Mensaje sugerido para iniciar un chat de programación Backend

> Continuaremos con REPARA-79. Lee completamente `docs/resumen-traspaso-repara79.md`, `docs/decisiones-mvp-epicas-06-15.md` y la HU Backend que indicaré. Contrasta la HU con el código real, implementa únicamente su alcance, agrega pruebas y verifica la integración. Preserva los cambios locales ajenos y no avances a otra HU sin autorización.

## Regla final de continuidad

Este resumen describe el estado al momento de cerrar el chat de refinación de E07–E15. Si el repositorio, ClickUp, el modelo de datos o una decisión funcional cambia posteriormente, el chat nuevo debe verificar el estado real y registrar la nueva decisión antes de continuar.
