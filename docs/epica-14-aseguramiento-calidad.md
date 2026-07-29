# ÉPICA 14 — Aseguramiento de Calidad

## Identificación

- **Estado real:** Inicial; Laravel incluye PHPUnit, pero solo conserva las pruebas de ejemplo. El frontend no tiene framework de pruebas automatizadas.
- **Prioridad:** Crítica para la liberación.
- **Actor funcional:** Equipo del proyecto.
- **Dependencias funcionales:** ÉPICAS 06 a 13 integradas en un ambiente de pruebas.
- **Enfoque:** Reducir riesgos del flujo principal y dejar evidencia reproducible de la calidad del MVP.

## Objetivo

Consolidar una estrategia mínima y ejecutable de aseguramiento de calidad que automatice las reglas críticas de backend y frontend, valide manualmente el flujo completo de mantenimiento y produzca un dictamen verificable antes del despliegue institucional.

## Resultado esperado

Al terminar la épica:

1. Existe un plan de pruebas con alcance, riesgos, ambientes y criterios de liberación.
2. Cada capacidad esencial de las ÉPICAS 06 a 13 está relacionada con al menos un caso de prueba.
3. Las reglas críticas de API, permisos, estados, transacciones y archivos están automatizadas con PHPUnit.
4. Los componentes y recorridos críticos del frontend están automatizados con Vitest y React Testing Library.
5. QA ejecuta el flujo integral con los cuatro roles oficiales y conserva evidencia.
6. Los defectos tienen severidad, estado, responsable de corrección y resultado de revalidación.
7. Backend, frontend y flujo integral concluyen sin defectos críticos o altos abiertos.
8. QA emite un dictamen final `Aprobado` o `No aprobado` para ÉPICA 15.

## Principios de la estrategia

- Las pruebas se seleccionan por riesgo y no por cantidad.
- Las reglas de negocio se validan principalmente en backend.
- El frontend se valida por comportamiento visible, no por detalles internos o snapshots masivos.
- Las pruebas automatizadas no sustituyen el recorrido integral manual.
- Ninguna prueba utiliza la base de datos, almacenamiento o servicios del ambiente productivo.
- Cada defecto se relaciona con una épica, HU, criterio y caso de prueba.
- Una prueba que detecta un defecto no se altera para ocultarlo; se corrige el producto o se documenta una decisión aprobada.
- ÉPICA 14 consolida la calidad global y no elimina las responsabilidades de prueba incluidas en las épicas anteriores.

## Contraste con la implementación actual

| Capacidad                              | Estado actual       | Acción refinada                                                     |
| :------------------------------------- | :------------------ | :------------------------------------------------------------------ |
| PHPUnit y Laravel Feature Tests        | Configurado         | Sustituir ejemplos por pruebas de los flujos y reglas críticas.     |
| Base de datos de pruebas               | SQLite en memoria   | Incorporar una configuración aislada de PostgreSQL para integración.|
| Factories y datos reproducibles        | Insuficiente        | Crear únicamente los datos reutilizables para escenarios críticos.  |
| Pruebas automatizadas de frontend      | No configuradas     | Instalar Vitest, Testing Library y `jsdom`.                          |
| Casos manuales documentados            | No consolidados     | Crear una matriz única para las ÉPICAS 06 a 13.                      |
| Flujo integral por roles               | No documentado      | Ejecutarlo con datos controlados y evidencia.                        |
| Gestión formal de incidencias          | No implementada     | Definir severidad, ciclo de vida y revalidación.                     |
| Criterio de liberación                 | No implementado     | Emitir un dictamen objetivo previo a ÉPICA 15.                       |
| Integración con Resend                 | Descartada          | Excluir correo y validar únicamente notificaciones internas.        |

## Alcance esencial

