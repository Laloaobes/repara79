# Resumen operativo — Implementación E07–E08 y despliegue temporal

## Propósito

Este documento permite continuar en un chat nuevo con tres objetivos coordinados:

1. Terminar la implementación de ÉPICA 07.
2. Iniciar e integrar ÉPICA 08.
3. Preparar, asegurar y desplegar una demostración temporal mediante Vercel, Railway y Neon.

No sustituye los documentos refinados. Resume decisiones, estado real, riesgos y orden de ejecución. Ante una discrepancia, deben revisarse el código actual, la épica completa y `docs/decisiones-mvp-epicas-06-15.md`.

## Lectura obligatoria antes de actuar

Leer completamente:

1. `docs/resumen-operativo-e07-e08-despliegue-temporal.md`
2. `docs/resumen-traspaso-repara79.md`
3. `docs/decisiones-mvp-epicas-06-15.md`
4. `docs/epica-06-valoracion-tecnica.md`
5. `docs/epica-07-autorizacion-administrativa.md`
6. `docs/epica-08-ejecucion-reparacion.md`
7. La HU exacta que se vaya a implementar.
8. Los archivos reales de Backend, Frontend, migraciones y pruebas afectados.

Para despliegue también deben leerse:

- `docs/epica-15-infraestructura-despliegue.md`
- `backend/.env.example`
- `frontend/.env.example`
- `backend/config/cors.php`
- `backend/config/database.php`
- `backend/config/filesystems.php`
- `backend/config/sanctum.php`
- `frontend/src/api/axios.ts`
- `.github/workflows/ci.yaml`

## Estado del repositorio al cerrar este chat

- **Rama:** `develop`
- **HEAD:** `a2af164`
- **Remoto:** `origin/develop` en el mismo commit.
- **Último commit:** `Merge pull request #77 from Laloaobes/fix/validacion-final-rol-subdirector`
- No se implementó código funcional durante este chat.
- Se refinó ÉPICA 06 y se ajustó documentación dependiente.
- Se evaluó el despliegue, pero no se crearon servicios externos.

Archivos y directorios no rastreados que pertenecen al usuario o al trabajo de refinación y deben preservarse:

- `clickup-import/`
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
- `docs/resumen-traspaso-repara79.md`
- `docs/resumen-operativo-e07-e08-despliegue-temporal.md`

No eliminar, restaurar, sobrescribir o incorporar estos archivos a un commit sin revisar su alcance.

## Estado técnico comprobado

### Versiones locales

- PHP `8.3.30`
- Laravel `12.62.0`
- Composer `2.8.10`
- Node.js `24.18.0`
- npm `11.16.0`

### Backend

- Laravel inicia correctamente.
- Se cargan 20 rutas de aplicación.
- La conexión local activa usa PostgreSQL.
- Las 14 migraciones existentes aparecen como ejecutadas.
- `/up` está configurado como health check.
- Las únicas pruebas actuales son:
  - `backend/tests/Unit/ExampleTest.php`
  - `backend/tests/Feature/ExampleTest.php`
- Resultado comprobado: 2 pruebas y 2 aserciones aprobadas.
- Esta suite solo confirma arranque básico; no certifica E06, E07, E08 o seguridad.

### Frontend

- `npm run lint` termina correctamente.
- `npm run build` termina correctamente fuera de las restricciones del sandbox.
- Build comprobado:
  - CSS aproximado: 41.12 kB.
  - JavaScript aproximado: 376.81 kB.
  - JavaScript gzip aproximado: 112.04 kB.
- `frontend/dist` es generado y está ignorado por Git.

### Migraciones ejecutadas

Están aplicadas hasta:

`2026_07_10_000000_align_database_with_official_schema`

No existen todavía migraciones funcionales de E08–E11.

## Roles y responsables oficiales

Roles funcionales:

- `Subdirector Administrativo`
- `Personal de Mantenimiento`
- `Responsable del Lugar`
- `Usuario Registrado`

Responsables de planeación:

