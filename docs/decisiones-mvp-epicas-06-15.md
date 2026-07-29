# Decisiones funcionales del MVP — ÉPICAS 01 y 06 a 15

Este documento conserva las decisiones que deben aplicar las épicas refinadas y las pendientes. El criterio general es implementar únicamente tablas y capacidades que participen directamente en un caso de uso del MVP.

## Planeación del proyecto — ÉPICA 01

- ÉPICA 01 es habilitadora y documental; no implementa funcionalidad.
- Los responsables de planeación son únicamente `Tech Lead`, `Fullstack Backend`, `Fullstack Frontend/UX-UI` y `QA`.
- Product Owner, representantes institucionales y docente pueden validar entregables, pero no se asignan como responsables técnicos de HU.
- Los roles funcionales oficiales son exactamente:
  - `Subdirector Administrativo`
  - `Personal de Mantenimiento`
  - `Responsable del Lugar`
  - `Usuario Registrado`
- Backend es la autoridad para autenticación, autorización y reglas de negocio; la interfaz por rol no sustituye estos controles.
- La línea base tecnológica utiliza React 19, TypeScript, Vite 6, Tailwind CSS, Axios, Laravel 12, PHP 8.3 objetivo, Sanctum y PostgreSQL.
- El despliegue objetivo no utiliza Docker Compose, Redis o microservicios.
- Resend, correo externo, Gemini, SMS y push móvil no forman parte del MVP.
- Los requisitos funcionales usarán identificadores `RF-XXX` y los no funcionales `RNF-XXX`.
- Cada requisito debe tener fuente, prioridad, responsable de entrega, dependencia y evidencia verificable.
- La arquitectura y la planeación deben distinguir el estado real del repositorio del objetivo aprobado.
- Las decisiones consolidadas más recientes prevalecen sobre documentos preliminares incompatibles.
- Las ÉPICAS 02 a 05 permanecen pendientes de refinación individual; ÉPICA 01 no anticipa sus contratos detallados.
- La validación de QA en ÉPICA 01 certifica la línea base documental y no sustituye las pruebas funcionales ni el dictamen de ÉPICA 14.

## Valoración técnica — ÉPICA 06

- ÉPICA 06 cubre el flujo completo de valoración técnica.
- El ticket parte de `Pendiente`.
- Personal de Mantenimiento consulta y revisa el ticket.
- Registra observaciones obligatorias y al menos un material.
- Cada material recibe `descripcion`, `cantidad` entera mayor o igual a uno y `costo_unitario` decimal mayor o igual a cero.
- `descripcion` es el alias público de `materiales_ticket.nombre_material`.
- El contrato público de salida por material usa `id`, `descripcion`, `cantidad`, `costo_unitario` y `subtotal`.
- `costo_unitario`, `subtotal` y `costo_estimado` se serializan como cadenas decimales con dos posiciones.
- Backend calcula subtotales y total; no los recibe como fuente confiable del cliente.
- La valoración se crea y envía en una sola operación; no existen borradores persistidos en el MVP.
- El ticket cambia a `Valorado`.
- La solicitud de materiales queda `Pendiente de autorización`.
- La creación de solicitud, materiales y transición del ticket es atómica y resistente a concurrencia.
- Los estados `Pendiente` y `Valorado` se consultan del catálogo y no se crean durante la operación.
- Una valoración enviada no se edita ni pierde materiales mientras espera autorización.
- La eliminación de materiales por índice posicional se retira; la corrección por ID tras un rechazo pertenece a ÉPICA 07.
- `codigo_material`, `inventario_ref`, `estado_individual` y el rechazo individual de materiales quedan fuera del contrato del MVP.
- El Subdirector Administrativo consulta y decide en ÉPICA 07, no en ÉPICA 06.
- La interfaz separa información del ticket, observaciones, materiales, resumen y envío.

## Autorización administrativa — ÉPICA 07

- El Subdirector Administrativo revisa la valoración.
- Autorizar cambia la solicitud a `Autorizada` y el ticket a `Autorizado`.
- Rechazar cambia la solicitud a `Rechazada` y el ticket a `Rechazado`.
- Corregir y reenviar devuelve la solicitud a `Pendiente de autorización` y el ticket a `Valorado`.
- `historial_ticket` no participa en el MVP.
- La decisión vigente se representa con los campos de `solicitudes_materiales`.