- Plan de pruebas basado en riesgos.
- Matriz de trazabilidad de las ÉPICAS 06 a 13.
- Ambiente de prueba aislado sobre PostgreSQL.
- Pruebas automatizadas críticas de backend.
- Pruebas automatizadas críticas de frontend.
- Pruebas manuales del flujo integral y sus variantes.
- Validación de permisos de los cuatro roles oficiales.
- Validación de archivos, PDF, Archivero y notificaciones internas.
- Pruebas básicas de interfaz, accesibilidad y responsividad.
- Registro, priorización, revalidación y cierre de incidencias.
- Regresión final, evidencia y dictamen de liberación.

## Recortes deliberados por tiempo

- No se busca una cobertura automatizada del 100 %.
- No se establece un porcentaje de cobertura como sustituto de los casos críticos.
- No se implementan pruebas automatizadas de extremo a extremo con Playwright o Cypress.
- No se contratan plataformas externas de testing.
- No se realizan pruebas formales de carga masiva, estrés prolongado o alta disponibilidad.
- No se realiza auditoría profesional de penetración.
- No se prueban navegadores obsoletos.
- No se automatizan comparaciones visuales por píxel.
- No se prueba correo, Resend, SMTP, SMS o push móvil.
- No se crea una aplicación adicional para gestionar defectos.
- No se duplican en ÉPICA 14 todos los casos detallados en las HU de QA anteriores; se reutilizan y consolidan.

## Flujo crítico que debe quedar cubierto

1. Un Usuario Registrado se autentica y crea un ticket válido.
2. Personal de Mantenimiento consulta el ticket, registra la valoración y solicita materiales.
3. El Subdirector Administrativo autoriza, rechaza o devuelve para corrección según el escenario.
4. El mismo integrante de Personal de Mantenimiento corrige y reenvía cuando corresponda.
5. Personal de Mantenimiento inicia la reparación con el estado inicial precargado y editable.
6. La reparación se finaliza con evidencias obligatorias `inicial`, `durante` y `final`.
7. El sistema genera el PDF y la bitácora dentro del cierre exitoso.
8. Los destinatarios válidos reciben una notificación interna persistente.
9. Cada rol consulta únicamente tickets, reportes, bitácoras y notificaciones permitidos.
10. El Subdirector administra cuentas, asignaciones y catálogos sin romper las invariantes.
11. El Subdirector consulta el Dashboard con métricas y filtros consistentes.

El rechazo y la corrección son variantes del flujo y no ocurren simultáneamente con la autorización del mismo intento.

## Matriz mínima de capas de prueba

| Capa                       | Responsable de implementación | Herramienta o técnica                   | Propósito principal                                      |
| :------------------------- | :---------------------------- | :------------------------------------- | :------------------------------------------------------- |
| Contrato y riesgo          | Tech Lead                     | Documentación y revisión técnica       | Fijar alcance, ambiente y condiciones de liberación.     |
| API y reglas de negocio    | Fullstack Backend             | PHPUnit / Laravel Feature y Unit Tests | Validar seguridad, estados, persistencia y transacciones.|
| Componentes y recorridos UI| Fullstack Frontend/UX-UI      | Vitest / React Testing Library         | Validar comportamiento, formularios y estados visuales.  |
| Aceptación y regresión     | QA                            | Matriz manual y comandos reproducibles | Certificar el flujo integrado y gestionar defectos.      |

## Ambientes y datos de prueba

- Backend usa una base PostgreSQL exclusiva de pruebas, por ejemplo `repara79_test`.
- El archivo real de credenciales es local y no se versiona.
- `backend/.env.testing.example` documenta las variables sin secretos.
- Las pruebas deben impedir su ejecución si la base configurada coincide con producción.
- Los archivos se aíslan mediante `Storage::fake()` o un directorio temporal de pruebas.
- Colas, eventos y notificaciones se simulan solo cuando el caso no necesita comprobar su persistencia real.
- Los casos integrales utilizan cuentas identificables de los cuatro roles oficiales.
- Los datos deben poder recrearse mediante factories, seeders de prueba o instrucciones documentadas.
- Las capturas y registros no contienen contraseñas, tokens, cookies ni datos personales innecesarios.

## Severidad y criterio de liberación