- `Tech Lead`
- `Fullstack Backend`
- `Fullstack Frontend/UX-UI`
- `QA`

No usar `Técnico` como rol.

## Contrato definitivo de entrada desde ÉPICA 06

ÉPICA 07 debe recibir:

- ticket `Valorado`;
- solicitud `Pendiente de autorización`;
- observaciones;
- autor en `valorado_por`;
- fecha de creación;
- al menos un material.

Cada material público usa:

- `id`
- `descripcion`
- `cantidad`
- `costo_unitario`
- `subtotal`

La valoración incluye `costo_estimado`.

Decisiones monetarias:

- `descripcion` es alias público de `materiales_ticket.nombre_material`.
- `cantidad` es entero mayor o igual a uno.
- `costo_unitario` es decimal mayor o igual a cero.
- Backend calcula subtotal y total.
- Los importes de salida usan cadenas decimales con dos posiciones.
- No se recibe subtotal o total como fuente confiable.

Estado real del código E06 que todavía afecta E07:

- recibe `descripcion` y `costo`;
- fija `cantidad = 1`;
- devuelve materiales sin ID ni cantidad;
- usa `estado_general = Pendiente`;
- crea estados mediante `firstOrCreate`;
- elimina materiales por índice posicional;
- no protege correctamente contra concurrencia.

Antes de declarar E07 integrada, HU02-E06 o un paso técnico explícitamente autorizado debe entregar el contrato definitivo. No ocultar esta dependencia.

## ÉPICA 07 — Estado real y ruta para terminarla

Documento: `docs/epica-07-autorizacion-administrativa.md`

### Estado general

Parcialmente implementada.

Existe:

- `GET /api/valoraciones/pendientes`
- `POST /api/valoraciones/{valoracion}/autorizar`
- `POST /api/valoraciones/{valoracion}/rechazar`
- `ValoracionesPorAprobarPage.tsx`
- `MisValoracionesPage.tsx`
- validación básica de motivo de rechazo;
- campos administrativos en `solicitudes_materiales`.

Falta o es incorrecto:

- contrato de materiales definitivo;
- estado `Pendiente de autorización`;
- endpoint individual de detalle;
- búsqueda, filtro y ordenamiento en servidor;
- validación conjunta de estado de ticket y solicitud;
- bloqueo concurrente de decisión;
- consulta de estados sembrados sin `firstOrCreate`;
- servicio transaccional de autorización;
- corrección y reenvío tras rechazo;
- sincronización de materiales por ID;
- propiedad exclusiva del autor para reenviar;
- limpieza de datos del ciclo anterior;
- pruebas específicas;
- regresión E06–E07.

### Transiciones oficiales

| Acción | Ticket | Solicitud |
| :-- | :-- | :-- |
| Entrada desde E06 | `Valorado` | `Pendiente de autorización` |
| Autorizar | `Valorado → Autorizado` | `Pendiente de autorización → Autorizada` |
| Rechazar | `Valorado → Rechazado` | `Pendiente de autorización → Rechazada` |
| Corregir y reenviar | `Rechazado → Valorado` | `Rechazada → Pendiente de autorización` |

### Reglas críticas

- Solo el Subdirector Administrativo autoriza o rechaza.
- Puede haber varios Subdirectores activos.
- La decisión procesa la solicitud como unidad.
- Rechazar exige motivo.
- Solo el autor de la valoración corrige y reenvía.
- Reenviar limpia motivo, revisor y fecha del ciclo anterior.
- Reenviar conserva `veces_revisada`.
- Reenviar no incrementa `veces_revisada`.
- Estados y campos se actualizan atómicamente.
- Dos decisiones concurrentes no pueden prosperar.
- `historial_ticket` no participa.

### Orden recomendado de implementación E07

1. Confirmar si HU02-E06 será implementada primero o como dependencia técnica inseparable autorizada.
2. Completar HU01-E07 y fijar ejemplos definitivos.
3. Implementar HU02-E07:
   - pendientes;
   - detalle;
   - filtros;
   - DTO.
