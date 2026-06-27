# 00_CONTEXTO.md

# REPARA-79 · Contexto General del Proyecto

> Documento de entrada para desarrolladores y asistentes de IA.

**Versión:** 1.0
**Estado del documento:** Vigente
**Última actualización:** *(Actualizar cuando cambie el alcance del proyecto)*

---

# 1. Introducción

REPARA-79 es un sistema web para la gestión integral de solicitudes de mantenimiento dentro del **CBTA No. 79**.

El proyecto tiene como propósito sustituir el proceso manual de reporte, seguimiento y documentación de desperfectos por un flujo digital, controlado y trazable, permitiendo que cada solicitud de mantenimiento pueda ser registrada, valorada, autorizada, reparada y documentada hasta su conclusión.

El sistema fue concebido siguiendo una arquitectura desacoplada basada en una **API REST**, donde el Frontend y el Backend funcionan como aplicaciones independientes que se comunican exclusivamente mediante HTTP.

La documentación contenida en la carpeta `docs/` constituye la referencia oficial del proyecto y deberá mantenerse sincronizada con la evolución del sistema.

---

# 2. Objetivo del proyecto

El objetivo principal de REPARA-79 es proporcionar una plataforma que permita administrar el ciclo completo de atención de incidencias de mantenimiento dentro de la institución, garantizando:

* Centralización de la información.
* Trazabilidad de cada solicitud.
* Control del proceso de autorización.
* Registro de materiales utilizados.
* Documentación fotográfica de las reparaciones.
* Generación automática de evidencia documental.
* Historial completo de cada intervención.

El sistema busca mejorar la organización del área administrativa y del personal de mantenimiento, reduciendo tiempos de seguimiento y facilitando la toma de decisiones.

---

# 3. Alcance del MVP

La primera versión funcional del sistema contempla los siguientes módulos:

* Autenticación de usuarios.
* Gestión de usuarios.
* Gestión de áreas.
* Gestión de tipos de usuario.
* Registro de Tickets de mantenimiento.
* Valoración técnica.
* Gestión de materiales y costos.
* Autorización o rechazo de la valoración.
* Ejecución de reparaciones.
* Registro de evidencias fotográficas.
* Registro automático en bitácora.
* Generación automática de reporte PDF.
* Consulta del historial de Tickets.
* Notificaciones relacionadas con el flujo del Ticket.

---

# 4. Stack tecnológico oficial

## Frontend

* React
* TypeScript
* Vite
* Axios

---

## Backend

* Laravel 12
* PHP 8.3
* Laravel Sanctum

---

## Base de datos

* PostgreSQL

---

## Control de versiones

* Git
* GitHub
* GitHub Flow

---

## Gestión del proyecto

* ClickUp

---

# 5. Arquitectura general

El sistema sigue una arquitectura cliente-servidor desacoplada.

```mermaid
flowchart LR

Usuario

↓

React

↓

Axios

↓

Laravel API

↓

Eloquent ORM

↓

PostgreSQL
```

Cada capa tiene responsabilidades claramente definidas y no debe invadir la responsabilidad de otra.

---

# 6. Estado actual del proyecto

Actualmente el proyecto dispone de la infraestructura necesaria para comenzar el desarrollo del módulo principal.

## Funcionalidades implementadas

* Login.
* Logout.
* Laravel Sanctum.
* Endpoint `/api/me`.
* Dashboard inicial.
* Comunicación React ↔ Laravel mediante Axios.
* Configuración de PostgreSQL.
* Seeders.
* Usuario administrador inicial.
* Modelo de datos definitivo.

---

## Próximo objetivo

El siguiente Sprint estará dedicado al desarrollo del **Módulo de Gestión de Tickets de Mantenimiento**, considerado el núcleo funcional del sistema.

---

# 7. Tipos de usuario del sistema

El sistema contempla cuatro tipos principales de usuario.

## 7.1 Usuario Registrado

Es el usuario que detecta un desperfecto dentro de un área bajo su responsabilidad.

Responsabilidades:

* Registrar Tickets.
* Consultar el estado de sus Tickets.
* Dar seguimiento a las solicitudes generadas.

No posee permisos administrativos.

---

## 7.2 Responsable del Lugar

Corresponde al responsable de una sección o espacio físico de la institución.

Puede ser el mismo Usuario Registrado que reportó el desperfecto.

