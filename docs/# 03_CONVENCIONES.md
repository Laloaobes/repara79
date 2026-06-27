\# 03\_CONVENCIONES.md



\# Convenciones de Desarrollo



> Manual de ingeniería y estándar de desarrollo de REPARA-79.



\*\*Versión:\*\* 1.0

\*\*Estado:\*\* Vigente



\---



\# 1. Objetivo



Este documento establece las normas técnicas que deberán seguir todos los integrantes del equipo de desarrollo y cualquier asistente de IA que participe en la evolución del proyecto.



Su objetivo es garantizar:



\* Uniformidad del código.

\* Mantenibilidad.

\* Escalabilidad.

\* Compatibilidad con la arquitectura.

\* Protección de la lógica de negocio.

\* Consistencia entre Frontend, Backend y Base de Datos.



Estas convenciones son obligatorias.



\---



\# 2. Principios de desarrollo



Todo desarrollo realizado en REPARA-79 deberá respetar los siguientes principios:



\* Simplicidad.

\* Legibilidad.

\* Responsabilidad única.

\* Reutilización.

\* Bajo acoplamiento.

\* Alta cohesión.

\* Escalabilidad.

\* Compatibilidad con Laravel.



Antes de escribir código debe priorizarse la claridad sobre la complejidad.



\---



\# 3. Stack oficial



\## Frontend



\* React

\* TypeScript

\* Vite

\* Axios



\## Backend



\* Laravel 12

\* PHP 8.3

\* Laravel Sanctum



\## Base de datos



\* PostgreSQL



No deberán incorporarse nuevas tecnologías sin aprobación del equipo.



\---



\# 4. Arquitectura obligatoria



Toda funcionalidad deberá respetar el siguiente flujo.



```text

React

&#x20;   │

Axios

&#x20;   │

Laravel

&#x20;   │

Controllers

&#x20;   │

FormRequest

&#x20;   │

Models

&#x20;   │

PostgreSQL

```



No deberá romperse esta arquitectura.



\---



\# 5. Modelo de datos



El modelo oficial es el definido por:



```text

rpr-79\_adaptado\_laravel\_corregido.sql

```



Está prohibido:



\* Crear tablas duplicadas.

\* Modificar nombres de tablas.

\* Modificar nombres de columnas.

\* Eliminar relaciones.

\* Romper claves foráneas.

\* Crear estructuras paralelas.



Toda modificación estructural deberá realizarse mediante una nueva migración.



\---



\# 6. Migraciones



\## Regla principal



Una migración ejecutada nunca deberá modificarse.



Si existe un cambio estructural:



\* Se crea una nueva migración.

\* Se documenta el cambio.

\* Se mantiene el historial del proyecto.



\---



\# 7. Backend



\## Controllers



Los controladores deberán limitarse a:



\* recibir la solicitud;

\* delegar la lógica correspondiente;

\* devolver una respuesta HTTP.



No deberán contener lógica de negocio compleja.



\---



\## FormRequest



Toda validación de entrada deberá implementarse mediante clases `FormRequest`.



No utilizar validaciones directamente en los controladores, salvo casos excepcionales debidamente justificados.



\---



\## Modelos Eloquent



Toda interacción con la base de datos deberá realizarse mediante modelos Eloquent.



Cada modelo deberá declarar explícitamente sus relaciones (`belongsTo`, `hasMany`, etc.) para aprovechar las capacidades del ORM y mantener la claridad del dominio.



\---



\## Policies



Las autorizaciones deberán implementarse mediante Policies o Gates cuando la funcionalidad lo requiera.



No deberán realizarse comprobaciones de permisos directamente en las vistas o componentes React.



\---



\# 8. Frontend



\## React



El Frontend será responsable únicamente de:



\* Presentar información.

\* Gestionar formularios.

\* Navegación.

\* Consumo de la API.

\* Validaciones de interfaz.



No implementará reglas de negocio.



\---



\## TypeScript



Todo el código del Frontend deberá escribirse en TypeScript.



No se crearán nuevos componentes en JavaScript.



\---



\## Axios



Toda comunicación con el Backend se realizará mediante una instancia centralizada de Axios.



Está prohibido utilizar `fetch()` directamente.



\---



\# 9. Convenciones de código



\## Variables



Utilizar nombres descriptivos.



Correcto:



```php

$ticket

$usuarioResponsable

$listaMateriales

```



Incorrecto:



```php

$a

$tmp

$x

```



\---



\## Métodos



Los nombres deberán expresar claramente su intención.



Ejemplos:



\* `store`

\* `update`

\* `destroy`

\* `registrarValoracion`

\* `aprobarValoracion`

\* `rechazarValoracion`

\* `iniciarReparacion`

\* `finalizarReparacion`



\---



\## Comentarios



Comentar únicamente lógica compleja o decisiones arquitectónicas.



Evitar comentarios redundantes.



\---



\# 10. Reglas del dominio



\## RN-001



Todo Ticket inicia en estado \*\*Pendiente\*\*.



\---



\## RN-002



Solo un \*\*Usuario Registrado\*\* o un \*\*Responsable del Lugar\*\* pueden crear Tickets.