## Reparación y evidencias — ÉPICA 08

- `reparaciones` almacena únicamente información textual, responsable y fechas.
- `evidencias_reparacion` almacena todas las fotografías.
- No se agregan columnas de imagen a `reparaciones`.
- `estado_inicial` se precarga desde `tickets.descripcion_desperfecto`.
- Personal de Mantenimiento puede corregir ese texto antes de iniciar.
- La corrección se guarda en `reparaciones.estado_inicial` y no modifica el ticket original.
- Las categorías técnicas válidas son exactamente:
  - `inicial`
  - `durante`
  - `final`
- `tipo_evidencia` permanece como `VARCHAR`; no se crea catálogo, enum o ID adicional.
- Las tres evidencias son obligatorias para finalizar.
- El formulario presenta un bloque de carga por categoría.
- El usuario nunca escribe ni selecciona `tipo_evidencia`.
- Laravel asigna `tipo_evidencia` según el campo de carga recibido.
- `historial_ticket` tampoco participa en este flujo.

## Historial del ticket

- Su finalidad futura es auditoría, trazabilidad y línea del tiempo.
- No participa directamente en valoración, autorización, reparación ni PDF.
- Para el MVP no se crean modelos, servicios, endpoints o interfaces de historial.
- La tabla puede permanecer en el esquema para una ampliación posterior.

## Notificaciones internas — ÉPICA 11

- La integración externa de correo que anteriormente ocupaba ÉPICA 09 fue descartada.
- Resend, Gmail, SMTP, SMS y push móvil no forman parte del MVP.
- El MVP sí incluye notificaciones internas persistentes.
- Se utilizará la tabla estándar `notifications` de Laravel con `data` en JSONB.
- La tabla heredada `notificaciones` no será la fuente activa de esta funcionalidad.
- Antes de retirarla mediante una migración deberá verificarse que no contenga datos útiles.
- Cada usuario consulta y modifica únicamente sus propias notificaciones.
- La carga inicial y la recuperación ante fallos utilizan endpoints REST.
- Laravel Reverb y Laravel Echo proporcionan actualización local en tiempo real mediante canales privados.
- La persistencia es obligatoria; Reverb la complementa y no la sustituye.
- El primer evento del MVP es `reparacion_finalizada`.
- Este evento se emite únicamente después de crear correctamente el PDF y `bitacoras_reparacion`.
- Los destinatarios son los Subdirectores Administrativos y los Responsables del Lugar asociados al área del ticket.
- El integrante de Personal de Mantenimiento que originó el evento no recibe su propia notificación durante el MVP.
- El despliegue institucional requiere configurar Reverb y el proxy WebSocket de Nginx, pero no credenciales de Resend.

## Administración del Sistema — ÉPICA 12

- Puede existir más de un Subdirector Administrativo activo.
- Siempre debe permanecer al menos uno activo.
- Un Subdirector no cambia su propio rol ni desactiva su propia cuenta.
- Administración no crea usuarios ni administra contraseñas durante el MVP.
- El registro existente crea las cuentas como `Usuario Registrado`.
- Las cuentas pueden activarse o desactivarse; desactivar revoca sus tokens.
- Un área puede tener varios Responsables del Lugar activos.
- Un Responsable del Lugar puede pertenecer a varias áreas.
- `usuario_area` es la fuente oficial de las asignaciones.
- Cambiar una cuenta fuera de Responsable del Lugar desactiva sus asignaciones.
- Sedes, áreas, tipos de desperfectos y prioridades permiten creación y edición.
- Los catálogos operativos y cuentas no se eliminan desde Administración.
- `estados_ticket` y `tipos_usuarios` permanecen de solo lectura.
- El resumen estadístico administrativo corresponde a ÉPICA 13.

## Estadísticas y Dashboard — ÉPICA 13

- Las estadísticas globales son exclusivas del Subdirector Administrativo.
- Los demás roles conservan su Dashboard operativo básico.
- Las agregaciones se calculan en PostgreSQL y no sobre la lista completa en React.
- El MVP incluye resumen, distribución por estado, distribución por prioridad, cinco áreas principales y cinco tickets recientes.
- Los filtros son fecha de reporte, sede y área.
- Todos los indicadores utilizan el mismo conjunto filtrado.
- El indicador económico se denomina `Costo estimado de materiales autorizados`.
- Solo incluye solicitudes `Autorizada` y calcula `cantidad × costo_unitario`.
- No representa gasto real o consumo de inventario.
- No se agregan librerías de gráficas, series temporales, predicciones o exportaciones.
- Estados se identifican por los nombres oficiales protegidos.
- Prioridades se obtienen dinámicamente y no se codifican por nombre.

