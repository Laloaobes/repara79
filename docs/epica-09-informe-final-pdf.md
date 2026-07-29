# ÉPICA 09 — Generación del Informe Final de Mantenimiento (PDF)

## Identificación

- **Estado real:** Pendiente de implementación; no existe dependencia, servicio, plantilla, almacenamiento ni descarga de PDF.
- **Prioridad:** Muy alta.
- **Actor funcional principal:** Personal de Mantenimiento como responsable del cierre; consulta posterior según rol.
- **Dependencia principal:** ÉPICA 08 — Ejecución de la reparación.
- **Épica consumidora:** ÉPICA 10 — Bitácora de Mantenimiento / Archivero Digital de Reparaciones Exitosas.
- **Enfoque:** Generación automática, íntegra y segura del documento esencial del MVP.

## Objetivo

Generar y almacenar automáticamente un informe PDF al finalizar correctamente una reparación, utilizando exclusivamente la información ya registrada en el sistema, para conservar evidencia documental del mantenimiento y entregar a la ÉPICA 10 el archivo que será indexado en el Archivero Digital.

## Resultado esperado

Al terminar la épica, el sistema debe cubrir este flujo:

1. El Personal de Mantenimiento completa en ÉPICA 08 el proceso, resultado y las evidencias `inicial`, `durante` y `final`.
2. El backend valida el cierre y prepara toda la información relacionada con el ticket.
3. El ticket cambia de `En reparación` a `Reparado` dentro de la operación de cierre.
4. El sistema genera el PDF sin solicitar una acción adicional al usuario.
5. El archivo se guarda en `reportes/ticket-{id}/reporte-reparacion-ticket-{id}.pdf`.
6. El servicio devuelve internamente la ruta relativa y la fecha de generación.
7. Si la generación o el almacenamiento falla, el cierre se revierte y no se conserva un PDF parcial.
8. ÉPICA 10 utiliza ese resultado para crear automáticamente `bitacoras_reparacion` antes de confirmar el cierre integrado.

La generación forma parte del cierre de la reparación. No existe un botón para crear o regenerar el informe.

## Alcance esencial

- Contrato del contenido, formato, permisos y manejo de fallos.
- Integración de una biblioteca PDF compatible con Laravel 12.
- Consulta consolidada de ticket, valoración, materiales, reparación y evidencias.
- Plantilla institucional en Blade.
- Generación y almacenamiento automático al finalizar.
- Endpoint protegido para visualizar o descargar el archivo existente.
- Acción frontend para abrir o descargar el informe ya generado.
- Pruebas de contenido, permisos, archivos y regresión del cierre.
- Punto de integración documentado para ÉPICA 10.

## Recortes deliberados por tiempo

- No se incluye `historial_ticket`; fue diferido fuera del MVP.
- No se consulta ni se crea `bitacoras_reparacion` en esta épica.
- No existe generación manual, regeneración, edición o eliminación del reporte.
- No se implementan firmas digitales, códigos QR, sellos electrónicos ni folios fiscales.
- No se envía el documento por correo, Resend, SMS o servicios externos.
- No se agregan gráficas, estadísticas o anexos administrativos.
- No se normalizan las imágenes a WebP; esa mejora permanece diferida.
- No se introduce procesamiento por colas para tres evidencias; el cierre permanece síncrono y confirma su resultado al usuario.
- No se desarrolla un editor visual de plantillas.
- No se duplica el contenido del reporte en nuevas columnas o tablas.

## Contraste con la implementación actual

| Capacidad                   | Estado actual       | Pendiente principal                                      |
| :-------------------------- | :------------------ | :------------------------------------------------------- |
| Datos fuente                | Parcial             | ÉPICA 08 debe completar reparación y evidencias.         |
| Biblioteca PDF              | No implementado     | Agregar dependencia compatible con Laravel 12.           |
| Plantilla institucional     | No implementado     | Crear vista Blade y recursos locales.                    |
| Servicio de generación      | No implementado     | Consolidar datos, renderizar y almacenar el archivo.     |
| Integración con el cierre   | No implementado     | Extender la finalización definida en ÉPICA 08.           |
| Descarga protegida          | No implementado     | Crear autorización, controlador y ruta API.              |
| Interfaz de consulta        | No implementado     | Mostrar disponibilidad y acción de descarga.             |
| Registro en bitácora        | Tabla sin uso       | Corresponde a ÉPICA 10 después de guardar el PDF.         |
| Pruebas de informes         | No implementado     | Validar contenido, acceso, rollback y archivo resultante. |