4. Implementar HU03-E07:
   - autorizar;
   - rechazar;
   - concurrencia;
   - transacciones.
5. Integrar HU04-E07 en Frontend.
6. Implementar HU05-E07:
   - corrección;
   - sincronización por ID;
   - reenvío.
7. Integrar HU06-E07 en Frontend.
8. Ejecutar HU07-E07 y regresión.

No implementar varias HU implícitamente si el usuario limita la solicitud a una. Si se autoriza “terminar E07” como bloque, documentar por separado el resultado de cada HU.

### Archivos centrales E07

Backend:

- `backend/routes/api.php`
- `backend/app/Http/Controllers/Api/ValoracionController.php`
- `backend/app/Http/Requests/StoreValoracionRequest.php`
- `backend/app/Http/Requests/RechazarValoracionRequest.php`
- `backend/app/Models/Valoracion.php`
- `backend/app/Models/MaterialTicket.php`
- `backend/app/Models/Ticket.php`
- `backend/database/seeders/CatalogosTicketsSeeder.php`

Frontend:

- `frontend/src/modules/tickets/pages/ValoracionesPorAprobarPage.tsx`
- `frontend/src/modules/tickets/pages/MisValoracionesPage.tsx`
- `frontend/src/modules/tickets/pages/TicketDetailPage.tsx`
- `frontend/src/modules/tickets/services/valoracionesService.ts`
- `frontend/src/modules/tickets/services/ticketsService.ts`

Pruebas recomendadas:

- `backend/tests/Feature/Valoracion/ValoracionAuthorizationTest.php`
- `backend/tests/Feature/Valoracion/ValoracionResubmissionTest.php`

## ÉPICA 08 — Condiciones para comenzar

Documento: `docs/epica-08-ejecucion-reparacion.md`

No existe implementación funcional de reparación.

### Dependencia de entrada

E07 debe entregar:

- ticket `Autorizado`;
- solicitud `Autorizada`;
- contrato de estados estable;
- datos de valoración y materiales consistentes.

### Flujo oficial

1. Cualquier integrante de Personal de Mantenimiento puede tomar un ticket `Autorizado`.
2. El primero que lo inicia queda como responsable exclusivo.
3. Se precarga `estado_inicial` desde `tickets.descripcion_desperfecto`.
4. El usuario puede corregir ese texto antes de iniciar.
5. Iniciar cambia el ticket a `En reparación`.
6. Finalizar exige:
   - `proceso_reparacion`;
   - `estado_final`;
   - una evidencia `inicial`;
   - una evidencia `durante`;
   - una evidencia `final`.
7. Finalizar prepara el ticket `Reparado`.

### Datos y migración

Debe agregarse:

- `reparaciones.fecha_inicio`.

Deben permitir null hasta finalizar:

- `reparaciones.proceso_reparacion`;
- `reparaciones.estado_final`.

Se conserva:

- `fecha_reparacion` como finalización;
- `ticket_id` único;
- `realizado_por` como responsable;
- rutas relativas de evidencias.

Formatos:

- `jpg`
- `jpeg`
- `png`
- `webp`

Máximo:

- 5 MB por archivo.

Laravel asigna `tipo_evidencia`; el cliente no lo captura.

### Orden recomendado E08

1. HU01-E08: contrato.
2. HU02-E08: migración, modelos, servicio, API, archivos y pruebas.
3. HU03-E08: interfaz y carga de evidencias.
4. HU04-E08: aceptación, concurrencia, archivos y regresión.

E09 y E10 extenderán el cierre. No agregar manualmente PDF o bitácora dentro de E08.

## Despliegue temporal aprobado

### Decisión excepcional

Para demostrar uso antes del despliegue institucional se aprobó únicamente para esta emergencia:

- **Frontend:** Vercel.
- **Backend:** Railway.
- **Base de datos:** Neon PostgreSQL.
- **Fotografías:** volumen persistente de Railway o almacenamiento compatible con S3.