| Severidad | Definición MVP                                                              | ¿Bloquea liberación? |
| :-------- | :-------------------------------------------------------------------------- | :------------------- |
| Crítica   | Pérdida o corrupción de datos, acceso indebido, cierre imposible o caída.   | Sí.                  |
| Alta      | Función esencial incorrecta y sin alternativa segura.                       | Sí.                  |
| Media     | Defecto relevante con alternativa temporal y sin riesgo de integridad.      | No, si se documenta. |
| Baja      | Detalle visual, textual o de usabilidad que no impide el flujo.              | No, si se documenta. |

El MVP solo recibe dictamen `Aprobado` cuando:

- no quedan defectos críticos o altos abiertos;
- todos los casos críticos concluyen satisfactoriamente;
- las pruebas automatizadas, el lint y el build terminan correctamente;
- las incidencias medias o bajas pendientes tienen impacto y seguimiento documentados.

## Comandos mínimos de validación

```bash
cd backend
php artisan test

cd ../frontend
npm run test:run
npm run lint
npm run build
```

Los comandos definitivos y sus requisitos se documentan en el plan de pruebas. La suite de backend debe indicar expresamente qué conexión de pruebas está utilizando.

## Orden y dependencias

| HU   | Responsable único          | Depende de                                               |
| :--- | :------------------------- | :------------------------------------------------------- |
| HU01 | Tech Lead                  | Contratos refinados de ÉPICAS 06 a 13                    |
| HU02 | Fullstack Backend          | HU01-E14 y módulos backend integrados                     |
| HU03 | Fullstack Frontend/UX-UI   | HU01-E14 y módulos frontend integrados                    |
| HU04 | QA                         | HU02-E14, HU03-E14 y ambiente integrado estable           |

HU02 y HU03 pueden desarrollarse en paralelo. QA puede preparar datos y casos desde HU01, pero emite el dictamen únicamente después de integrar HU02 y HU03.

---

# HU01-E14-Establecer línea base de calidad del MVP

## Descripción

**Como** Tech Lead,  
**quiero** definir la estrategia, ambientes, riesgos y condiciones de liberación,  
**para** que el equipo valide el MVP con criterios comunes, reproducibles y proporcionales al tiempo disponible.

## Prioridad

