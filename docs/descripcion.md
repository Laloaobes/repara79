# REPARA - 79: Sistema de Gestión de Tickets de Mantenimiento [cite: 8, 228]

## 📝 Descripción General
REPARA-79 es una plataforma web integral diseñada para optimizar, automatizar y dar trazabilidad completa al flujo de reporte y reparación de desperfectos en la infraestructura institucional[cite: 21, 221, 230, 231]. El sistema actúa como un puente de comunicación eficiente entre el personal que detecta las incidencias, la subdirección encargada de aprobar los presupuestos y el equipo técnico que ejecuta las reparaciones[cite: 233, 235].

### 🎯 Objetivos Principales
* **Trazabilidad Visual:** Garantizar el registro inmutable de cada desperfecto mediante evidencias fotográficas obligatorias en las etapas críticas: antes, durante y después de la reparación[cite: 155, 162, 234, 262].
* **Control de Insumos:** Automatizar el proceso de solicitud, costeo y autorización de los materiales necesarios para las reparaciones[cite: 168, 171, 233, 276].
* **Soberanía y Seguridad:** Despliegue bajo una arquitectura de tres capas on-premise utilizando contenedores Docker para asegurar que los datos institucionales permanezcan bajo control local absoluto[cite: 215, 219, 225].

### 💻 Stack Tecnológico
* **Frontend:** React 18+, Vite, Tailwind, JavaScript[cite: 216].
* **Backend:** API REST Laravel 11 (PHP 8.3)[cite: 216].
* **Base de Datos:** PostgreSQL 16[cite: 216].
* **Servidor / Proxy:** Ubuntu Server con Docker Compose y Nginx[cite: 219].