### Evidencia técnica del contraste

- `backend/composer.json` utiliza Laravel `^12.0` y todavía no incluye una biblioteca para PDF.
- No existen servicios, controladores, políticas o vistas para informes de mantenimiento.
- No existe un archivo institucional en `backend/resources/images/`.
- `reparaciones`, `evidencias_reparacion`, `solicitudes_materiales` y `materiales_ticket` existen como estructura, pero el flujo funcional de reparación sigue pendiente.
- `bitacoras_reparacion.archivo_pdf` existe, pero su uso corresponde a la ÉPICA 10.
- El frontend no contiene módulo, servicio o acción para consultar reportes.

## Flujo integrado oficial

| Orden | Acción                                      | Épica responsable                |
| :---- | :------------------------------------------ | :------------------------------- |
| 1     | Validar textos y tres evidencias            | ÉPICA 08                          |
| 2     | Preparar el cierre y el estado `Reparado`   | ÉPICA 08                          |
| 3     | Generar y almacenar el PDF                  | ÉPICA 09                          |
| 4     | Crear `bitacoras_reparacion`                | ÉPICA 10                          |
| 5     | Confirmar el cierre sin datos parciales     | ÉPICAS 08, 09 y 10                |
| 6     | Emitir `reparacion_finalizada` tras commit  | ÉPICA 11                          |

ÉPICA 09 no emite todavía la notificación final. El evento de ÉPICA 11 solo podrá publicarse después de que ÉPICA 10 también haya creado la entrada del Archivero.

## Contenido oficial del PDF

| Sección                      | Información mínima                                                                                                      | Fuente principal                                      |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| Encabezado institucional     | Nombre del plantel, nombre del sistema y logotipo institucional aprobado                                                | Recurso local y configuración                         |
| Identificación del reporte   | Identificador `REPARA79-T{id}`, folio del ticket y fecha de generación                                                  | `tickets` y reloj del servidor                        |
| Información general          | Título, desperfecto, prioridad, estado, reporte, usuario reportante, sede, área y ubicación                             | `tickets` y relaciones                                |
| Valoración técnica           | Observaciones, responsable de valoración y fecha                                                                        | `solicitudes_materiales` y `users`                    |
| Materiales autorizados       | Nombre, código si existe, cantidad, costo unitario, subtotal y total                                                    | `materiales_ticket`                                   |
| Ejecución de la reparación   | Estado inicial confirmado, proceso, estado final, fecha de inicio, fecha de finalización y Personal de Mantenimiento responsable | `reparaciones` y `users`                       |
| Evidencias                   | Una imagen `inicial`, una `durante` y una `final`, claramente identificadas                                             | `evidencias_reparacion`                               |
| Pie de página institucional  | Identificador del reporte, fecha de generación y numeración de páginas                                                  | Datos calculados                                      |

El documento debe nombrar la sección como **Materiales autorizados**, no como inventario consumido, porque el MVP no registra salidas ni confirma consumo real.

## Reglas generales del documento

- Papel tamaño carta y orientación vertical.
- Texto en español y codificación UTF-8.
- Fechas visibles con zona horaria institucional.
- Importes con dos decimales y moneda `MXN`.
- Subtotal por material: `cantidad × costo_unitario`.
- Total: suma de los subtotales incluidos.
- Las evidencias aparecen en el orden `inicial`, `durante`, `final`, sin depender del orden de sus identificadores.
- Las imágenes se cargan desde rutas locales controladas; no se permiten recursos remotos.
- Si un dato opcional no existe, se muestra `No registrado` y nunca se inventa contenido.
- El PDF representa una fotografía documental del cierre y no se modifica si posteriormente cambia un catálogo o dato relacionado.

## Almacenamiento y acceso

- Disco Laravel: `public`.
- Ruta relativa exacta:
  - `reportes/ticket-{id}/reporte-reparacion-ticket-{id}.pdf`
- Nombre de descarga recomendado:
  - `reporte-reparacion-ticket-{id}.pdf`
- La base de datos no recibe una nueva columna en esta épica.
- ÉPICA 10 guardará esa ruta relativa en `bitacoras_reparacion.archivo_pdf`.
- El cliente nunca construye una URL directa al disco.
- La API autoriza cada consulta y transmite el archivo existente.
- El despliegue de ÉPICA 15 debe impedir el acceso directo no autorizado a `storage/reportes/`.