Muy alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/qa/plan-pruebas-mvp.md`.
- Crear `docs/qa/matriz-trazabilidad.md`.
- Crear `docs/qa/gestion-incidencias.md`.
- Crear `backend/.env.testing.example` sin credenciales.
- Revisar `backend/phpunit.xml` para evitar que oculte la conexión elegida.
- Definir preparación y restauración de PostgreSQL de pruebas.
- Definir comandos oficiales de backend y frontend.
- Definir riesgos críticos de autenticación, permisos, estados, archivos, transacciones, notificaciones y datos administrativos.
- Relacionar los casos críticos con las ÉPICAS 06 a 13.
- Confirmar recortes y condición objetiva de liberación.

## Impacto en el modelo de datos

No modifica el esquema productivo.

Puede requerir:

- una base PostgreSQL exclusiva de pruebas;
- factories y seeders que creen datos desechables;
- almacenamiento temporal separado.

No se versionan volcados con datos reales ni secretos del ambiente.

## Dependencias

- ÉPICAS 06 a 13 refinadas.
- Roles, estados y flujo oficial confirmados.
- Esquema PostgreSQL actualizado.
- Stack y comandos actuales del repositorio identificados.

## Subtareas

1. **Priorizar riesgos del MVP** — Clasificar capacidades críticas y seleccionar casos positivos, negativos y de seguridad.
2. **Definir ambientes y datos aislados** — Documentar PostgreSQL de pruebas, archivos temporales, cuentas, factories, restauración y protección contra producción.
3. **Construir matriz de trazabilidad** — Relacionar épica, HU, criterio, caso, capa, responsable de ejecución y evidencia.
4. **Formalizar gestión de incidencias** — Definir severidades, estados, información obligatoria, asignación, revalidación y cierre.
5. **Fijar compuerta de liberación** — Aprobar comandos, navegadores, evidencias y condiciones para el dictamen de QA.

## Criterios de aceptación

1. El plan identifica alcance, riesgos, ambientes, técnicas y recortes.
2. Cada capacidad esencial de E06-E13 tiene al menos un caso relacionado.
3. La matriz diferencia pruebas backend, frontend y manuales.
4. Se documentan datos requeridos y resultado esperado.
5. La configuración de pruebas no contiene secretos.
6. Existe una protección explícita contra ejecutar pruebas sobre producción.
7. Las severidades y estados de incidencias son inequívocos.
8. Los comandos pueden ejecutarse desde un clon configurado.
9. La liberación exige cero defectos críticos o altos abiertos.
10. Resend y servicios externos no aparecen como dependencias.

## Definition of Done

1. **Dado que** las épicas contienen validaciones dispersas, **cuando** el equipo consulte la matriz, **entonces** podrá rastrear cada capacidad crítica hasta su caso, capa y evidencia esperada.
2. **Dado que** las pruebas modifican datos y archivos, **cuando** se prepare el ambiente, **entonces** utilizará PostgreSQL y almacenamiento exclusivos sin acceso a producción.
3. **Dado que** se detecte una incidencia, **cuando** se registre, **entonces** tendrá severidad, pasos, resultado esperado, evidencia, responsable de corrección y estado de revalidación.
4. **Dado que** se solicite liberar el MVP, **cuando** se aplique la compuerta definida, **entonces** el dictamen dependerá de resultados verificables y no de una apreciación informal.

## Reglas de negocio

- La selección de pruebas se basa en riesgo.
- La matriz es la fuente de trazabilidad de QA.
- Producción nunca se utiliza como ambiente de pruebas.
- No se almacenan secretos en documentación o Git.
- Un defecto crítico o alto bloquea la liberación.
- Las exclusiones se documentan y no se presentan como probadas.
- La estrategia usa exclusivamente los cuatro roles oficiales.

## Definition of Ready

- Las ÉPICAS 06 a 13 están disponibles.
- El flujo oficial está confirmado.
- Se conoce el stack y la estructura del repositorio.
- El equipo acepta el alcance esencial del MVP.

---

# HU02-E14-Automatizar reglas críticas del backend

## Descripción

**Como** integrante Fullstack Backend,  
**quiero** automatizar las API, reglas de negocio y transacciones críticas,  
**para** detectar regresiones de seguridad e integridad antes de desplegar el sistema.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Reutilizar y completar los casos PHPUnit definidos en las ÉPICAS 06 a 13.
- Organizar las pruebas recomendadas por dominio:
  - `backend/tests/Feature/Auth/AuthenticationTest.php`
  - `backend/tests/Feature/Tickets/TicketLifecycleTest.php`
  - `backend/tests/Feature/Maintenance/ValuationAuthorizationTest.php`
  - `backend/tests/Feature/Maintenance/RepairClosureTest.php`
  - `backend/tests/Feature/Notifications/NotificationAccessTest.php`
  - `backend/tests/Feature/Admin/AdministrationDashboardTest.php`
- Crear pruebas unitarias solo para servicios con cálculo o lógica aislable:
  - generación del PDF;
  - cierre y archivado;
  - agregaciones del Dashboard.
- Completar factories en `backend/database/factories/`.
- Incorporar helpers o traits reutilizables dentro de `backend/tests/Support/`.
- Eliminar o reemplazar:
  - `backend/tests/Feature/ExampleTest.php`
  - `backend/tests/Unit/ExampleTest.php`

Los nombres pueden dividirse si un archivo se vuelve difícil de mantener, conservando la agrupación por dominio.

## Impacto en el modelo de datos

Las pruebas crean y eliminan datos únicamente en PostgreSQL de pruebas.

Deben cubrir relaciones críticas entre:

- usuarios, roles y `usuario_area`;
- tickets, estados y catálogos;
- valoraciones, solicitudes y materiales;
- reparaciones y evidencias;
- bitácoras y PDF;
- `notifications`;
- datos administrativos consultados por el Dashboard.

No crean tablas exclusivas de QA en producción.

## Dependencias

- HU01-E14-Establecer línea base de calidad del MVP.
- API de las ÉPICAS 06 a 13 integrada.
- Migraciones y factories compatibles con PostgreSQL.
- Disco y cola configurables para pruebas.

## Subtareas

1. **Preparar soporte reproducible** — Configurar PostgreSQL aislado, factories, usuarios por rol, catálogos y protección contra producción.
2. **Cubrir autenticación y tickets** — Automatizar registro, acceso, tokens, cuenta inactiva, creación, consulta y aislamiento de información.
3. **Cubrir valoración y autorización** — Probar permisos, estados, materiales, autorización, rechazo, corrección, propiedad, concurrencia y rollback.
4. **Cubrir cierre transaccional** — Probar evidencias obligatorias, PDF, bitácora, archivos, idempotencia, fallos y ausencia de registros parciales.
5. **Cubrir notificaciones y administración** — Validar destinatarios, privacidad, último Subdirector, automodificación, asignaciones y catálogos protegidos.
6. **Cubrir Dashboard y ejecutar regresión** — Verificar cálculos, filtros, costos, valores cero y ejecutar la suite completa.

## Criterios de aceptación

1. La suite se ejecuta con `php artisan test` sobre un ambiente aislado.
2. No quedan pruebas de ejemplo sin valor funcional.
3. Los cuatro roles oficiales se prueban en escenarios autorizados y prohibidos.
4. Se prueban cuentas activas, inactivas y tokens revocados.
5. Los cambios de estado válidos e inválidos están cubiertos.
6. Los fallos de PDF, archivos, bitácora o notificación no dejan cierres parciales.
7. Las tres categorías de evidencia son obligatorias.
8. La autorización y el reenvío respetan rol y propiedad.
9. La privacidad de tickets, PDF, bitácoras y notificaciones se valida.
10. Las invariantes del último Subdirector y `usuario_area` están cubiertas.
11. Los cálculos del Dashboard usan datos conocidos y no duplican costos.
12. Los archivos y datos temporales se limpian.
13. Los casos no dependen del orden de ejecución.
14. Ninguna prueba realiza solicitudes a Resend u otros servicios externos.
15. La suite completa termina correctamente y su resultado puede conservarse como evidencia.

## Definition of Done

1. **Dado que** existen usuarios con roles, estados y relaciones diferentes, **cuando** se ejecute la suite, **entonces** cada API permitirá únicamente las operaciones autorizadas y conservará la privacidad de los datos.
2. **Dado que** el cierre de reparación abarca base de datos y archivos, **cuando** se simule un fallo en cualquier paso, **entonces** no quedarán ticket reparado, PDF, bitácora o evidencia parcial inconsistente.
3. **Dado que** existen reglas administrativas y cálculos agregados, **cuando** se prueben con datos controlados, **entonces** las invariantes y resultados coincidirán con los contratos de E12 y E13.
4. **Dado que** un desarrollador ejecute `php artisan test` en el ambiente documentado, **cuando** finalice la suite, **entonces** obtendrá un resultado reproducible sin utilizar infraestructura productiva.

## Reglas de negocio

- Backend es la autoridad de permisos y estados.
- Cada prueba comprueba respuesta y persistencia cuando corresponda.
- Las pruebas negativas verifican ausencia de cambios parciales.
- Los mocks no sustituyen la validación de persistencia crítica.
- Los casos son independientes e idempotentes.
- Las factories no introducen estados inexistentes.
- No se relajan reglas de negocio para hacer pasar la suite.

## Definition of Ready

- HU01 está terminada.
- Las migraciones se ejecutan en PostgreSQL de pruebas.
- Los endpoints críticos están integrados.
- Existen contratos definitivos para E06-E13.
- Los servicios de archivos y colas pueden aislarse.

---

# HU03-E14-Automatizar recorridos críticos del frontend

## Descripción

**Como** integrante Fullstack Frontend/UX-UI,  
**quiero** automatizar los comportamientos críticos de navegación, formularios y estados visuales,  
**para** evitar regresiones de interfaz sin depender únicamente de pruebas manuales.

## Prioridad

Alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Agregar como dependencias de desarrollo:
  - `vitest`
  - `@testing-library/react`
  - `@testing-library/jest-dom`
  - `@testing-library/user-event`
  - `jsdom`
- Actualizar `frontend/package.json` con:
  - `test`
  - `test:run`
- Crear:
  - `frontend/vitest.config.ts`
  - `frontend/src/test/setup.ts`
  - `frontend/src/test/renderWithProviders.tsx`
- Colocar pruebas junto al módulo o en `__tests__`, manteniendo una convención única.
- Priorizar:
  - autenticación, rutas protegidas y roles;
  - creación y consulta de tickets;
  - valoración y autorización;
  - reparación y validación de evidencias;
  - consulta de PDF y Archivero;
  - campana y listado de notificaciones;
  - administración;
  - Dashboard administrativo.

Las respuestas de API se simulan en el límite de los servicios con `vi.mock`; no se agrega una segunda librería de mocks durante el MVP.

## Impacto en el modelo de datos

No accede directamente a PostgreSQL ni modifica el esquema.

Usa DTO controlados que representen:

- respuestas exitosas;
- errores `401`, `403`, `404`, `409`, `422` y `500` cuando apliquen;
- estados vacíos;
- cargas pendientes;
- catálogos y roles dinámicos.

## Dependencias

- HU01-E14-Establecer línea base de calidad del MVP.
- Pantallas y servicios de E06-E13 integrados.
- Contratos de API estabilizados.
- Rutas y proveedores React identificados.

## Subtareas

1. **Configurar entorno de pruebas UI** — Instalar Vitest y Testing Library, agregar scripts, `jsdom`, setup y renderizador con proveedores.
2. **Cubrir acceso y navegación** — Probar autenticación, rutas protegidas, guardas por rol, cierre de sesión y cuenta no autorizada.
3. **Cubrir formularios del flujo** — Probar campos, validaciones, envío, bloqueo de doble acción y errores en tickets, valoración, autorización y reparación.
4. **Cubrir resultados posteriores al cierre** — Probar evidencias, PDF, Archivero, notificaciones, estados vacíos, carga y error.
5. **Cubrir administración y Dashboard** — Probar permisos visuales, filtros dependientes, métricas recibidas y ausencia de cálculos administrativos locales.
6. **Ejecutar regresión de frontend** — Corregir pruebas inestables y ejecutar `test:run`, lint y build.

## Criterios de aceptación

1. `npm run test:run` ejecuta la suite una sola vez y devuelve código de salida correcto.
2. Los helpers renderizan Router, autenticación y demás proveedores sin duplicación.
3. Las pruebas consultan por roles, etiquetas o texto accesible y no por clases CSS frágiles.
4. Las rutas protegidas bloquean usuarios no autenticados o sin rol.
5. Los formularios prueban validación, éxito, error y prevención de doble envío.
6. La reparación exige los tres campos de evidencia.
7. Los estados de carga, vacío y error no muestran información obsoleta como válida.
8. La campana y las notificaciones respetan datos del usuario actual.
9. Administración no presenta acciones prohibidas de automodificación o eliminación.
10. El Dashboard representa el DTO sin recalcular agregaciones.
11. No se usan snapshots como única validación de una pantalla crítica.
12. Las pruebas no dependen de backend, Reverb o red activos.
13. La suite, TypeScript y build terminan correctamente.

## Definition of Done

1. **Dado que** un usuario accede con cualquiera de los cuatro roles, **cuando** navegue por rutas protegidas, **entonces** verá únicamente las pantallas y acciones permitidas para su rol.
2. **Dado que** un formulario crítico recibe datos válidos, inválidos o un error de API, **cuando** el usuario interactúe, **entonces** la interfaz mostrará el resultado correcto y evitará envíos duplicados.
3. **Dado que** los servicios devuelven carga, vacío, éxito o error, **cuando** se rendericen los módulos críticos, **entonces** cada estado será explícito y no conservará información engañosa.
4. **Dado que** se ejecuten `test:run`, lint y build, **cuando** terminen, **entonces** el frontend será reproducible y no tendrá fallos conocidos en los recorridos automatizados.

## Reglas de negocio

- Las pruebas validan comportamiento observable.
- Los permisos visuales complementan, pero no sustituyen, al backend.
- Los mocks respetan los DTO oficiales.
- No se ocultan errores de consola relevantes.
- No se prueban detalles internos sin impacto funcional.
- El color no es la única señal en validaciones de interfaz.
- No se introduce automatización E2E adicional en esta HU.

## Definition of Ready

- HU01 está terminada.
- Los módulos críticos compilan.
- Los contratos de API están estabilizados.
- Se conocen los proveedores requeridos para renderizar la aplicación.
- Hay ejemplos de respuestas positivas y negativas.

---

# HU04-E14-Certificar el flujo integral del MVP

## Descripción

**Como** responsable de QA,  
**quiero** ejecutar la aceptación, regresión y revalidación del flujo integral,  
**para** emitir un dictamen sustentado antes del despliegue institucional.

## Prioridad

Crítica.

## Responsable único

QA.

## Alcance técnico

- Completar:
  - `docs/qa/matriz-trazabilidad.md`
  - `docs/qa/incidencias.md`
  - `docs/qa/informe-liberacion-mvp.md`
- Crear:
  - `docs/evidencias/epica-14/resultado-regresion.md`
  - `docs/evidencias/epica-14/flujo-integral/`
  - `docs/evidencias/epica-14/logs/`
- Ejecutar:
  - suite PHPUnit;
  - suite Vitest;
  - TypeScript;
  - build;
  - flujo manual integrado.
- Validar en:
  - navegador basado en Chromium, obligatorio;
  - Firefox, recorrido esencial de humo;
  - viewport de escritorio y móvil.
- Registrar cada defecto con información reproducible.
- Revalidar correcciones y ejecutar regresión del área afectada.
- Emitir dictamen `Aprobado` o `No aprobado`.

## Impacto en el modelo de datos

QA utiliza únicamente datos desechables del ambiente de pruebas.

Debe verificar persistencia y relaciones en PostgreSQL para:

- transiciones de tickets;
- valoración y materiales;
- reparación y evidencias;
- PDF y bitácora;
- notificaciones;
- asignaciones administrativas;
- estadísticas.

No modifica migraciones ni reglas de negocio como parte de esta HU.

## Dependencias

- HU01-E14-Establecer línea base de calidad del MVP.
- HU02-E14-Automatizar reglas críticas del backend.
- HU03-E14-Automatizar recorridos críticos del frontend.
- ÉPICAS 06 a 13 integradas en un ambiente estable.
- Cuentas y datos controlados para los cuatro roles.

## Subtareas

1. **Preparar ejecución integral** — Confirmar versión, ambiente, datos, cuentas, navegadores y trazabilidad de casos críticos.
2. **Ejecutar flujo y variantes** — Validar recorrido principal, rechazo, corrección, fallos controlados, permisos, archivos y notificaciones.
3. **Validar interfaz y compatibilidad** — Comprobar teclado, etiquetas, mensajes, responsividad y humo en navegadores definidos.
4. **Gestionar y revalidar incidencias** — Registrar defectos, asignar severidad, verificar correcciones y ejecutar regresión relacionada.
5. **Ejecutar regresión final** — Conservar resultados de backend, frontend, lint, build y casos manuales.
6. **Emitir dictamen de liberación** — Resumir alcance, resultados, defectos pendientes, riesgos y decisión para ÉPICA 15.

## Criterios de aceptación

1. Todos los casos críticos tienen resultado, fecha, versión y evidencia.
2. El flujo integral se ejecuta con los cuatro roles oficiales.
3. Se prueban autorización, rechazo y corrección como variantes independientes.
4. Se verifican las tres evidencias obligatorias.
5. PDF, bitácora y notificaciones aparecen únicamente después de un cierre exitoso.
6. Un fallo de cierre no deja datos o archivos parciales.
7. Cada rol observa únicamente información autorizada.
8. Administración conserva al menos un Subdirector activo y asignaciones coherentes.
9. Las cifras del Dashboard coinciden con el dataset utilizado.
10. La interfaz crítica funciona con teclado y en los viewports definidos.
11. Chromium concluye la matriz y Firefox supera el recorrido de humo.
12. Cada defecto incluye pasos, esperado, obtenido, severidad, evidencia y estado.
13. Toda corrección cerrada tiene revalidación satisfactoria.
14. PHPUnit, Vitest, lint y build concluyen correctamente.
15. No quedan defectos críticos o altos abiertos para un dictamen aprobado.
16. Los riesgos medios o bajos aceptados aparecen en el informe.

## Definition of Done

1. **Dado que** las ÉPICAS 06 a 13 están integradas, **cuando** QA ejecute el flujo principal y sus variantes, **entonces** cada operación respetará estados, permisos, persistencia y resultados definidos.
2. **Dado que** se detecte y corrija una incidencia, **cuando** QA la revalide, **entonces** conservará evidencia del resultado y ejecutará la regresión proporcional al área afectada.
3. **Dado que** existen cuatro roles oficiales, **cuando** se prueben API e interfaz, **entonces** cada usuario consultará y modificará únicamente los recursos autorizados.
4. **Dado que** concluyan las suites y la matriz manual, **cuando** no existan defectos críticos o altos abiertos, **entonces** QA emitirá un dictamen `Aprobado` con riesgos residuales documentados.
5. **Dado que** persista un defecto crítico, alto o un caso crítico fallido, **cuando** se elabore el informe, **entonces** QA emitirá `No aprobado` e identificará claramente el bloqueo para ÉPICA 15.

## Reglas de negocio

- QA no modifica el producto para hacer pasar una prueba.
- Toda evidencia indica ambiente, fecha y versión.
- Los datos sensibles se ocultan en capturas y logs.
- Un caso bloqueado no se registra como aprobado.
- Críticos y altos abiertos impiden el dictamen favorable.
- Medios y bajos pendientes requieren riesgo documentado.
- El dictamen corresponde al alcance probado, no a funcionalidades diferidas.
- Resend no forma parte del recorrido.

## Definition of Ready

- HU01, HU02 y HU03 están terminadas.
- E06-E13 están integradas.
- El ambiente es estable y está aislado de producción.
- Los cuatro roles y datos requeridos están disponibles.
- QA conoce la versión candidata y el procedimiento de restauración.

---

## Definition of Done de la Épica

1. **Dado que** el MVP requiere una validación común, **cuando** se consulte el plan y la matriz, **entonces** cada capacidad crítica de E06-E13 tendrá riesgo, caso, capa, resultado y evidencia identificables.
2. **Dado que** backend contiene reglas de seguridad e integridad, **cuando** se ejecute PHPUnit sobre PostgreSQL de pruebas, **entonces** permisos, estados, transacciones, archivos y cálculos críticos concluirán correctamente.
3. **Dado que** frontend concentra los recorridos de usuario, **cuando** se ejecuten Vitest, lint y build, **entonces** las rutas, formularios y estados críticos no presentarán regresiones conocidas.
4. **Dado que** el sistema está integrado, **cuando** QA ejecute el flujo con los cuatro roles, **entonces** tickets, valoración, autorización, reparación, PDF, Archivero, notificaciones, Administración y Dashboard funcionarán coherentemente.
5. **Dado que** se solicita iniciar ÉPICA 15, **cuando** QA emita el dictamen, **entonces** solo será `Aprobado` si no existen defectos críticos o altos abiertos y toda la evidencia requerida está disponible.

## Criterio de cierre

ÉPICA 14 se considera terminada cuando HU01 a HU04 cumplen su Definition of Done, las suites y la matriz crítica son reproducibles, las incidencias están trazadas y QA emite un dictamen explícito para el despliegue institucional.