Esta arquitectura:

- es temporal;
- no reemplaza E15;
- no cambia el objetivo LAN;
- debe usar datos ficticios;
- debe tener fecha de retiro;
- debe eliminar recursos y revocar secretos al concluir.

No se ha creado:

- proyecto Vercel;
- servicio Railway;
- proyecto o branch Neon;
- dominio;
- volumen;
- secreto;
- base demo;
- despliegue.

## Bloqueantes de publicación

No publicar el commit actual hasta resolver:

1. `UsuarioSubdirectorSeeder.php` crea:
   - `admin@repara79.com`
   - contraseña fija `12345678`
2. Registro público abierto.
3. Login no rechaza cuentas con `activo = false`.
4. Rutas autenticadas no aplican middleware global de cuenta activa.
5. Tokens Sanctum sin expiración.
6. Login y registro sin rate limiting explícito.
7. `APP_DEBUG=true` en el ambiente local y ejemplo no preparado.
8. `backend/.env.example` orientado a SQLite/local.
9. `frontend/.env.example` contiene variables de Gemini ajenas al MVP.
10. `frontend/src/api/axios.ts` cae a localhost.
11. CORS está codificado únicamente para orígenes locales.
12. Fotografías bajo `/storage` son directamente accesibles.
13. Railway perdería archivos sin volumen.
14. No existen archivos de despliegue.
15. La cobertura de pruebas es solo de ejemplo.
16. Dependencias con vulnerabilidades conocidas.

## Auditorías de dependencias

### Composer

Comando ejecutado:

`composer audit --locked --no-dev --no-interaction`

Resultado:

- 9 avisos de severidad media.
- Paquetes afectados:
  - `guzzlehttp/guzzle`
  - `guzzlehttp/psr7`

Actualizar dependencias compatibles y repetir auditoría y regresión.

### npm

Comando ejecutado:

`npm audit --omit=dev --audit-level=moderate`

Resultado:

- 5 vulnerabilidades:
  - 1 baja;
  - 1 moderada;
  - 3 altas.
- Paquetes señalados:
  - `body-parser`
  - `postcss`
  - `protobufjs`
  - `react-router`

No ejecutar ciegamente `npm audit fix --force`; puede degradar `react-router-dom` y producir cambios incompatibles. Actualizar de manera controlada, revisar lockfile, lint, build y recorridos.

## Plan de pulido previo al despliegue

### Seguridad

1. Retirar credenciales fijas del seeder.
2. Crear aprovisionamiento seguro del primer Subdirector.
3. Decidir si el registro se deshabilita o se protege por invitación.
4. Rechazar login de cuentas inactivas.
5. Agregar middleware de cuenta activa.
6. Revocar tokens al desactivar.
7. Configurar expiración corta de tokens para demo.
8. Agregar rate limiting a login y registro.
9. Rotar y separar secretos de demo.
10. Usar únicamente HTTPS.

### Configuración

1. Actualizar `backend/.env.example` sin secretos.
2. Actualizar `frontend/.env.example` con `VITE_API_URL`.
3. Eliminar Gemini y dependencias no utilizadas.
4. Hacer CORS configurable por ambiente.
5. Eliminar el fallback silencioso a localhost en producción.
6. Configurar logs a `stderr`.
7. Configurar `/up`.
8. Usar `APP_ENV=production`.
9. Usar `APP_DEBUG=false`.

### Calidad

1. Actualizar Composer y npm de forma controlada.
2. Agregar pruebas de autenticación, tickets y E07.
3. Ejecutar:
   - pruebas Backend;
   - lint Frontend;
   - build Frontend;
   - Composer audit;
   - npm audit.
4. Ejecutar smoke tests sobre el ambiente desplegado.

### Datos y privacidad

1. Crear base Neon exclusiva.
2. No copiar datos reales.
3. Usar nombres, correos, tickets y fotografías ficticios.
4. Crear cuentas demo con contraseñas fuertes.
5. Preparar respaldo o exportación antes de retirar.
6. Eliminar base, volumen y secretos al finalizar.