\---



\## RN-003



Todo Ticket deberá pertenecer a:



\* un área,

\* una sede,

\* un tipo de desperfecto,

\* una prioridad.



\---



\## RN-004



Solo el \*\*Personal de Mantenimiento\*\* puede registrar una valoración.



\---



\## RN-005



Toda valoración deberá contener una propuesta de materiales y costos.



\---



\## RN-006



Solo el \*\*Subdirector Administrativo\*\* puede aprobar o rechazar una valoración.



\---



\## RN-007



La lista de materiales únicamente podrá modificarse cuando el Ticket se encuentre en estado \*\*Rechazado\*\*.



\---



\## RN-008



Cuando una valoración es aprobada, el Ticket cambia automáticamente al estado \*\*Autorizado\*\*.



\---



\## RN-009



Solo un Ticket \*\*Autorizado\*\* puede pasar al estado \*\*En reparación\*\*.



\---



\## RN-010



Durante el estado \*\*En reparación\*\*, el Personal de Mantenimiento deberá registrar:



\* Evidencia inicial.

\* Evidencia durante la reparación.

\* Evidencia final.

\* Descripción del trabajo realizado.



\---



\## RN-011



Al finalizar la reparación, el Ticket cambia automáticamente al estado \*\*Reparado\*\*.



\---



\## RN-012



El cambio al estado \*\*Reparado\*\* genera automáticamente:



\* Registro en bitácora.

\* Generación del reporte PDF.

\* Notificación al Responsable del Lugar.



\---



\# 11. GitHub Flow



Todo desarrollo seguirá GitHub Flow.



```text

main

&#x20;  │

feature/nombre-funcionalidad

&#x20;  │

Pull Request

&#x20;  │

Revisión

&#x20;  │

Merge

```



Nunca desarrollar directamente sobre `main`.



\---



\# 12. Responsabilidades del equipo



\## Tech Lead



\* Supervisar la arquitectura.

\* Revisar Pull Requests.

\* Resolver bloqueos técnicos.

\* Garantizar el cumplimiento de GitHub Flow.



\---



\## Fullstack Backend / Product Owner



\* Implementar la lógica de negocio.

\* Diseñar e implementar la API.

\* Mantener el modelo de datos.

\* Priorizar el Product Backlog.



\---



\## Fullstack Frontend / UX-UI



\* Desarrollar la interfaz.

\* Mantener la experiencia de usuario.

\* Integrar el Frontend con la API.



\---



\## QA



\* Diseñar casos de prueba.

\* Validar criterios de aceptación.

\* Verificar nuevas funcionalidades.

\* Reportar incidencias.



\---



\# 13. Checklist para desarrolladores



Antes de enviar código verificar:



\* \[ ] ¿Respeta la arquitectura?

\* \[ ] ¿Respeta el modelo de datos?

\* \[ ] ¿Utiliza FormRequest?

\* \[ ] ¿Utiliza Eloquent?

\* \[ ] ¿No rompe Sanctum?

\* \[ ] ¿No modifica migraciones existentes?

\* \[ ] ¿Respeta las reglas de negocio?

\* \[ ] ¿Incluye validaciones necesarias?

\* \[ ] ¿Mantiene separación de responsabilidades?

\* \[ ] ¿Se probaron los cambios?



\---



\# 14. Checklist para asistentes de IA



Antes de generar código, un asistente de IA deberá responder afirmativamente a las siguientes preguntas:



\* ¿Estoy respetando el modelo de datos oficial?

\* ¿Estoy utilizando la arquitectura React → Laravel → PostgreSQL?

\* ¿La lógica de negocio permanece en el Backend?

\* ¿Estoy utilizando FormRequest para validar la entrada?

\* ¿Estoy utilizando Eloquent y relaciones existentes?

\* ¿Estoy reutilizando componentes cuando es posible?

\* ¿Estoy evitando duplicar lógica?

\* ¿Estoy respetando las reglas RN-001 a RN-012?

\* ¿La solución propuesta es coherente con el flujo de Tickets?



Si alguna respuesta es negativa, la implementación deberá revisarse antes de continuar.



\---



\# 15. Antipatrones



Durante el desarrollo deberán evitarse las siguientes prácticas:



\* Modificar la autenticación existente sin autorización.

\* Acceder a la base de datos desde React.

\* Escribir consultas SQL manuales cuando Eloquent sea suficiente.

\* Duplicar entidades del modelo.

\* Implementar lógica de negocio en componentes del Frontend.

\* Crear endpoints redundantes.

\* Omitir el registro en historial cuando una acción modifique el estado del Ticket.

\* Romper el flujo oficial definido para los estados del Ticket.



\---



\# 16. Consideraciones finales



Estas convenciones representan el estándar oficial de desarrollo de REPARA-79.



Todo cambio futuro deberá mantener la coherencia con la arquitectura, el modelo de datos y las reglas de negocio documentadas.



Este documento deberá considerarse de lectura obligatoria antes de desarrollar cualquier nueva funcionalidad y será la principal referencia para el equipo y para los asistentes de IA utilizados durante el proyecto.



