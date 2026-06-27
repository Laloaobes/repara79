\# 04\_ESTADO\_ACTUAL.md



\# Estado Actual del Proyecto



> Estado funcional y técnico del proyecto REPARA-79.



\*\*Versión:\*\* 1.0

\*\*Estado del documento:\*\* Vigente



\---



\# 1. Objetivo



Este documento describe el estado actual del desarrollo de \*\*REPARA-79\*\*, indicando el grado de avance de cada componente principal del sistema.



Su finalidad es proporcionar una visión clara del proyecto para desarrolladores, personal de QA y asistentes de IA, permitiendo identificar qué funcionalidades ya forman parte de la línea base del sistema, cuáles se encuentran en desarrollo y cuáles corresponden a futuras iteraciones.



Este documento deberá actualizarse al finalizar cada Sprint significativo.



\---



\# 2. Resumen ejecutivo



REPARA-79 cuenta actualmente con una arquitectura estable y una base tecnológica completamente funcional.



La infraestructura principal del sistema ya fue implementada y validada, permitiendo iniciar el desarrollo del módulo central de Gestión de Tickets.



El proyecto se encuentra en una etapa donde la prioridad ya no es construir la infraestructura, sino implementar la lógica de negocio del proceso de mantenimiento.



\---



\# 3. Estado general del proyecto



| Área                | Estado           |

| ------------------- | ---------------- |

| Arquitectura        | ✅ Finalizada     |

| Modelo de datos     | ✅ Finalizado     |

| Backend base        | ✅ Implementado   |

| Frontend base       | ✅ Implementado   |

| Autenticación       | ✅ Implementada   |

| Dashboard           | ✅ Implementado   |

| Gestión de Tickets  | 🚧 En desarrollo |

| Reporte PDF         | ⏳ Pendiente      |

| Bitácora automática | ⏳ Pendiente      |

| Notificaciones      | ⏳ Pendientes     |



\---



\# 4. Funcionalidades implementadas



Las siguientes funcionalidades forman parte de la línea base del proyecto y se consideran estables.



\## Autenticación



Estado:



\*\*Implementada\*\*



Incluye:



\* Inicio de sesión.

\* Cierre de sesión.

\* Gestión de sesión mediante Laravel Sanctum.

\* Obtención del usuario autenticado mediante `/api/me`.

\* Protección de rutas autenticadas.



Esta funcionalidad no forma parte del alcance del Sprint actual y no deberá modificarse sin autorización.



\---



\## Backend



Estado:



\*\*Implementado\*\*



Actualmente se dispone de:



\* Laravel 12 configurado.

\* Conexión con PostgreSQL.

\* Migraciones base.

\* Seeders.

\* Modelos iniciales.

\* Configuración de Sanctum.



La infraestructura necesaria para implementar la lógica del negocio ya está disponible.



\---



\## Frontend



Estado:



\*\*Implementado\*\*



Actualmente se dispone de:



\* React.

\* TypeScript.

\* Vite.

\* Axios.

\* Integración con la API.

\* Dashboard inicial.



Las vistas correspondientes al módulo de Tickets aún no han sido desarrolladas.



\---



\## Base de datos



Estado:



\*\*Implementada\*\*



Existe un modelo de datos definitivo que representa el dominio del negocio.



El esquema contempla las entidades necesarias para:



\* Usuarios.

\* Áreas.

\* Tickets.

\* Valoraciones.

\* Materiales.

\* Reparaciones.

\* Evidencias.

\* Bitácoras.

\* Historial.

\* Notificaciones.



No se prevén cambios estructurales antes de implementar el módulo de Tickets.



\---



\# 5. Sprint actual



\## Objetivo principal



Implementar el módulo completo de Gestión de Tickets de Mantenimiento.



Este módulo constituye el núcleo funcional del sistema y concentra la mayor parte de las reglas de negocio documentadas.



\---



\## Alcance del Sprint



Durante esta etapa deberán implementarse las siguientes funcionalidades:



\### Gestión de Tickets



\* Registro de Tickets.

\* Consulta de Tickets.

\* Actualización de Tickets (cuando las reglas de negocio lo permitan).

\* Consulta del historial de un Ticket.



\---



\### Valoración técnica



\* Inspección del desperfecto.

\* Registro de materiales.

\* Registro de costos.

\* Cambio automático del estado a \*\*Valorado\*\*.



\---



\### Autorización administrativa



\* Consulta de valoraciones.

\* Aprobación de la propuesta de materiales y costos.

\* Rechazo de la propuesta indicando el motivo.

\* Cambio automático del estado del Ticket.



\---



\### Reparación



\* Inicio de la reparación.

\* Cambio del estado a \*\*En reparación\*\*.

\* Registro de descripción del trabajo.

\* Captura de evidencias fotográficas.

\* Finalización de la reparación.



\---



\### Cierre



Al concluir la reparación deberán ejecutarse automáticamente las siguientes acciones:



\* Cambio del estado a \*\*Reparado\*\*.

\* Registro en bitácora.

\* Generación del reporte PDF.

\* Notificación al Responsable del Lugar.