Responsabilidades:

* Registrar Tickets.
* Consultar Tickets relacionados con su área.
* Recibir la notificación de reparación concluida.
* Consultar el reporte técnico generado al finalizar la reparación.

---

## 7.3 Personal de Mantenimiento

Responsable de la atención técnica de los desperfectos reportados.

Responsabilidades:

* Revisar Tickets pendientes.
* Inspeccionar desperfectos.
* Elaborar la valoración técnica.
* Registrar materiales y costos.
* Modificar la valoración cuando sea rechazada.
* Ejecutar la reparación.
* Registrar evidencias fotográficas.
* Documentar el trabajo realizado.

---

## 7.4 Subdirector Administrativo

Es el responsable de la supervisión administrativa del sistema.

Posee el mayor nivel de control dentro de la aplicación.

Responsabilidades:

* Revisar valoraciones técnicas.
* Aprobar o rechazar propuestas de materiales y costos.
* Administrar usuarios.
* Asignar tipos de usuario.
* Promover usuarios al rol de Subdirector Administrativo.
* Gestionar áreas.
* Asignar responsables de áreas.
* Consultar todos los Tickets.
* Supervisar el funcionamiento general del sistema.

---

# 8. Flujo funcional general

El funcionamiento del sistema gira alrededor del ciclo de vida de un Ticket.

El proceso general es el siguiente:

```mermaid
flowchart TD

A[Usuario Registrado / Responsable del Lugar]

↓

B[Crear Ticket]

↓

C[Pendiente]

↓

D[Personal de Mantenimiento]

↓

E[Valoración]

↓

F[Valorado]

↓

G[Subdirector Administrativo]

G -->|Aprueba| H[Autorizado]

G -->|Rechaza| I[Rechazado]

I --> D

H --> J[En reparación]

J --> K[Registro de evidencias]

K --> L[Reparado]

L --> M[Bitácora]

M --> N[PDF]

N --> O[Notificación]
```

El detalle completo del proceso se encuentra documentado en `05_FLUJO_TICKETS.md`.

---

# 9. Principios de diseño

El proyecto fue diseñado siguiendo los siguientes principios:

* Separación estricta entre Frontend y Backend.
* Toda la lógica de negocio reside en Laravel.
* React se utiliza únicamente para la presentación y consumo de la API.
* El modelo de datos constituye la única fuente de verdad para la persistencia.
* Toda interacción con la base de datos se realiza mediante Eloquent ORM.
* Toda modificación estructural debe realizarse mediante migraciones.
* Las reglas de negocio deben implementarse en el Backend.

---

# 10. Objetivo de la documentación

La carpeta `docs/` tiene como finalidad convertirse en la documentación oficial del proyecto.

Debe proporcionar el contexto suficiente para que un nuevo integrante del equipo o un asistente de IA pueda comprender el sistema antes de modificar el código fuente.

Cada documento aborda un aspecto específico del proyecto con el fin de evitar duplicidad de información y facilitar su mantenimiento.

---

# 11. Lectura recomendada

Se recomienda consultar la documentación en el siguiente orden:

1. `00_CONTEXTO.md`
2. `01_BASE_DATOS.md`
3. `02_ARQUITECTURA.md`
4. `03_CONVENCIONES.md`
5. `04_ESTADO_ACTUAL.md`
6. `05_FLUJO_TICKETS.md`

Este orden proporciona una comprensión progresiva del sistema, desde el contexto general hasta las reglas específicas del flujo de Tickets.

---

# 12. Consideraciones para asistentes de IA

Antes de generar código, un asistente de IA deberá asumir las siguientes premisas:

* El modelo de datos es definitivo y no debe modificarse sin autorización.
* La autenticación basada en Laravel Sanctum ya se encuentra implementada y debe mantenerse intacta.
* Toda la lógica de negocio pertenece al Backend.
* El Frontend consume exclusivamente la API mediante Axios.
* Las convenciones del proyecto son de cumplimiento obligatorio y se encuentran documentadas en `03_CONVENCIONES.md`.
* El objetivo inmediato del proyecto es implementar el módulo de Gestión de Tickets respetando el flujo funcional definido.

Cualquier propuesta de implementación deberá alinearse con la arquitectura, el modelo de datos y las reglas de negocio documentadas en esta carpeta.
