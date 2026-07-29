# ÉPICA 01 — Planeación del proyecto

## Identificación

- **Estado real:** Parcial; existen decisiones, código y documentos dispersos, pero no una línea base inicial consolidada y varios documentos conservan tecnologías o alcances descartados.
- **Prioridad:** Alta.
- **Actor funcional principal:** No aplica; es una épica habilitadora para el equipo de desarrollo y la validación institucional.
- **Dependencia principal:** Ninguna.
- **Enfoque:** Consolidación documental y trazabilidad del MVP; no implementa funcionalidad.

## Objetivo

Consolidar el alcance funcional, técnico y organizacional de REPARA-79 para que el equipo comparta una línea base verificable sobre actores, requisitos, arquitectura, calidad, prioridades y dependencias, alineada con las necesidades del CBTA 79 y con las decisiones vigentes del MVP.

## Resultado esperado

Al terminar la épica:

1. Los cuatro roles funcionales oficiales y sus responsabilidades generales estarán documentados sin nombres alternativos.
2. Las capacidades y exclusiones del MVP estarán identificadas y relacionadas con las épicas que las desarrollan.
3. Los requisitos funcionales tendrán identificador, prioridad, fuente, dependencia y criterio verificable.
4. Los requisitos no funcionales tendrán una medida o evidencia de cumplimiento proporcional al MVP.
5. La arquitectura general reflejará el stack y el despliegue vigentes.
6. Backend, Frontend/UX-UI y QA habrán validado la viabilidad y trazabilidad de la línea base desde sus respectivos ámbitos.
7. Las decisiones posteriores de las ÉPICAS 06 a 15 prevalecerán sobre cualquier propuesta preliminar incompatible.

## Alcance esencial

- Visión, problema, objetivos y límites del MVP.
- Identificación de los cuatro roles funcionales oficiales.
- Matriz general de responsabilidades funcionales.
- Catálogo de requisitos funcionales y exclusiones.
- Organización del backlog por épicas e historias de usuario.
- Priorización y dependencias entre capacidades.
- Requisitos no funcionales de seguridad, rendimiento, disponibilidad, usabilidad, mantenibilidad, compatibilidad y recuperación.
- Arquitectura general de frontend, backend, datos, archivos, autenticación y despliegue.
- Validación técnica independiente de Backend y Frontend/UX-UI.
- Revisión de consistencia, verificabilidad y trazabilidad por QA.
- Registro de supuestos, riesgos y decisiones abiertas.

## Recortes deliberados

- No se implementa ni modifica código funcional.
- No se crean migraciones, endpoints, componentes, pruebas automatizadas o configuraciones de producción.
- No se reemplazan los contratos detallados que corresponden a cada épica funcional.
- No se diseña `historial_ticket`; permanece diferido.
- No se incluyen Resend, correo externo, Gemini, SMS, push móvil o integraciones externas.
- No se adopta Docker, Redis, microservicios o infraestructura en la nube para el MVP.
- No se exige una especificación empresarial exhaustiva ni documentación duplicada.
- No se reabre una decisión ya consolidada en las ÉPICAS 06 a 15 sin registrar formalmente el cambio y su impacto.

## Contraste con el estado actual

| Elemento | Estado actual | Ajuste requerido |
| :-- | :-- | :-- |
| Actores funcionales | Parcial | Consolidar exclusivamente los cuatro roles oficiales. |
| Responsables de planeación | Inconsistente | Usar solo `Tech Lead`, `Fullstack Backend`, `Fullstack Frontend/UX-UI` y `QA`. |
| Requisitos funcionales | Parcial y sin trazabilidad uniforme | Asignar identificador, prioridad, épica, dependencia y evidencia. |
| Requisitos no funcionales | Lista genérica | Convertirlos en condiciones medibles o verificables. |
| Arquitectura | Dispersa y parcialmente desactualizada | Documentar la arquitectura vigente y distinguir estado actual de objetivo. |
| Backend | Implementación parcial | Registrar Laravel 12, Sanctum, API REST y PostgreSQL objetivo. |
| Frontend | Implementación parcial | Registrar React 19, TypeScript, Vite 6, Tailwind CSS y Axios. |
| Roles y permisos | Parcialmente implementados | Mantener Backend como autoridad de autorización. |
| Backlog | E06–E15 refinadas; E02–E05 pendientes de revisión | Mantener dependencias y marcar el nivel real de definición. |
| Calidad | Solo pruebas de ejemplo | Definir criterios iniciales sin sustituir la certificación de ÉPICA 14. |
| Despliegue | Sin artefactos versionados | Referenciar el objetivo de ÉPICA 15 sin implementarlo aquí. |

### Evidencia técnica del contraste