## Configuración objetivo por plataforma

### Neon

Crear proyecto o branch `repara79-demo`.

Para este tráfico bajo se recomienda inicialmente conexión directa:

```env
DB_CONNECTION=pgsql
DB_URL=postgresql://usuario:password@host/database?sslmode=require
DB_SSLMODE=require
```

El proyecto ya admite `DB_URL`.

Usar conexión directa para migraciones. Si posteriormente se utiliza el endpoint pooled de Neon, mantener una conexión directa separada para migraciones y respaldos.

### Railway

Directorio raíz:

`backend`

Variables mínimas:

```env
APP_NAME=REPARA-79
APP_ENV=production
APP_DEBUG=false
APP_URL=https://URL-RAILWAY
APP_KEY=BASE64_GENERADA
APP_LOCALE=es
APP_FALLBACK_LOCALE=es
LOG_CHANNEL=stderr
LOG_LEVEL=warning
DB_CONNECTION=pgsql
DB_URL=URL-DIRECTA-NEON
DB_SSLMODE=require
CACHE_STORE=database
SESSION_DRIVER=database
QUEUE_CONNECTION=sync
FILESYSTEM_DISK=public
```

No copiar `.env` al repositorio.

Preparación:

```text
php artisan migrate --force
php artisan optimize
php artisan storage:link
```

Health check:

`/up`

Fotografías:

- montar volumen persistente en la ruta efectiva de `storage/app/public`;
- verificar el path real de Railway antes de fijarlo;
- comprobar persistencia tras redespliegue.

### Vercel

Directorio raíz:

`frontend`

Configuración:

- Framework: Vite.
- Build: `npm run build`.
- Output: `dist`.

Variable:

```env
VITE_API_URL=https://URL-RAILWAY/api
```

Agregar `frontend/vercel.json` o configuración equivalente:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Usar un dominio de producción estable. Evitar permitir patrones amplios para todos los preview domains.

### CORS

Después de conocer la URL estable de Vercel:

- agregar únicamente ese origen;
- mantener métodos y encabezados necesarios;
- no usar `*` con credenciales;
- redesplegar Railway;
- verificar preflight y carga de archivos.

## Orden de despliegue

1. Crear rama de trabajo para endurecimiento y despliegue.
2. Aplicar pulido y seguridad.
3. Corregir dependencias.
4. Agregar pruebas mínimas.
5. Ejecutar verificación local completa.
6. Crear proyecto o branch Neon.
7. Desplegar Backend en Railway.
8. Configurar secretos y conexión Neon.
9. Ejecutar migraciones y aprovisionamiento seguro.
10. Configurar volumen y verificar archivos.
11. Obtener URL estable Railway.
12. Desplegar Frontend en Vercel con `VITE_API_URL`.
13. Obtener URL estable Vercel.
14. Restringir CORS a Vercel y redesplegar Railway.
15. Cargar datos ficticios.
16. Ejecutar smoke tests.
17. Entregar URL únicamente a participantes autorizados.
18. Conservar evidencia de uso.
19. Retirar el ambiente en la fecha acordada.
20. Revocar secretos y eliminar datos y archivos.

## Smoke tests obligatorios

1. `/up` responde correctamente.
2. Registro está deshabilitado o protegido según la decisión.
3. Usuario activo inicia sesión.
4. Usuario inactivo no inicia sesión.
5. Logout revoca el token actual.
6. Rol sin permiso recibe `403`.
7. Usuario crea ticket válido.
8. Fotografía se conserva después de un redespliegue controlado.
9. Usuario consulta únicamente tickets permitidos.
10. Personal de Mantenimiento registra valoración conforme al contrato E06.
11. Subdirector consulta, autoriza y rechaza conforme a E07.
12. Un segundo intento de decisión no modifica datos.
13. Deep links de Vercel cargan correctamente.
14. CORS permite solo el origen esperado.
15. No se muestran trazas o secretos.