## Aseguramiento de Calidad — ÉPICA 14

- ÉPICA 14 consolida y certifica la calidad de las ÉPICAS 06 a 13; no reemplaza las validaciones específicas de cada épica.
- El alcance se prioriza por riesgo y no exige cobertura automatizada del 100 %.
- Tech Lead define plan, matriz de trazabilidad, ambientes y compuerta de liberación.
- Fullstack Backend automatiza API, permisos, estados, transacciones, archivos y cálculos críticos con PHPUnit.
- La integración backend se ejecuta sobre una base PostgreSQL exclusiva de pruebas; nunca sobre producción.
- Fullstack Frontend/UX-UI incorpora Vitest, React Testing Library y `jsdom` para recorridos críticos.
- QA ejecuta aceptación integral, regresión, gestión de incidencias y emite el dictamen final.
- El recorrido cubre los cuatro roles oficiales y el flujo desde ticket hasta Dashboard.
- No se incorpora Playwright, Cypress, carga masiva, auditoría profesional de penetración o comparación visual por píxel durante el MVP.
- Resend y cualquier correo externo quedan fuera de las pruebas.
- El dictamen solo puede ser `Aprobado` cuando no existan defectos críticos o altos abiertos y todos los casos críticos concluyan correctamente.
- ÉPICA 15 depende del dictamen de liberación de ÉPICA 14.

## Infraestructura y Despliegue Institucional — ÉPICA 15

- El servidor objetivo es el Dell PowerEdge T110 II con Ubuntu Server 24.04 LTS actualizado.
- El despliegue permanece limitado a la red local autorizada del CBTA 79.
- Nginx es el único punto de entrada y publica React, Laravel API y el proxy WebSocket.
- PostgreSQL escucha localmente, PHP-FPM utiliza socket Unix y Reverb escucha en `127.0.0.1:8080`.
- React se sirve como build estático; Vite no se ejecuta en producción.
- La API usa preferentemente el mismo origen bajo `/api`.
- Worker de colas y Reverb permanecen activos mediante Supervisor.
- El hardware de 8 GB utiliza una configuración conservadora sin Redis, contenedores o múltiples workers innecesarios.
- `APP_ENV=production`, `APP_DEBUG=false` y ningún secreto se guarda en Git.
- El seeder que crea `admin@repara79.com` con contraseña fija debe retirarse o sustituirse antes de producción.
- La cuenta administrativa inicial se aprovisiona mediante un procedimiento seguro sin credenciales codificadas.
- La publicación directa de evidencias y reportes queda bloqueada; su consulta utiliza endpoints autenticados.
- Cada release se identifica por revisión, conserva `.env` y storage compartidos y permite volver a la versión anterior.
- Los respaldos incluyen PostgreSQL, evidencias, PDF e inventario de versión.
- Una copia que permanece únicamente en el HDD del servidor no se considera respaldo válido.
- La política mínima es diaria, con siete copias diarias, cuatro semanales y una restauración aislada verificada.
- Certbot solo se usa si existe dominio validable; una URL LAN sin HTTPS debe permanecer restringida y registrar el riesgo.
- El servidor no se expone a Internet durante el MVP.
- ÉPICA 15 termina con validación posterior al reinicio, restauración comprobada y acta técnica de QA.

## Numeración confirmada de ÉPICAS 09 a 15

1. **ÉPICA 09 — Generación del Informe Final de Mantenimiento (PDF).**
2. **ÉPICA 10 — Bitácora de Mantenimiento / Archivero Digital de Reparaciones Exitosas.**
3. **ÉPICA 11 — Sistema de Notificaciones Internas.**
4. **ÉPICA 12 — Administración del Sistema.**
5. **ÉPICA 13 — Estadísticas y Dashboard Avanzado.**
6. **ÉPICA 14 — Aseguramiento de Calidad.**
7. **ÉPICA 15 — Infraestructura y Despliegue Institucional.**

Esta numeración reemplaza las propuestas preliminares. PDF se implementa antes del Archivero y Notificaciones antes de Administración para completar primero el flujo vertical del MVP.