## Permisos de consulta

| Rol                          | Alcance permitido                                                                          |
| :--------------------------- | :----------------------------------------------------------------------------------------- |
| Subdirector Administrativo   | Cualquier informe generado.                                                                |
| Personal de Mantenimiento    | Informes de reparaciones donde `reparaciones.realizado_por` sea su usuario.                 |
| Responsable del Lugar        | Informes de tickets asociados a sus áreas activas mediante `usuario_area`.                  |
| Usuario Registrado           | Sin acceso a informes en el MVP.                                                            |

Estos permisos son los mismos que utilizará el Archivero Digital en ÉPICA 10.

## Orden y dependencias

| HU   | Responsable único          | Depende de                                  |
| :--- | :------------------------- | :------------------------------------------ |
| HU01 | Tech Lead                  | Contrato aprobado de ÉPICA 08               |
| HU02 | Fullstack Backend          | HU01-E09 y HU02-E08                         |
| HU03 | Fullstack Frontend/UX-UI   | HU01-E09 y contrato API de HU02-E09         |
| HU04 | QA                         | HU02-E09, HU03-E09 y flujo integrado E08-E09 |

HU03 puede comenzar con respuestas simuladas aprobadas. HU04 inicia cuando la generación automática y la consulta protegida estén integradas.

---

# HU01-E09-Definir contrato del informe PDF

## Descripción

**Como** Tech Lead,  
**quiero** definir el contrato de generación, contenido, seguridad e integración del informe,  
**para** que el cierre de reparación produzca un documento consistente sin duplicar responsabilidades entre las ÉPICAS 08, 09 y 10.

## Prioridad