Si E08 está terminada antes de desplegar, agregar inicio, finalización y tres evidencias. Si no, la demostración debe declarar explícitamente que E08 no forma parte del alcance desplegado.

## Acciones externas y autorizaciones

El usuario autorizó conceptualmente utilizar Vercel, Railway y Neon para la emergencia. Antes de ejecutar el despliegue se necesita:

- acceso autenticado o CLI conectada a cada proveedor;
- confirmar organización o cuenta objetivo;
- confirmar proyecto GitHub y rama que se desplegará;
- confirmar nombres de servicios;
- confirmar dominio generado o personalizado;
- confirmar región de Railway y Neon para minimizar latencia;
- confirmar fecha de retiro;
- confirmar responsables de costos;
- confirmar quién tendrá acceso a la demo.

No inventar IDs, tokens, URLs, contraseñas o nombres de recursos.

Crear servicios, migrar datos, publicar una URL y destruir recursos son cambios externos materiales. Deben reportarse con resultado confirmado.

## Estrategia Git recomendada

1. Preservar los archivos no rastreados.
2. Crear una rama específica desde `develop`, por ejemplo:
   - `feat/demo-deployment`
3. Separar commits:
   - seguridad;
   - dependencias;
   - pruebas;
   - configuración Railway/Neon;
   - configuración Vercel;
   - documentación.
4. Abrir PR hacia `develop`.
5. Desplegar únicamente un commit o tag identificado.
6. Registrar ese SHA en la evidencia de demo.

No desplegar directamente un árbol local sucio sin identificar qué archivos contiene.

## Criterio de salida para publicar

La demo puede publicarse únicamente cuando:

- no existen credenciales fijas;
- registro y login están protegidos;
- cuentas inactivas no acceden;
- tokens tienen política temporal;
- auditorías no conservan vulnerabilidades altas sin análisis y aceptación;
- pruebas, lint y build concluyen;
- Neon usa una base exclusiva y SSL;
- Railway usa producción sin debug;
- Vercel apunta a la API correcta;
- CORS está restringido;
- las fotografías persisten;
- se usan datos ficticios;
- existe fecha de retiro;
- el alcance funcional demostrado está declarado.

## Mensaje sugerido para continuar E07

> Continuaremos REPARA-79. Lee completamente `docs/resumen-operativo-e07-e08-despliegue-temporal.md`, `docs/decisiones-mvp-epicas-06-15.md`, `docs/epica-06-valoracion-tecnica.md` y `docs/epica-07-autorizacion-administrativa.md`. Inspecciona el código y termina únicamente las HU de E07 que autorice, con pruebas, sin alterar decisiones E08–E15 y preservando los cambios no rastreados.

## Mensaje sugerido para comenzar E08

> Continuaremos REPARA-79. Lee completamente `docs/resumen-operativo-e07-e08-despliegue-temporal.md`, `docs/epica-07-autorizacion-administrativa.md` y `docs/epica-08-ejecucion-reparacion.md`. Verifica que E07 entregue ticket `Autorizado` y solicitud `Autorizada`; después implementa la HU E08 indicada con migración, pruebas, manejo seguro de archivos y concurrencia.

## Mensaje sugerido para preparar el despliegue

> Continuaremos REPARA-79. Lee completamente `docs/resumen-operativo-e07-e08-despliegue-temporal.md` y audita el estado actual. Prepara primero el pulido local para Vercel–Railway–Neon: seguridad, dependencias, pruebas, variables, CORS, almacenamiento y scripts. No crees recursos externos hasta confirmar cuentas, nombres, región, costos, fecha de retiro y acceso.

## Regla final

El despliegue temporal es una excepción para demostrar uso. Debe ser restringido, trazable, reversible y con datos ficticios. La arquitectura institucional de E15 continúa siendo Ubuntu Server, Nginx, PHP-FPM, PostgreSQL, Supervisor y red local autorizada.