## Informe Final de Mantenimiento — ÉPICA 09

- El PDF se genera automáticamente durante el cierre de la reparación.
- No existe un botón o endpoint para generar o regenerar el documento manualmente.
- ÉPICA 09 extiende el cierre definido por ÉPICA 08.
- Si el renderizado o almacenamiento falla, el cierre se revierte y se eliminan los archivos parciales.
- El archivo se genera una sola vez y utiliza una ruta determinista.
- El PDF no incluye `historial_ticket`.
- La sección de materiales se denomina `Materiales autorizados`, porque el MVP no registra consumo de inventario.
- La consulta o descarga utiliza un endpoint autenticado; el frontend no construye una URL directa al disco.
- ÉPICA 10 registra la ruta resultante después de que el PDF existe y no vuelve a generarlo.

## Archivero Digital de Reparaciones Exitosas — ÉPICA 10

- `bitacoras_reparacion` representa el índice del Archivero Digital.
- El Archivero Digital forma parte del MVP y será implementado en ÉPICA 10.
- Solo nace después de finalizar exitosamente una reparación.
- El orden funcional será:
  1. Validar la información de cierre.
  2. Cambiar el ticket a `Reparado`.
  3. Generar el PDF automáticamente.
  4. Guardar el archivo.
  5. Crear el registro de `bitacoras_reparacion`.
- No existe un botón independiente para generar el PDF.
- El usuario nunca crea manualmente una bitácora.
- `titulo` se genera automáticamente con el formato:
  - `Ticket #{id} - {titulo del ticket}`
- El título conserva una referencia histórica aunque posteriormente cambie el ticket.
- La bitácora almacena únicamente `ticket_id`, `reparacion_id`, `titulo`, `descripcion_final`, `archivo_pdf`, `generado_por` y `fecha_generacion`.
- `generado_por` identifica al Personal de Mantenimiento responsable de la reparación y permite aplicar su filtro de consulta.
- `fecha_generacion` conserva la fecha devuelta por el servicio PDF de ÉPICA 09.
- `ticket_id` y `reparacion_id` son obligatorios y únicos en el Archivero.
- `titulo` admite hasta 255 caracteres para conservar el prefijo automático y el título completo del ticket.
- La bitácora no duplica sede, área, prioridad, estado, materiales o fotografías.
- Esa información se consulta mediante sus relaciones con ticket y reparación.
- No existen endpoints para crear, editar o eliminar bitácoras manualmente.
- Si el archivado falla, el cierre se revierte y se elimina el PDF generado por el intento.

## Permisos del Archivero Digital

- `Subdirector Administrativo`: consulta todas las reparaciones archivadas.
- `Personal de Mantenimiento`: consulta únicamente las reparaciones que realizó, usando `generado_por`.
- `Responsable del Lugar`: consulta reparaciones de sus áreas mediante `bitacoras_reparacion → reparaciones → tickets.area_id → usuario_area`.
- No se agrega `area_id` a `bitacoras_reparacion`.

## Almacenamiento oficial

- Todas las rutas persistidas son relativas al disco `public`.
- Las evidencias se almacenan en:
  - `evidencias/ticket-{id}/inicial/`
  - `evidencias/ticket-{id}/durante/`
  - `evidencias/ticket-{id}/final/`
- Ejemplo de imagen:
  - `evidencias/ticket-125/inicial/evidencia-001.jpg`
- El PDF se almacena en:
  - `reportes/ticket-{id}/reporte-reparacion-ticket-{id}.pdf`
- `evidencias_reparacion.imagen` almacena únicamente la ruta relativa de cada imagen.
- `bitacoras_reparacion.archivo_pdf` almacena únicamente la ruta relativa del PDF.

## Contenido oficial del PDF

- Encabezado institucional.
- Identificación del reporte.
- Información general del ticket.
- Valoración técnica.
- Materiales autorizados.
- Descripción del proceso de reparación.
- Evidencias iniciales.
- Evidencias durante la reparación.
- Evidencias finales.
- Información del Personal de Mantenimiento responsable.
- Pie de página institucional.

## Funcionalidades diferidas

- Conversión y normalización automática de imágenes a WebP.
- Auditoría y línea del tiempo mediante `historial_ticket`.
- Capacidades no relacionadas directamente con un caso de uso del MVP.