Muy alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/epica-09-contrato-informe-pdf.md`.
- Aprobar `barryvdh/laravel-dompdf` en una versión compatible con Laravel 12.
- Definir el DTO interno que consume la plantilla.
- Definir las secciones, etiquetas, formatos y comportamiento para datos opcionales.
- Confirmar que solo se utilizan recursos locales y rutas controladas.
- Definir el punto de invocación desde `RepairService`.
- Definir el comportamiento transaccional y la limpieza de archivos ante fallos.
- Definir el endpoint:
  - `GET /api/tickets/{ticket}/reporte-reparacion`
- Definir respuestas:
  - `200`: archivo disponible.
  - `403`: rol o alcance no permitido.
  - `404`: ticket o archivo no encontrado.
  - `409`: la reparación todavía no está finalizada o el reporte no está disponible.
- Documentar el contrato que consumirá ÉPICA 10 después de guardar el archivo.

## Impacto en el modelo de datos

No crea ni modifica tablas. Define el uso posterior de:

- `tickets`
- `solicitudes_materiales`
- `materiales_ticket`
- `reparaciones`
- `evidencias_reparacion`
- `users`
- `areas`
- `sedes`
- `tipos_desperfectos`
- `prioridades_ticket`

## Dependencias

- Contrato de finalización de HU01-E08.
- Estructura real desplegada en PostgreSQL/Supabase.
- Tres categorías de evidencia aprobadas en ÉPICA 08.
- Identidad institucional o alternativa textual aprobada.

## Subtareas

1. **Definir estructura documental** — Establecer secciones, campos, etiquetas, identificador, fechas, importes, orden de evidencias y tratamiento de datos opcionales.
2. **Definir integración y fallos** — Documentar el punto de invocación, atomicidad, idempotencia, limpieza de archivos y respuesta cuando falle la generación.
3. **Definir acceso y almacenamiento** — Confirmar ruta relativa, endpoint protegido, permisos por rol y restricción de acceso directo al directorio.
4. **Formalizar contrato entre épicas** — Delimitar qué entrega ÉPICA 08, qué genera ÉPICA 09 y qué registra posteriormente ÉPICA 10.

## Criterios de aceptación

1. El documento identifica sin ambigüedad todos los campos y sus fuentes.
2. El contenido no depende de `historial_ticket` ni de `bitacoras_reparacion`.
3. El contrato establece las categorías `inicial`, `durante` y `final` en ese orden.
4. La ruta del archivo coincide exactamente con la convención oficial.
5. Los permisos están definidos para los cuatro roles existentes.
6. El contrato prohíbe generación y regeneración manual.
7. Está definido cómo revertir el cierre y eliminar archivos ante fallos.
8. ÉPICA 10 puede consumir la ruta resultante sin volver a generar el PDF.

## Definition of Done

1. **Dado que** ÉPICA 08 entrega una reparación completa, **cuando** el equipo consulte el contrato, **entonces** encontrará el contenido, las fuentes y el orden exactos del informe.
2. **Dado que** el cierre combina base de datos y almacenamiento, **cuando** ocurra una falla, **entonces** el contrato indicará cómo evitar un ticket cerrado sin reporte o un archivo huérfano.
3. **Dado que** distintos roles consultarán el documento, **cuando** se revise la matriz de acceso, **entonces** cada rol tendrá un alcance explícito y verificable.
4. **Dado que** ÉPICA 10 necesita el documento generado, **cuando** termine HU01, **entonces** estará definido el punto de integración sin duplicar la generación.

## Reglas de negocio

- El PDF se genera una sola vez durante el cierre exitoso.
- El documento usa exclusivamente información persistida.
- No se agregan campos solo para facilitar la plantilla.
- `historial_ticket` no participa en el reporte.
- Los materiales se presentan como autorizados y no como consumo de inventario.
- Los recursos remotos permanecen deshabilitados.
- La zona horaria y moneda son institucionales.

## Definition of Ready

- ÉPICA 08 tiene contrato de cierre aprobado.
- Las decisiones de contenido y almacenamiento están consolidadas.
- Los roles oficiales y sus áreas de acceso están identificados.
- Se dispone del nombre institucional y se definió el tratamiento del logotipo.

---

# HU02-E09-Generar y proteger el informe PDF

## Descripción

**Como** Personal de Mantenimiento,  
**quiero** que el sistema genere automáticamente el informe al concluir mi reparación,  
**para** cerrar el trabajo con evidencia documental completa sin realizar pasos adicionales.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Dependencia Composer:
  - `barryvdh/laravel-dompdf:^3.1`
- Servicio nuevo:
  - `backend/app/Services/Reports/MaintenanceReportService.php`
- Controlador nuevo:
  - `backend/app/Http/Controllers/Api/MaintenanceReportController.php`
- Política nueva:
  - `backend/app/Policies/MaintenanceReportPolicy.php`
- Vista nueva:
  - `backend/resources/views/reports/maintenance-report.blade.php`
- Recurso institucional recomendado:
  - `backend/resources/images/cbta79-logo.png`
- Archivos a modificar:
  - `backend/app/Services/RepairService.php`
  - `backend/routes/api.php`
- Ruta autenticada:
  - `GET /tickets/{ticket}/reporte-reparacion`

El controlador solo entrega archivos existentes. La generación pertenece al servicio invocado durante la finalización; no se expone mediante `POST`.

## Impacto en el modelo de datos

No requiere migración ni duplica datos.

Consulta:

- `tickets` con estado, prioridad, tipo, reportante, área y sede.
- `solicitudes_materiales` con usuarios de valoración y validación.
- `materiales_ticket`.
- `reparaciones` con Personal de Mantenimiento responsable.
- `evidencias_reparacion`.

Genera únicamente un archivo en almacenamiento. ÉPICA 10 persistirá su ruta en `bitacoras_reparacion`.

## Dependencias

- HU01-E09-Definir contrato del informe PDF.
- HU02-E08-Implementar API de reparación.
- Extensiones PHP requeridas por PDF e imágenes disponibles en desarrollo y despliegue.
- Disco `public` correctamente configurado.
- Recurso institucional aprobado o encabezado textual de respaldo.

## Subtareas

1. **Integrar motor y plantilla** — Agregar la dependencia, configuración segura, recurso institucional local y vista Blade en tamaño carta.
2. **Consolidar datos del reporte** — Cargar relaciones de forma controlada, ordenar evidencias, calcular subtotales y total, y construir el DTO de plantilla.
3. **Generar durante el cierre** — Invocar el servicio desde la finalización, usar la ruta determinista y evitar generaciones duplicadas ante reintentos.
4. **Garantizar consistencia** — Coordinar transacción y almacenamiento, revertir el cierre y limpiar PDF/evidencias nuevas cuando falle cualquier etapa.
5. **Proteger consulta y descarga** — Implementar política, controlador y ruta con alcance por rol, encabezados correctos y nombre seguro.

## Criterios de aceptación

1. Finalizar una reparación válida genera exactamente un archivo PDF.
2. El archivo se guarda en `reportes/ticket-{id}/reporte-reparacion-ticket-{id}.pdf`.
3. El informe contiene todas las secciones oficiales y obtiene sus datos de las relaciones existentes.
4. Las evidencias aparecen exactamente como `Inicial`, `Durante` y `Final`.
5. Los subtotales y el total coinciden con cantidades y costos registrados.
6. Caracteres españoles, saltos de página e imágenes se representan correctamente.
7. Ningún recurso remoto se descarga durante el renderizado.
8. Si el renderizado, almacenamiento o confirmación falla, el ticket no queda cerrado y no permanecen archivos parciales.
9. Un reintento de una operación ya confirmada no crea otro reporte.
10. El endpoint entrega `200` únicamente al rol con alcance sobre el ticket.
11. Un usuario sin permiso recibe `403` sin conocer la ruta física.
12. La respuesta de finalización incluye `report_available: true` y la ruta API protegida.

## Definition of Done

1. **Dado que** una reparación en curso contiene textos y evidencias válidas, **cuando** su responsable la finalice, **entonces** el ticket quedará `Reparado` y existirá un único PDF completo en la ruta oficial.
2. **Dado que** la generación o el almacenamiento produce un error, **cuando** el servicio aborte la operación, **entonces** el ticket conservará su estado anterior y no quedarán registros ni archivos parciales.
3. **Dado que** existe un informe generado, **cuando** un usuario solicite el endpoint, **entonces** la política permitirá o rechazará la descarga según su rol y alcance.
4. **Dado que** ÉPICA 10 reciba la ruta generada, **cuando** cree el registro del Archivero, **entonces** podrá utilizarla sin volver a renderizar el documento.

## Reglas de negocio

- Solo se genera para una reparación completa asociada a un ticket en proceso de cierre.
- Deben existir las tres evidencias obligatorias.
- El Personal de Mantenimiento responsable proviene de `reparaciones.realizado_por`.
- La generación es automática, única e idempotente.
- No se sustituye silenciosamente un reporte confirmado.
- La ruta almacenada y comunicada es relativa; la ruta física nunca se expone.
- El endpoint no genera el archivo si falta.
- `Usuario Registrado` no consulta informes.
- Responsable del Lugar requiere una relación activa en `usuario_area`.
- El servicio utiliza carga anticipada de relaciones para evitar consultas repetitivas.
- Las imágenes proceden exclusivamente del disco configurado y de rutas registradas.

## Definition of Ready

- HU01 está terminada.
- HU02-E08 puede preparar una reparación completa.
- La dependencia PDF fue validada con Laravel 12 y PHP 8.3.
- El ambiente puede leer evidencias y escribir reportes.
- Existen datos de prueba con los cuatro roles y relaciones de área.

---

# HU03-E09-Consultar y descargar el informe PDF

## Descripción

**Como** usuario autorizado,  
**quiero** abrir o descargar el informe final disponible,  
**para** consultar la evidencia documental de una reparación conforme a mi ámbito de acceso.

## Prioridad

Alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Servicio nuevo:
  - `frontend/src/modules/reports/services/maintenanceReportsService.ts`
- Tipos nuevos:
  - `frontend/src/modules/reports/types/maintenanceReport.ts`
- Componente nuevo:
  - `frontend/src/modules/reports/components/MaintenanceReportAction.tsx`
- Archivos a integrar:
  - `frontend/src/modules/repairs/pages/RepairsPage.tsx`
  - `frontend/src/modules/tickets/pages/TicketDetailPage.tsx`

La acción consume la ruta protegida entregada por backend como `Blob`. El frontend no forma rutas bajo `/storage`.

ÉPICA 10 reutilizará el componente desde el detalle del Archivero.

## Impacto en el modelo de datos

No modifica el modelo. Consume el contrato y los permisos de HU02.

## Dependencias

- HU01-E09-Definir contrato del informe PDF.
- Contrato de respuesta de HU02-E09.
- HU03-E08-Ejecutar reparación desde la interfaz.
- Backend debe entregar ejemplos de `200`, `403`, `404` y `409`.

## Subtareas

1. **Crear cliente de informes** — Definir tipos y servicio autenticado para recuperar el PDF como `Blob` y leer su nombre de descarga.
2. **Integrar disponibilidad** — Mostrar la acción al finalizar y en el detalle autorizado solo cuando `report_available` sea verdadero.
3. **Implementar apertura y descarga** — Crear una URL temporal, permitir abrir o guardar el documento y revocar la URL después de usarla.
4. **Resolver estados de interfaz** — Bloquear dobles solicitudes y mostrar carga, ausencia de reporte, acceso denegado y error recuperable.

## Criterios de aceptación

1. La finalización exitosa informa visualmente que el reporte fue generado.
2. La acción solo aparece cuando la API indica que el archivo está disponible.
3. Abrir o descargar utiliza el endpoint autenticado y no una ruta pública construida por el cliente.
4. El nombre sugerido es `reporte-reparacion-ticket-{id}.pdf`.
5. Durante la descarga se evita el doble envío y se muestra progreso.
6. Los errores `403`, `404` y `409` tienen mensajes distintos y no producen una descarga vacía.
7. Las URLs temporales del navegador se revocan.
8. La acción funciona en móvil y escritorio.
9. No se presenta una acción para generar o regenerar el documento.
10. El componente puede reutilizarse en ÉPICA 10 sin copiar lógica.

## Definition of Done

1. **Dado que** el cierre devolvió un reporte disponible, **cuando** el integrante de Personal de Mantenimiento seleccione la acción correspondiente, **entonces** podrá abrir o descargar el PDF mediante una solicitud autenticada.
2. **Dado que** un usuario autorizado consulta el detalle de un ticket reparado, **cuando** el archivo exista, **entonces** verá la misma acción reutilizable con un estado claro.
3. **Dado que** el reporte falta o la API niega la solicitud, **cuando** el frontend reciba el error, **entonces** no abrirá contenido inválido y explicará el resultado sin exponer rutas internas.

## Reglas de negocio

- La visibilidad del botón no sustituye la autorización backend.
- El frontend no genera ni modifica PDFs.
- El cliente no construye rutas del disco.
- Las acciones se deshabilitan mientras exista una solicitud.
- Los objetos `Blob` se liberan al terminar.
- No se muestra regeneración.
- El componente respeta el diseño y navegación existentes.

## Definition of Ready

- El contrato API está aprobado.
- Existe al menos un reporte de prueba.
- Los permisos por rol están disponibles en el ambiente.
- HU03-E08 tiene definido el punto visual posterior al cierre.
- Se conocen los mensajes de error de backend.

---

# HU04-E09-Validar informe final de mantenimiento

## Descripción

**Como** responsable de QA,  
**quiero** validar la generación, contenido, seguridad y descarga del informe,  
**para** comprobar que cada reparación cerrada conserva un documento íntegro y accesible únicamente para los usuarios autorizados.

## Prioridad

Muy alta.

## Responsable único

QA.

## Alcance técnico

- Prueba backend recomendada:
  - `backend/tests/Feature/MaintenanceReportFlowTest.php`
- Prueba unitaria recomendada:
  - `backend/tests/Unit/MaintenanceReportServiceTest.php`
- Evidencia funcional:
  - `docs/evidencias/epica-09/matriz-pruebas.md`
  - `docs/evidencias/epica-09/resultado-pruebas.md`
- Archivos PDF de prueba:
  - `backend/tests/Fixtures/reports/`
- Comandos mínimos:
  - `cd backend && php artisan test`
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

La validación visual del PDF y de la interfaz se documenta manualmente. No se incorpora una herramienta adicional de comparación visual al MVP.

## Impacto en el modelo de datos

Las pruebas consultan:

- `tickets`
- `solicitudes_materiales`
- `materiales_ticket`
- `reparaciones`
- `evidencias_reparacion`
- Relaciones de usuarios, roles y áreas.

No modifican el esquema productivo. Los archivos temporales se aíslan con almacenamiento falso o directorios de prueba.

## Dependencias

- HU02-E09-Generar y proteger el informe PDF.
- HU03-E09-Consultar y descargar el informe PDF.
- Flujo de cierre E08-E09 integrado.
- Datos con caracteres españoles, importes, tres evidencias y los roles autorizables.

## Subtareas

1. **Preparar matriz y datos** — Relacionar criterios con casos, crear fixtures representativos y definir el resultado esperado de cálculos y permisos.
2. **Automatizar generación y fallos** — Verificar archivo, tipo MIME, ruta, idempotencia, rollback, limpieza y ausencia de recursos remotos.
3. **Validar contenido y acceso** — Revisar secciones, textos, imágenes, importes, páginas y matriz de permisos de los cuatro roles.
4. **Ejecutar interfaz y regresión** — Probar descarga responsive, errores, cierre de ÉPICA 08, suite, lint y build, y emitir el dictamen.

## Criterios de aceptación

1. Cada criterio de HU02 y HU03 tiene al menos un caso de prueba.
2. Se comprueba que finalizar genere un PDF válido y no un archivo vacío.
3. Se revisan las secciones oficiales, caracteres españoles, importes y orden de evidencias.
4. Se prueban reportes con material con y sin código opcional.
5. Se comprueba el total con más de un material.
6. Se simula una falla de renderizado o escritura y se verifica el rollback y la limpieza.
7. Se prueba un reintento sin duplicación.
8. Se valida el acceso de Subdirector Administrativo, Personal de Mantenimiento responsable, Responsable del Lugar con y sin área asignada y Usuario Registrado.
9. Se verifica que el frontend no use una URL pública del disco.
10. Suite backend, lint y build concluyen correctamente.
11. No quedan defectos críticos o altos abiertos.
12. La evidencia identifica el ticket y no contiene información sensible ajena a su alcance.

## Definition of Done

1. **Dado que** existe una reparación completa, **cuando** QA ejecute el cierre, **entonces** obtendrá un único PDF legible con las secciones, cálculos y evidencias esperadas.
2. **Dado que** se fuerza un fallo en cualquier etapa de generación, **cuando** concluya la solicitud, **entonces** no habrá un ticket cerrado sin reporte ni archivos residuales.
3. **Dado que** se prueban los cuatro roles y distintas asignaciones, **cuando** soliciten el archivo, **entonces** cada respuesta coincidirá con la matriz de permisos.
4. **Dado que** backend y frontend están integrados, **cuando** se ejecuten regresión, lint y build, **entonces** no existirán defectos críticos o altos y quedará evidencia reproducible.

## Reglas de negocio

- QA verifica respuesta HTTP, estado del ticket, base de datos y almacenamiento.
- La mera extensión `.pdf` no demuestra que el archivo sea válido.
- Cada defecto se relaciona con una HU y criterio.
- No se aprueba con defectos críticos o altos.
- Los archivos de prueba no se mezclan con almacenamiento productivo.
- Los datos de otros usuarios no deben filtrarse en respuestas o nombres de archivo.
- La matriz incluye al menos un caso negativo por regla de acceso.

## Definition of Ready

- HU02 y HU03 están integradas.
- ÉPICA 08 produce una reparación completa.
- El ambiente permite simular fallos de almacenamiento.
- Existen usuarios de los cuatro roles y asociaciones de área.
- QA conoce el procedimiento para limpiar los archivos generados.

---

## Definition of Done de la Épica

1. **Dado que** el Personal de Mantenimiento responsable finaliza una reparación completa, **cuando** el sistema confirme el cierre, **entonces** el ticket quedará `Reparado` y existirá un único PDF íntegro en la ruta oficial.
2. **Dado que** el informe se construye desde los datos registrados, **cuando** se revise su contenido, **entonces** incluirá información general, valoración, materiales autorizados, reparación, tres evidencias, Personal de Mantenimiento responsable y elementos institucionales.
3. **Dado que** la generación o persistencia falla, **cuando** termine la operación, **entonces** el cierre se revertirá y no permanecerán datos o archivos parciales.
4. **Dado que** un usuario solicita el reporte, **cuando** la API evalúe su rol y alcance, **entonces** solo entregará el archivo a quienes estén autorizados.
5. **Dado que** backend y frontend están integrados, **cuando** QA ejecute aceptación, regresión, lint y build, **entonces** no habrá defectos críticos o altos abiertos y quedará evidencia reproducible.
6. **Dado que** ÉPICA 10 requiera archivar la reparación, **cuando** consuma el resultado de ÉPICA 09, **entonces** podrá registrar la ruta relativa sin generar nuevamente el documento.

## Criterio de cierre

ÉPICA 09 se considera terminada cuando HU01 a HU04 cumplen su Definition of Done y el cierre integrado E08-E09 genera un informe descargable con control de acceso. La tabla `bitacoras_reparacion` puede continuar sin uso hasta implementar ÉPICA 10.