- `docs/roles.md` identifica al equipo, pero no define la matriz funcional completa.
- `docs/descripcion.md` todavía menciona React 18+, Laravel 11 y Docker Compose.
- `backend/composer.json` utiliza Laravel 12 y Sanctum.
- `frontend/package.json` utiliza React 19, TypeScript, Vite 6, Tailwind CSS y Axios.
- `backend/routes/api.php` separa rutas públicas, autenticadas y restringidas por rol.
- `backend/app/Http/Middleware/CheckRole.php` valida roles en Backend.
- `frontend/src/constants/roles.ts` contiene los cuatro nombres canónicos.
- `backend/database/seeders/TiposUsuariosSeeder.php` siembra los cuatro roles oficiales.
- `backend/.env.example` conserva SQLite y configuración local, aunque PostgreSQL es el objetivo.
- `frontend/.env.example` conserva variables de Gemini ajenas al MVP.
- Las ÉPICAS 07 a 15 ya contienen decisiones que descartan correo externo, Docker y acceso público directo a archivos.

## Actores funcionales oficiales

| Rol | Responsabilidad general dentro del MVP |
| :-- | :-- |
| `Usuario Registrado` | Reportar desperfectos y consultar la información que le corresponda como creador de tickets. |
| `Responsable del Lugar` | Participar en la atención de las áreas que tenga asignadas y consultar la información permitida de esas áreas. |
| `Personal de Mantenimiento` | Valorar tickets, solicitar materiales, ejecutar reparaciones y generar los resultados técnicos correspondientes. |
| `Subdirector Administrativo` | Autorizar solicitudes, administrar el sistema y consultar información administrativa global. |

Las reglas detalladas de cada acción pertenecen a la épica funcional correspondiente. La interfaz puede adaptar navegación y presentación por rol, pero Backend es la autoridad para autenticar y autorizar cada operación.

## Línea base tecnológica vigente

| Capa | Decisión del MVP |
| :-- | :-- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS y Axios. |
| Backend | Laravel 12, PHP 8.3 objetivo y API REST bajo `/api`. |
| Autenticación | Laravel Sanctum; las rutas protegidas validan el usuario autenticado. |
| Autorización | Middleware, políticas o servicios de Backend basados en los cuatro roles oficiales y en propiedad o relación de área cuando corresponda. |
| Datos | PostgreSQL como motor objetivo y migraciones Laravel auditables. |
| Archivos | Rutas relativas persistidas y descarga mediante endpoints autenticados cuando el archivo sea protegido. |
| Tiempo real | Laravel Reverb y Echo únicamente para notificaciones internas de ÉPICA 11. |
| Procesamiento asíncrono | Cola de base de datos y procesos supervisados cuando una épica lo requiera. |
| Despliegue | Ubuntu Server 24.04 LTS, Nginx, PHP-FPM, PostgreSQL y Supervisor en la red local autorizada. |
| Repositorio | GitFlow adaptado con `main`, `develop`, ramas de trabajo y revisión mediante pull request. |

## Reglas de precedencia documental

1. El código y el esquema desplegado describen el estado real, pero no sustituyen una decisión funcional aprobada.
2. Las decisiones consolidadas más recientes prevalecen sobre documentos preliminares.
3. Las migraciones nuevas corrigen diferencias sin reescribir la historia de ambientes con datos.
4. Cada épica define el contrato detallado de su dominio y debe respetar esta línea base.
5. Una modificación de alcance debe registrar decisión, motivo, impacto, responsable y épicas afectadas.

## Orden y dependencias

| HU | Responsable único | Depende de |
| :-- | :-- | :-- |
| HU01 | Tech Lead | Ninguna |
| HU02 | Tech Lead | HU01-E01 |
| HU03 | Tech Lead | HU01-E01 y HU02-E01 |
| HU04 | Fullstack Backend | HU02-E01 y HU03-E01 |
| HU05 | Fullstack Frontend/UX-UI | HU02-E01 y HU03-E01 |
| HU06 | QA | HU01-E01, HU02-E01, HU03-E01, HU04-E01 y HU05-E01 |

HU04 y HU05 pueden ejecutarse en paralelo cuando Tech Lead entregue el catálogo y la arquitectura preliminar. HU06 revisa la línea base integrada; no ejecuta todavía la certificación funcional de ÉPICA 14.

---

# HU01-E01-Consolidar actores y alcance del MVP

## Descripción

**Como** Tech Lead,  
**quiero** consolidar los actores, objetivos y límites funcionales de REPARA-79,  
**para** que el equipo desarrolle el mismo MVP y evite responsabilidades o capacidades contradictorias.

## Prioridad

Alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/alcance-funcional-mvp.md`.
- Documentar problema, objetivo, usuarios institucionales, supuestos y límites.
- Utilizar exclusivamente los cuatro roles oficiales.
- Crear una matriz de responsabilidades generales por rol.
- Describir el flujo macro desde el registro del ticket hasta su cierre, archivo, notificación y consulta administrativa.
- Identificar capacidades incluidas, diferidas y descartadas.
- Referenciar las épicas que detallan cada capacidad sin duplicar sus contratos.
- Registrar las fuentes institucionales o personas que validan el alcance, sin convertirlas en responsables técnicos de HU.

## Impacto en el modelo de datos

No modifica el modelo de datos. Documenta la finalidad general de:

- `users`
- `tipos_usuarios`
- `usuario_area`
- `tickets`
- tablas operativas relacionadas con valoración, reparación, archivo y notificaciones

La matriz debe respetar que `tipos_usuarios.nombre` contiene los nombres oficiales y que `usuario_area` representa las asignaciones activas de Responsables del Lugar.

## Dependencias

- Documentación original de las ÉPICAS 01 a 15.
- Decisiones consolidadas de las ÉPICAS 06 a 15.
- Disponibilidad de representantes institucionales para validar el alcance cuando sea necesario.

## Subtareas

1. **Consolidar visión y problema** — Redactar la necesidad institucional, los objetivos del sistema, los beneficios esperados y los límites del MVP.
2. **Definir actores funcionales** — Documentar los cuatro roles oficiales, su propósito y sus responsabilidades generales sin introducir sinónimos funcionales.
3. **Delimitar capacidades** — Clasificar las funciones como incluidas, diferidas o descartadas y relacionar cada función incluida con su épica.
4. **Representar el flujo macro** — Documentar el recorrido principal del ticket y sus puntos de intervención por rol.
5. **Registrar validación institucional** — Identificar fuente, fecha, observaciones y aprobación del alcance sin asignar HU a personas ajenas a los cuatro responsables de planeación.

## Criterios de aceptación

1. El documento identifica únicamente `Usuario Registrado`, `Responsable del Lugar`, `Personal de Mantenimiento` y `Subdirector Administrativo`.
2. Cada rol tiene propósito, responsabilidades generales y límites comprensibles.
3. El alcance incluye el flujo desde el reporte del desperfecto hasta el cierre y consulta posterior.
4. Cada capacidad incluida referencia una épica responsable.
5. Las capacidades diferidas o descartadas están separadas de las incluidas.
6. Resend, correo externo, Gemini, SMS y push móvil no aparecen como requisitos del MVP.
7. `historial_ticket` está identificado como capacidad futura.
8. El documento distingue actores funcionales, responsables de planeación y validadores institucionales.
9. No asigna permisos únicamente mediante restricciones visuales del frontend.
10. Las decisiones de E06–E15 no presentan contradicciones con el alcance consolidado.

## Definition of Done

1. Dado que existen documentos preliminares con nombres y alcances distintos, cuando se consulte la línea base funcional, entonces solo aparecerán los cuatro roles oficiales y las capacidades vigentes del MVP.
2. Dado que una capacidad puede pertenecer a otra épica, cuando se revise su alcance, entonces tendrá una referencia trazable sin duplicar el contrato detallado.
3. Dado que existen funciones descartadas o diferidas, cuando se evalúe el MVP, entonces estarán identificadas de forma explícita y no podrán interpretarse como compromisos de desarrollo.

## Reglas de negocio

- Los roles funcionales oficiales no se renombran.
- `Técnico` no es un rol; `valoración técnica` e `informe técnico` sí son expresiones válidas.
- Backend es la autoridad de autorización.
- La relación activa entre Responsable del Lugar y área se representa mediante `usuario_area`.
- El flujo E06–E11 mantiene los estados y el orden transaccional ya consolidados.
- Una nueva capacidad solo entra al MVP mediante una decisión de alcance registrada.

## Definition of Ready

- La documentación original está disponible.
- Las decisiones de E06–E15 están accesibles.
- Los cuatro roles oficiales fueron confirmados.
- Existe una persona o instancia institucional capaz de validar el alcance.

---

# HU02-E01-Organizar requisitos y backlog del MVP

## Descripción

**Como** Tech Lead,  
**quiero** organizar los requisitos funcionales y el backlog con trazabilidad y dependencias,  
**para** que el equipo pueda priorizar, refinar y entregar el MVP sin omisiones ni trabajo redundante.

## Prioridad

Alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/catalogo-requisitos-mvp.md`.
- Asignar identificadores estables `RF-XXX` a los requisitos funcionales.
- Registrar para cada requisito:
  - nombre;
  - descripción;
  - fuente;
  - prioridad;
  - rol beneficiado;
  - épica responsable;
  - dependencias;
  - estado de definición;
  - criterio verificable;
  - exclusiones relacionadas.