\---



\# 6. Componentes que no deben modificarse



Durante el desarrollo del módulo de Tickets deberán mantenerse sin cambios los siguientes componentes:



\## Autenticación



No modificar:



\* Login.

\* Logout.

\* Laravel Sanctum.

\* Endpoint `/api/me`.

\* Middleware de autenticación.



\---



\## Arquitectura



No modificar:



\* Separación Frontend / Backend.

\* Comunicación mediante Axios.

\* Organización general del proyecto.



\---



\## Modelo de datos



No modificar:



\* Nombres de tablas.

\* Relaciones.

\* Claves primarias.

\* Claves foráneas.

\* Catálogos oficiales.



Toda modificación estructural deberá aprobarse previamente.



\---



\# 7. Funcionalidades pendientes



Las siguientes funcionalidades aún no han sido implementadas.



\## Módulo Tickets



Estado:



\*\*Pendiente\*\*



Incluye:



\* CRUD de Tickets.

\* Valoraciones.

\* Materiales.

\* Flujo de aprobación.

\* Reparaciones.

\* Evidencias.

\* Bitácora.

\* Reportes.



\---



\## Gestión administrativa



Estado:



\*\*Pendiente\*\*



Incluye:



\* Administración de usuarios.

\* Cambio de tipo de usuario.

\* Promoción de Subdirector Administrativo.

\* Gestión de áreas.

\* Asignación de responsables.



\---



\## Reportes



Estado:



\*\*Pendiente\*\*



Incluye:



\* Generación automática del reporte PDF.

\* Consulta de reportes históricos.



\---



\## Notificaciones



Estado:



\*\*Pendiente\*\*



Incluye:



\* Ticket registrado.

\* Valoración aprobada.

\* Valoración rechazada.

\* Reparación concluida.



\---



\# 8. Riesgos identificados



Durante el desarrollo del módulo de Tickets deberán evitarse los siguientes riesgos:



\* Romper la autenticación existente.

\* Duplicar lógica de negocio.

\* Modificar el modelo de datos sin autorización.

\* Implementar reglas del negocio en el Frontend.

\* Permitir transiciones inválidas entre estados.

\* Omitir el registro del historial del Ticket.

\* No generar los procesos automáticos asociados al cierre del Ticket.



\---



\# 9. Deuda técnica



Actualmente no existe deuda técnica crítica identificada.



Las tareas pendientes corresponden al desarrollo funcional planificado y no a correcciones de la infraestructura existente.



Cualquier deuda técnica identificada durante el desarrollo deberá documentarse y priorizarse para su resolución en Sprints posteriores.



\---



\# 10. Prioridad actual



La prioridad absoluta del proyecto es implementar el flujo completo de gestión de Tickets conforme a las reglas de negocio definidas.



Esto incluye:



\* Registro.

\* Valoración.

\* Autorización.

\* Reparación.

\* Evidencias.

\* Bitácora.

\* Reporte PDF.

\* Notificaciones.



No deberán desarrollarse funcionalidades fuera de este alcance hasta completar el flujo principal.



\---



\# 11. Criterios para considerar el módulo Tickets como finalizado



El módulo podrá considerarse completo cuando cumpla, al menos, los siguientes criterios:



\* El Usuario Registrado o Responsable del Lugar pueda crear un Ticket.

\* El Personal de Mantenimiento pueda valorar el Ticket y registrar materiales y costos.

\* El Subdirector Administrativo pueda aprobar o rechazar la valoración.

\* El Personal de Mantenimiento pueda iniciar la reparación únicamente cuando el Ticket esté autorizado.

\* Durante la reparación se registren evidencias fotográficas y la descripción del trabajo.

\* El Ticket cambie automáticamente al estado \*\*Reparado\*\* al concluir el proceso.

\* Se genere automáticamente la bitácora correspondiente.

\* Se genere automáticamente el reporte PDF.

\* El Responsable del Lugar reciba la notificación de reparación concluida.



\---



\# 12. Próximo documento



El siguiente documento de esta carpeta es:



```text

05\_FLUJO\_TICKETS.md

```



Este documento constituye la especificación funcional oficial del módulo de Gestión de Tickets.



Describe en detalle:



\* Los actores involucrados.

\* Las reglas de negocio.

\* Las transiciones de estado.

\* Los permisos de cada tipo de usuario.

\* Los procesos automáticos.

\* El flujo principal y los flujos alternos.



Su contenido deberá utilizarse como referencia principal durante la implementación del módulo.



\---



\# 13. Consideraciones finales



REPARA-79 ha superado la etapa de configuración inicial y se encuentra preparado para iniciar el desarrollo de su componente principal.



La arquitectura, el modelo de datos y las convenciones de desarrollo ya fueron definidos y documentados.



El siguiente paso consiste en implementar el módulo de Gestión de Tickets respetando estrictamente las reglas de negocio establecidas y manteniendo la coherencia con la arquitectura del sistema.



Este documento deberá actualizarse al finalizar cada Sprint para reflejar el estado real del proyecto y servir como referencia para futuras iteraciones.