- Crear una matriz `requisito → épica → HU → evidencia`.
- Organizar las épicas en orden funcional y técnico.
- Identificar la ruta crítica y las capacidades que pueden avanzar en paralelo.
- Mantener las ÉPICAS 02 a 05 como pendientes de refinación mientras no cumplan el estándar vigente.

## Impacto en el modelo de datos

No modifica el modelo de datos. Cada requisito que utilice persistencia debe referenciar las tablas o entidades afectadas conocidas, sin definir columnas nuevas fuera de la épica responsable.

## Dependencias

- HU01-E01-Consolidar actores y alcance del MVP.
- Documentos originales de las épicas.
- Documentos refinados disponibles.
- Estado real del repositorio.

## Subtareas

1. **Inventariar requisitos funcionales** — Extraer las capacidades vigentes de documentos, código y decisiones, eliminar duplicados y asignar identificadores estables.
2. **Relacionar requisitos con el backlog** — Asociar cada requisito con una épica y, cuando exista, con la HU que lo entrega.
3. **Definir prioridad y estado** — Clasificar cada requisito por prioridad y señalar si está propuesto, refinado, parcial, implementado, validado o diferido.
4. **Mapear dependencias** — Documentar precedencias, ruta crítica y posibilidades reales de trabajo paralelo.
5. **Registrar exclusiones y cambios** — Relacionar funciones descartadas con la decisión que impide reincorporarlas de manera accidental.

## Criterios de aceptación

1. Cada requisito funcional tiene un identificador único `RF-XXX`.
2. Cada requisito incluido está asociado con una épica responsable.
3. Cada requisito tiene prioridad, fuente, rol beneficiado, dependencia y criterio verificable.
4. La matriz permite navegar desde un requisito hasta su HU y evidencia cuando estas ya existen.
5. Las ÉPICAS 02 a 05 no se presentan como refinadas mientras falten sus documentos bajo el estándar vigente.
6. La ruta crítica `E07 → E08 → E09 → E10 → E11` se conserva.
7. E14 consolida calidad y E15 depende de su dictamen aprobado.
8. Las capacidades descartadas no aparecen como pendientes de implementación.
9. El catálogo diferencia el estado documentado del estado real del código.
10. No existen dos requisitos activos que describan la misma entrega sin una justificación.

## Definition of Done

1. Dado que los requisitos provienen de fuentes distintas, cuando se consulte el catálogo, entonces cada capacidad vigente tendrá un identificador, una fuente y una épica responsable.
2. Dado que el código puede estar adelantado o rezagado frente al backlog, cuando se revise un requisito, entonces su estado de definición y su estado real estarán diferenciados.
3. Dado que varias entregas dependen de contratos anteriores, cuando se planifique el desarrollo, entonces la matriz mostrará la ruta crítica y las dependencias que bloquean cada HU.

## Reglas de negocio

- Un requisito funcional activo pertenece a una épica responsable.
- Una HU conserva un único responsable de planeación.
- Un requisito descartado no puede permanecer simultáneamente como pendiente.
- La prioridad debe responder al valor, riesgo y dependencia del MVP.
- Una implementación parcial no equivale a requisito validado.
- Cambiar una dependencia consolidada exige registrar su impacto.

## Definition of Ready

- HU01-E01 está terminada.
- Las épicas originales disponibles fueron inventariadas.
- El estado del repositorio fue revisado.
- Las decisiones vigentes están identificadas.

---

# HU03-E01-Definir arquitectura y calidad del MVP

## Descripción

**Como** Tech Lead,  
**quiero** definir la arquitectura general y los atributos de calidad verificables del MVP,  
**para** que las decisiones técnicas sean coherentes con el alcance, el hardware y la operación institucional.

## Prioridad

Alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/arquitectura-mvp.md`.
- Incluir diagramas mínimos de:
  - contexto;
  - contenedores o componentes principales;
  - flujo de autenticación y autorización;
  - persistencia de datos y archivos;
  - despliegue objetivo.
- Documentar responsabilidades y límites de frontend, API, PostgreSQL, filesystem, cola, Reverb y Nginx.
- Distinguir claramente arquitectura actual, objetivo del MVP y capacidades futuras.
- Crear una sección de requisitos no funcionales con identificadores `RNF-XXX`.
- Registrar para cada RNF:
  - atributo;
  - escenario;
  - condición;
  - medida o umbral;
  - ambiente de verificación;
  - evidencia esperada;
  - épica o HU responsable.
- Mantener un registro breve de decisiones arquitectónicas relevantes y sus consecuencias.

## Impacto en el modelo de datos

No modifica el modelo. Documenta:

- PostgreSQL como motor objetivo.
- Migraciones Laravel como mecanismo de evolución.
- Claves foráneas, índices y restricciones como parte de la integridad.
- Rutas relativas para archivos protegidos.
- Base de datos exclusiva para pruebas de integración.
- Respaldos de datos y archivos conforme a ÉPICA 15.

## Dependencias

- HU01-E01-Consolidar actores y alcance del MVP.
- HU02-E01-Organizar requisitos y backlog del MVP.
- Restricciones del servidor y la red institucional.
- Decisiones técnicas consolidadas de E06–E15.

## Subtareas

1. **Modelar contexto y componentes** — Representar usuarios, navegador, frontend, API, base de datos, almacenamiento, cola, Reverb y proxy institucional.
2. **Definir límites técnicos** — Documentar responsabilidades, protocolos, rutas y fuentes de verdad de cada componente.
3. **Especificar atributos de calidad** — Convertir seguridad, rendimiento, disponibilidad, usabilidad, mantenibilidad, compatibilidad y recuperación en RNF verificables.
4. **Registrar decisiones y riesgos** — Documentar alternativas relevantes, decisión vigente, motivo, consecuencias y riesgo residual.
5. **Alinear operación institucional** — Verificar que la arquitectura sea viable en el Dell PowerEdge T110 II, con 8 GB de RAM, un HDD y acceso restringido a la red local.

## Criterios de aceptación

1. La arquitectura identifica React 19, TypeScript, Vite 6, Laravel 12, PHP 8.3 objetivo, Sanctum y PostgreSQL.
2. Nginx es el único punto de entrada del despliegue objetivo.
3. React se representa como build estático y Vite no aparece como proceso de producción.
4. PostgreSQL y Reverb no se publican directamente fuera del servidor.
5. La autorización se ejecuta en Backend y no depende de ocultar componentes.
6. Los archivos protegidos se consultan mediante endpoints autenticados.
7. Cada RNF tiene identificador, escenario, medida y evidencia.
8. Los umbrales son proporcionales al hardware y al uso institucional esperado.
9. La arquitectura distingue el estado actual de la solución objetivo.
10. Resend, Gemini, Docker, Redis y microservicios no se presentan como dependencias del MVP.
11. Reverb está limitado a la actualización de notificaciones internas y REST conserva la recuperación funcional.
12. La recuperación contempla PostgreSQL, evidencias, PDF e inventario de versión.

## Definition of Done

1. Dado que existen referencias técnicas incompatibles, cuando se consulte la arquitectura, entonces se distinguirán el estado actual, el objetivo aprobado y las capacidades futuras.
2. Dado que un atributo de calidad debe comprobarse, cuando se revise cualquier RNF, entonces tendrá una condición, una medida y una evidencia esperada.
3. Dado que el servidor tiene recursos limitados, cuando se evalúe la solución, entonces los componentes y procesos propuestos serán compatibles con el despliegue institucional definido.

## Reglas de negocio

- Backend es la fuente de verdad para autenticación, autorización y reglas de negocio.
- PostgreSQL realiza persistencia y agregaciones que no deben calcularse sobre colecciones completas en React.
- Los secretos no se almacenan en Git.
- Los archivos sensibles no se publican mediante rutas directas.
- Las migraciones evolucionan el esquema sin reescribir ambientes con datos.
- Una falla de actualización en tiempo real no elimina la capacidad REST.
- La arquitectura evita componentes sin un caso de uso directo en el MVP.

## Definition of Ready

- HU01-E01 y HU02-E01 están terminadas.
- El stack real fue inspeccionado.
- Las restricciones de infraestructura están confirmadas.
- Las decisiones de E06–E15 están disponibles.

---

# HU04-E01-Validar línea base de backend y datos

## Descripción

**Como** Fullstack Backend,  
**quiero** validar la viabilidad de la arquitectura, los requisitos y el modelo de datos propuestos,  
**para** identificar dependencias o inconsistencias antes de implementar los servicios del MVP.

## Prioridad

Alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Crear `docs/validacion-backend-linea-base.md`.
- Contrastar el catálogo de requisitos y la arquitectura con:
  - `backend/composer.json`;
  - `backend/routes/api.php`;
  - modelos, requests, middleware y controladores;
  - migraciones y seeders;
  - `database-design/repara79_schema_actual.sql`;
  - configuración de autenticación, base de datos, archivos y colas.
- Identificar capacidades hechas, parciales, faltantes o incorrectas.
- Validar que las entidades y relaciones soporten el alcance previsto.
- Registrar riesgos de seguridad, consistencia, concurrencia, transacciones y manejo de archivos.
- Proponer ajustes únicamente como decisiones o pendientes de la épica correspondiente; no implementarlos.

## Impacto en el modelo de datos

No crea migraciones. La validación debe identificar:

- tablas y campos implicados por requisito;
- nulabilidad y unicidad relevante;
- claves foráneas e índices necesarios;
- catálogos protegidos;
- diferencias entre migraciones, esquema de referencia y objetivo;
- épica responsable de cada ajuste.

## Dependencias

- HU02-E01-Organizar requisitos y backlog del MVP.
- HU03-E01-Definir arquitectura y calidad del MVP.
- Acceso al código Backend y al esquema de referencia.

## Subtareas

1. **Auditar componentes backend** — Inventariar autenticación, autorización, rutas, controladores, servicios, modelos, migraciones, seeders, colas y archivos.
2. **Mapear requisitos a datos** — Relacionar cada capacidad persistente con tablas, campos, restricciones y relaciones conocidas.
3. **Evaluar seguridad y consistencia** — Identificar riesgos de permisos, validación, estados, concurrencia, transacciones, archivos y credenciales.
4. **Clasificar brechas técnicas** — Registrar cada hallazgo como hecho, parcial, faltante o incorrecto y asignarlo a la épica responsable.
5. **Emitir validación backend** — Documentar viabilidad, restricciones, decisiones abiertas y condiciones para iniciar las épicas funcionales.

## Criterios de aceptación

1. La validación cubre código, migraciones, seeders, configuración y SQL de referencia.
2. Cada requisito con persistencia referencia sus tablas principales.
3. Cada brecha está clasificada y asignada a una épica responsable.
4. Se identifica que el registro debe asignar `Usuario Registrado` desde un catálogo existente.
5. Se identifica que las cuentas inactivas y sus tokens requieren tratamiento de seguridad conforme a E12.
6. Se identifica que los estados y roles oficiales no deben crearse durante operaciones ordinarias.
7. Se registran las diferencias conocidas de materiales, reparación, bitácora y notificaciones.
8. Se identifica el riesgo del seeder con credenciales fijas para E15.
9. No se modifica código ni se crean migraciones como parte de la HU.
10. El documento concluye si la línea base es viable y enumera las condiciones pendientes.

## Definition of Done

1. Dado que el código implementa solo una parte del MVP, cuando se consulte la validación backend, entonces cada capacidad revisada estará clasificada como hecha, parcial, faltante o incorrecta.
2. Dado que el esquema histórico difiere del objetivo, cuando se documente una brecha, entonces tendrá tablas afectadas, riesgo y épica responsable sin reescribir migraciones.
3. Dado que la arquitectura propone servicios protegidos, cuando finalice la revisión, entonces estarán identificadas las condiciones de autenticación, autorización, transacción y archivos necesarias para implementarlos.

## Reglas de negocio

- La validación no autoriza implementación funcional.
- Los nombres de roles y estados provienen de catálogos protegidos.
- Una restricción visual no sustituye un permiso backend.
- Las operaciones críticas deben identificar su límite transaccional.
- Las rutas persistidas de archivos son relativas.
- Cada brecha pertenece a una sola épica responsable, aunque pueda bloquear otras.

## Definition of Ready

- HU02-E01 y HU03-E01 están terminadas.
- El repositorio y el esquema están disponibles.
- Las diferencias históricas conocidas están documentadas.
- No existen cambios locales ajenos que impidan una revisión confiable.

---

# HU05-E01-Definir línea base frontend y experiencia por rol

## Descripción

**Como** Fullstack Frontend/UX-UI,  
**quiero** definir la arquitectura frontend y la experiencia general de los cuatro roles,  
**para** que la navegación y los recorridos del MVP sean coherentes, accesibles e integrables con la API.

## Prioridad

Alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Crear `docs/linea-base-frontend-ux.md`.
- Contrastar la propuesta con:
  - `frontend/package.json`;
  - `frontend/src/App.tsx`;
  - `frontend/src/layouts/MainLayout.tsx`;
  - `frontend/src/modules`;
  - `frontend/src/api/axios.ts`;
  - `frontend/src/constants/roles.ts`;
  - contexto y protecciones de autenticación.
- Definir mapa general de navegación por rol.
- Definir convenciones para módulos, páginas, componentes, servicios y tipos.
- Establecer patrones de estados de carga, vacío, error, éxito, confirmación y acceso denegado.
- Definir criterios básicos de diseño responsivo y accesibilidad.
- Registrar dependencias de contratos Backend y estrategia de mocks aprobados.
- Identificar capacidades hechas, parciales, faltantes o inconsistentes sin implementarlas.

## Impacto en el modelo de datos

No modifica el modelo. Consume DTO y catálogos proporcionados por Backend; no duplica reglas, nombres de roles, estados o relaciones como fuentes independientes.

## Dependencias

- HU02-E01-Organizar requisitos y backlog del MVP.
- HU03-E01-Definir arquitectura y calidad del MVP.
- Acceso al frontend actual y a los contratos disponibles.

## Subtareas

1. **Auditar estructura frontend** — Inventariar rutas, layouts, módulos, servicios, contexto de autenticación, guardas y convenciones existentes.
2. **Definir navegación por rol** — Documentar accesos y recorridos principales de los cuatro roles sin convertir el menú en mecanismo de autorización.
3. **Establecer patrones de interacción** — Definir tratamiento consistente de formularios, tablas, carga, vacío, error, confirmación y acciones críticas.
4. **Definir integración con API** — Documentar DTO, errores, archivos, `Blob`, `multipart/form-data`, variables de entorno y uso temporal de mocks.
5. **Emitir validación frontend** — Registrar brechas, dependencias, riesgos de usabilidad y condiciones para iniciar las épicas funcionales.

## Criterios de aceptación

1. El documento refleja React 19, TypeScript, Vite 6, Tailwind CSS y Axios.
2. Existe un mapa de navegación para los cuatro roles oficiales.
3. Las rutas y elementos ocultos no se presentan como controles suficientes de autorización.
4. Las convenciones distinguen módulos, páginas, componentes, servicios y tipos.
5. Se definen estados de carga, vacío, error, éxito y acceso denegado.
6. Los formularios críticos contemplan validación, prevención de doble envío y conservación de datos ante errores recuperables.
7. Los contratos Backend son la fuente de DTO, permisos y códigos de error.
8. Los mocks deben respetar contratos aprobados y no permiten cerrar una HU sin integración.
9. Se identifica que `frontend/.env.example` y el fallback local de Axios requieren alineación posterior.
10. Se identifican brechas de frontend sin realizar implementación funcional.
11. Se incluyen criterios básicos de teclado, etiquetas, contraste y diseño responsivo.

## Definition of Done

1. Dado que cada rol tiene recorridos distintos, cuando se consulte la línea base frontend, entonces la navegación y las capacidades visibles estarán mapeadas con los cuatro nombres oficiales.
2. Dado que una interfaz puede desarrollarse antes que la API, cuando se utilicen mocks, entonces respetarán el contrato aprobado y la HU permanecerá pendiente hasta su integración real.
3. Dado que el usuario puede encontrar esperas o errores, cuando se revise un patrón de interacción, entonces tendrá una respuesta definida para carga, vacío, error y reintento.

## Reglas de negocio

- Frontend adapta la experiencia, pero no decide la autorización final.
- Los roles se consumen mediante constantes canónicas.
- Los DTO no se infieren de tablas ni se duplican sin contrato.
- Una URL directa a `/storage` no sustituye un endpoint autenticado.
- Las acciones críticas deben impedir dobles envíos y comunicar el resultado.
- Los mocks son temporales y trazables al contrato que representan.

## Definition of Ready

- HU02-E01 y HU03-E01 están terminadas.
- El frontend actual puede inspeccionarse.
- Los cuatro roles oficiales están documentados.
- Existen contratos o decisiones suficientes para los recorridos ya definidos.

---

# HU06-E01-Validar trazabilidad de la planeación

## Descripción

**Como** QA,  
**quiero** revisar la completitud, consistencia y verificabilidad de la línea base del proyecto,  
**para** detectar ambigüedades antes de que se conviertan en defectos de implementación.

## Prioridad

Alta.

## Responsable único

QA.

## Alcance técnico

- Crear `docs/validacion-planeacion-epica-01.md`.
- Revisar:
  - alcance funcional;
  - actores y responsabilidades;
  - catálogo de requisitos;
  - backlog y dependencias;
  - arquitectura;
  - requisitos no funcionales;
  - validaciones Backend y Frontend/UX-UI.
- Verificar la matriz `requisito → épica → HU → criterio → evidencia`.
- Identificar contradicciones, omisiones, requisitos no verificables y referencias rotas.
- Registrar incidencias documentales con severidad, responsable y resolución.
- Emitir dictamen `Aprobada`, `Aprobada con observaciones` o `Requiere correcciones`.
- Limitar el dictamen a la calidad de la planeación; no sustituye las pruebas de las épicas ni el dictamen de E14.

## Impacto en el modelo de datos

No modifica el modelo. QA verifica que todo requisito persistente identifique sus entidades afectadas y que ninguna decisión documental contradiga relaciones, nulabilidad, unicidad o catálogos ya consolidados.

## Dependencias

- HU01-E01-Consolidar actores y alcance del MVP.
- HU02-E01-Organizar requisitos y backlog del MVP.
- HU03-E01-Definir arquitectura y calidad del MVP.
- HU04-E01-Validar línea base de backend y datos.
- HU05-E01-Definir línea base frontend y experiencia por rol.

## Subtareas

1. **Revisar completitud documental** — Comprobar que cada entregable exista, tenga alcance, responsable, versión y referencias válidas.
2. **Auditar trazabilidad** — Recorrer muestras críticas desde requisito hasta épica, HU, criterio y evidencia esperada.
3. **Evaluar verificabilidad** — Detectar términos ambiguos, criterios no observables y RNF sin medida o ambiente.
4. **Registrar incidencias** — Documentar hallazgo, severidad, evidencia, responsable y condición de cierre.
5. **Emitir dictamen de planeación** — Resumir cobertura, riesgos aceptados, observaciones pendientes y resultado final de la revisión.

## Criterios de aceptación

1. Todos los entregables de HU01–HU05 fueron revisados.
2. Los enlaces y referencias entre documentos son válidos.
3. Una muestra de cada capacidad crítica puede trazarse desde requisito hasta evidencia esperada.
4. Los cuatro roles usan exactamente la nomenclatura oficial.
5. No existen HU con más de un responsable.
6. Cada requisito funcional activo pertenece a una épica.
7. Cada RNF tiene condición, medida y evidencia verificable.
8. Las discrepancias entre código, esquema y objetivo están visibles.
9. Cada incidencia tiene severidad, responsable y estado.
10. Ninguna observación crítica permanece abierta para emitir `Aprobada`.
11. El dictamen aclara que no certifica todavía la funcionalidad del MVP.

## Definition of Done

1. Dado que la planeación reúne fuentes funcionales y técnicas distintas, cuando QA complete la revisión, entonces cada contradicción u omisión encontrada tendrá evidencia, severidad y responsable.
2. Dado que un requisito debe poder probarse, cuando se recorra la matriz de trazabilidad, entonces existirá una ruta desde su identificador hasta el criterio y la evidencia esperada.
3. Dado que ÉPICA 14 certifica el producto integrado, cuando se emita el dictamen de ÉPICA 01, entonces quedará limitado a la calidad y preparación de la línea base documental.

## Reglas de negocio

- `Aprobada` exige cero incidencias críticas abiertas.
- `Aprobada con observaciones` solo admite pendientes que no cambian alcance, arquitectura o ruta crítica.
- `Requiere correcciones` bloquea el cierre de la épica.
- QA no redefine requisitos; registra la ambigüedad y solicita decisión al responsable.
- Una referencia inexistente se considera una brecha de trazabilidad.
- Este dictamen no reemplaza pruebas funcionales, regresión o liberación.

## Definition of Ready

- HU01–HU05 están terminadas.
- Los documentos tienen versión revisable.
- La matriz de trazabilidad está disponible.
- Las decisiones abiertas tienen un responsable identificado.

---

## Definition of Done de la épica

1. Dado que la planeación original estaba dispersa y parcialmente desactualizada, cuando se cierre ÉPICA 01, entonces existirá una línea base coherente de alcance, requisitos, arquitectura, calidad y backlog.
2. Dado que el proyecto utiliza cuatro roles funcionales y cuatro responsables de planeación, cuando se revisen los entregables, entonces sus nombres y responsabilidades serán consistentes en todos los documentos.
3. Dado que Backend y Frontend implementan componentes distintos, cuando finalicen sus validaciones, entonces las brechas técnicas estarán clasificadas y asignadas a la épica que debe resolverlas.
4. Dado que QA debe verificar la preparación del backlog, cuando emita el dictamen, entonces no existirán incidencias críticas abiertas ni requisitos activos sin trazabilidad.
5. Dado que E06–E15 contienen decisiones posteriores, cuando exista una discrepancia con una propuesta preliminar, entonces prevalecerá la decisión consolidada más reciente y el cambio quedará registrado.

## Riesgos y decisiones abiertas

- Las ÉPICAS 02 a 05 deben refinarse antes de completar la matriz definitiva.
- La validación institucional del alcance debe identificar una persona o instancia, aunque no sea responsable técnico de HU.
- Los umbrales numéricos de rendimiento deben confirmarse con volumen esperado y pruebas sobre hardware representativo.
- Los documentos iniciales `docs/descripcion.md` y `frontend/.env.example` continúan desactualizados hasta que una HU autorizada los alinee.
- La autenticación actual mediante token Sanctum y almacenamiento del cliente debe evaluarse dentro del contrato de la épica de autenticación y en la revisión de seguridad.
