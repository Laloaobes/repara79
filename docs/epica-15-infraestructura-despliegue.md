# ÉPICA 15 — Infraestructura y Despliegue Institucional

## Identificación

- **Estado real:** Pendiente; no existen scripts, configuraciones de Nginx/Supervisor, respaldos, rollback o documentación operativa versionada.
- **Prioridad:** Crítica.
- **Entorno objetivo:** Servidor físico institucional Dell PowerEdge T110 II.
- **Dependencia funcional:** ÉPICA 14 con dictamen `Aprobado`.
- **Alcance de red:** Red local autorizada del CBTA 79.
- **Enfoque:** Despliegue reproducible, seguro, recuperable y proporcional al hardware disponible.

## Objetivo

Preparar el servidor institucional y desplegar REPARA-79 sobre una arquitectura operable dentro de la red local del CBTA 79, protegiendo la aplicación, la base de datos, las evidencias y los informes mediante configuración de producción, procesos supervisados, respaldos verificables y un procedimiento de recuperación.

## Resultado esperado

Al finalizar la épica:

1. El Dell PowerEdge T110 II ejecuta una versión actualizada de Ubuntu Server 24.04 LTS.
2. El servidor tiene una identidad, dirección y URL institucional documentadas.
3. Nginx publica React, Laravel API y el proxy WebSocket desde un único punto de acceso.
4. PostgreSQL, PHP-FPM y Reverb no están expuestos directamente a la red.
5. Laravel opera con `APP_ENV=production`, `APP_DEBUG=false` y secretos fuera del repositorio.
6. React se entrega como archivos estáticos compilados; Vite no funciona como servidor de producción.
7. Un worker de colas y Reverb permanecen activos mediante Supervisor.
8. Los archivos de evidencias y reportes se conservan en almacenamiento persistente y no se descargan sin autorización.
9. Existe un despliegue repetible con verificación de salud y posibilidad de rollback.
10. Se generan respaldos de PostgreSQL y archivos en un medio distinto al disco principal.
11. Se demuestra una restauración sin sobrescribir el ambiente productivo.
12. QA valida desde equipos de la red el flujo crítico, el reinicio de servicios y los controles de acceso.
13. Existe un manual de operación y entrega con responsables institucionales identificados.

## Entorno objetivo confirmado

| Componente       | Objetivo                                                                 |
| :--------------- | :----------------------------------------------------------------------- |
| Servidor         | Dell PowerEdge T110 II.                                                   |
| Procesador       | Intel Xeon E3-1220 V2.                                                    |
| Memoria          | 8 GB RAM.                                                                |
| Almacenamiento   | 1 TB HDD; estado físico verificado antes del despliegue.                  |
| Sistema operativo| Ubuntu Server 24.04 LTS, con el punto de mantenimiento disponible.       |
| Backend          | Laravel 12 sobre PHP 8.3 y PHP-FPM.                                      |
| Base de datos    | PostgreSQL local.                                                        |
| Frontend         | React 19 compilado con Vite 6.                                           |
| Servidor web     | Nginx.                                                                   |
| Procesos         | Supervisor para cola y Reverb.                                           |
| Tiempo real      | Laravel Reverb detrás del proxy WebSocket de Nginx.                      |
| Control de código| Git y artefactos construidos desde una revisión identificada.            |

Node.js LTS y npm se requieren para construir el frontend, pero no para atender peticiones después de generar `frontend/dist`.

## Arquitectura de producción

```text
Equipos autorizados de la LAN
              │
        HTTP o HTTPS
              │
           Nginx
      ┌───────┼───────────────┐
      │       │               │
 React estático│               │
      /        │               │
            /api/*        /app y /apps
              │               │
          PHP-FPM          Reverb
              │          127.0.0.1:8080
              │
           Laravel
      ┌───────┼──────────┐
      │       │          │
 PostgreSQL  storage   cola database
  local      persistente      │
                              │
                         queue:work

PostgreSQL + storage + inventario de versión
              │
        respaldo cifrado
              │
      medio físico diferente
```

## Exposición de servicios

Los valores de subred y estaciones administrativas se obtienen de la red real; no se inventan en la documentación.

| Servicio              | Escucha recomendada     | Acceso permitido                                      |
| :-------------------- | :---------------------- | :---------------------------------------------------- |
| Nginx HTTP/HTTPS      | IP institucional         | Subredes autorizadas del CBTA 79.                     |
| SSH                   | IP institucional         | Solo equipo o subred administrativa definida.         |
| PostgreSQL `5432`     | `127.0.0.1`              | Solo procesos locales.                                |
| Reverb `8080`         | `127.0.0.1`              | Solo Nginx como proxy.                                |
| PHP-FPM               | Socket Unix              | Solo Nginx.                                           |
| Vite desarrollo       | No se ejecuta            | Sin exposición.                                       |

UFW mantiene política entrante restrictiva y permite únicamente los servicios y orígenes documentados. El servidor no se publica en Internet durante el MVP.

## URL y cifrado

Se adopta una de estas opciones, en este orden:

1. **Preferida:** nombre DNS institucional estable y HTTPS con certificado confiable para los equipos cliente.
2. **Temporal LAN:** nombre DNS interno o IP reservada mediante HTTP, exclusivamente dentro de la red controlada y con el riesgo documentado.

Certbot solo se utiliza si existe un dominio que pueda validarse y renovarse correctamente. No se crea un certificado público ficticio ni se desactiva la validación del navegador. Si la institución cuenta con una autoridad certificadora interna, puede emitir el certificado para el nombre local.

La URL elegida se usa de forma consistente en:

- `APP_URL`;
- `VITE_API_URL`;
- configuración de Echo/Reverb;
- orígenes permitidos;
- documentación y accesos directos de los equipos.

## Contraste con la implementación actual

| Capacidad                              | Estado actual        | Pendiente principal                                                     |
| :------------------------------------- | :------------------- | :---------------------------------------------------------------------- |
| Configuración del servidor             | No documentada       | Inventariar hardware, red, usuarios, actualizaciones y seguridad.       |
| Automatización de despliegue           | No implementada      | Crear scripts, estructura de releases, health check y rollback.         |
| Backend de producción                  | No preparado         | `.env.example` usa modo local, debug y SQLite.                           |
| Frontend de producción                 | Parcial              | La API cae a `localhost` y el `.env.example` conserva variables Gemini. |
| CORS y URL institucional               | No preparado         | Actualmente solo se permiten orígenes de desarrollo local.              |
| Reverb y Echo                          | Pendiente E11        | Instalar, configurar y supervisar procesos y proxy WebSocket.           |
| Worker de colas                        | No supervisado       | Ejecutar `queue:work` como proceso permanente.                           |
| PostgreSQL productivo                  | No configurado       | Crear base y rol local con privilegios mínimos.                          |
| Cuenta administrativa inicial          | Insegura              | El seeder actual usa correo y contraseña fija.                           |
| Evidencias y PDF                       | Sin operación        | Persistencia, permisos, capacidad y respaldo.                            |
| Nginx                                  | No configurado       | SPA, API, PHP-FPM, WebSocket, límites y encabezados.                     |
| Respaldos y restauración               | No implementados     | Respaldar base y archivos fuera del HDD y probar restauración.           |
| Observabilidad básica                  | No implementada      | Salud, logs, disco, servicios, cola fallida y respaldos.                 |
| Manual institucional                   | No implementado      | Documentar operación, actualización, recuperación y contactos.           |

### Riesgos encontrados que bloquean producción

- `backend/.env.example` propone `APP_ENV=local`, `APP_DEBUG=true` y SQLite.
- `frontend/src/api/axios.ts` usa `http://localhost:8000/api` como fallback.
- `frontend/.env.example` pertenece a un prototipo y menciona Gemini en vez de las variables de REPARA-79.
- `backend/config/cors.php` solo contiene orígenes locales de desarrollo.
- `UsuarioSubdirectorSeeder.php` crea una cuenta administrativa con correo y contraseña de desarrollo codificados.
- No existen configuraciones persistentes para worker de colas o Reverb.
- No existe una estrategia conjunta para PostgreSQL, evidencias y PDF.
- No existe un procedimiento de actualización o rollback verificable.

## Alcance esencial

- Revisión física básica del servidor y disco.
- Instalación actualizada de Ubuntu Server 24.04 LTS.
- Identidad, reloj, IP reservada, DNS y conectividad.
- Usuario administrativo individual y usuario de despliegue sin acceso root directo.
- SSH mediante llave y firewall limitado a la red autorizada.
- PHP 8.3, extensiones Laravel, Composer, PostgreSQL, Nginx, Node.js LTS, Git y Supervisor.
- Configuración productiva de Laravel, React, Sanctum, CORS, Reverb y colas.
- Build estático del frontend.
- Nginx para SPA, API y WebSocket.
- Releases identificables, mantenimiento, migraciones, health check y rollback.
- Permisos mínimos de código y almacenamiento.
- Respaldo diario fuera del disco principal.
- Restauración de prueba y manual de operación.
- Validación institucional posterior a reinicio.

## Recortes deliberados por tiempo

- No se implementa alta disponibilidad o un segundo servidor.
- No se configura clúster o réplica de PostgreSQL.
- No se incorpora Docker, Kubernetes o una plataforma cloud.
- No se implementa balanceador de carga.
- No se configura Redis; el MVP usa cola y caché compatibles con base de datos.
- No se instala una plataforma externa de monitoreo.
- No se crea un pipeline completo de CI/CD.
- No se publica el servidor en Internet.
- No se habilita acceso remoto por VPN dentro de esta épica.
- No se garantiza continuidad eléctrica mediante compra de UPS; se documenta el riesgo y el apagado seguro si no existe una.
- No se implementa respaldo incremental empresarial.
- No se ofrece recuperación ante pérdida total del edificio.
- No se configura Resend, SMTP o correo externo.

Estos recortes no eliminan el respaldo fuera del HDD, la restauración de prueba, el firewall o la supervisión de procesos.

## Estructura de despliegue recomendada

```text
/srv/repara79/
├── current -> releases/20260725-120000/
├── releases/
│   └── 20260725-120000/
│       ├── backend/
│       └── frontend/
├── shared/
│   └── backend/
│       ├── .env
│       └── storage/
└── backups-local-staging/
```

Reglas:

- `current` apunta a la versión activa.
- `.env` y `storage` no pertenecen al release y persisten entre versiones.
- El código no es propiedad escribible del proceso web.
- `www-data` solo escribe en `storage` y `bootstrap/cache`.
- `backups-local-staging` es temporal; la copia válida termina en un medio distinto.
- Se conservan al menos la versión activa y la anterior validada.

## Archivos versionados que debe producir la épica

```text
deployment/
├── README.md
├── inventory/
│   └── institutional-server.example.md
├── env/
│   ├── backend.production.example
│   └── frontend.production.example
├── nginx/
│   └── repara79.conf
├── supervisor/
│   ├── repara79-queue.conf
│   └── repara79-reverb.conf
├── scripts/
│   ├── deploy.sh
│   ├── rollback.sh
│   ├── health-check.sh
│   ├── backup.sh
│   └── verify-restore.sh
└── runbooks/
    ├── installation.md
    ├── release.md
    ├── operations.md
    ├── backup-restore.md
    └── incident-recovery.md
```

Los ejemplos usan marcadores como `REPLACE_WITH_LAN_CIDR`; nunca incluyen IP, claves o contraseñas inventadas.

## Configuración productiva mínima

### Backend

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL` igual a la URL institucional.
- `APP_LOCALE=es`
- `APP_FALLBACK_LOCALE=es`
- `LOG_LEVEL=warning` o el nivel aprobado.
- `DB_CONNECTION=pgsql`
- `DB_HOST=127.0.0.1`
- `FILESYSTEM_DISK=public`
- `QUEUE_CONNECTION=database`
- `CACHE_STORE=database`
- `BROADCAST_CONNECTION=reverb`
- Credenciales Reverb generadas, no reutilizadas de desarrollo.
- `MAIL_MAILER=log` mientras no exista una función de correo.

### Frontend

- `VITE_API_URL=/api`
- Clave pública de aplicación Reverb.
- Host institucional de Reverb.
- Esquema `http`/`https` y puerto externo coherentes con Nginx.
- Ninguna clave privada o `REVERB_APP_SECRET`.
- Ninguna variable de Gemini o Resend.

El frontend y la API utilizan preferentemente el mismo origen. CORS no admite comodín con credenciales y queda limitado al origen institucional si aún resulta necesario.

## Seguridad mínima

- No se permite acceso SSH directo como `root`.
- La autenticación SSH por llave es obligatoria después de comprobar el acceso alterno.
- Los usuarios administrativos son individuales; no se comparte una cuenta genérica del sistema operativo.
- UFW restringe SSH y web a los rangos aprobados.
- PostgreSQL usa un rol de aplicación sin atributo `SUPERUSER`.
- `.env`, respaldos y claves tienen permisos restrictivos.
- No se usan permisos `777`.
- `APP_DEBUG` permanece desactivado.
- El directorio raíz del repositorio nunca se sirve por Nginx.
- Nginx solo entrega el build de React y envía a PHP exclusivamente `backend/public/index.php`.
- El acceso directo a `/storage/evidencias/` y `/storage/reportes/` se bloquea; la aplicación usa endpoints autenticados.
- Los encabezados de seguridad y límites de carga se configuran sin impedir tres imágenes de hasta 5 MB.
- Las actualizaciones de seguridad de Ubuntu se mantienen habilitadas y se documenta la política de reinicio.
- Los logs no almacenan contraseñas, tokens, secretos o cuerpos completos de archivos.

## Respaldo y recuperación

El respaldo válido incluye:

1. PostgreSQL mediante `pg_dump` en formato personalizado.
2. `shared/backend/storage/app/public`, que contiene evidencias y reportes.
3. Identificador de release, migraciones aplicadas y checksum de los archivos.
4. Inventario de configuración sin exponer secretos.

Política mínima:

- frecuencia diaria;
- retención de siete copias diarias y cuatro semanales;
- copia final en medio físico o ubicación distinta al HDD del servidor;
- cifrado o control físico equivalente;
- registro de fecha, tamaño, checksum y resultado;
- prueba de restauración antes de liberar y posteriormente con periodicidad institucional;
- objetivo de punto de recuperación de hasta 24 horas;
- tiempo de restauración medido y documentado durante el simulacro.

`verify-restore.sh` restaura en una base y directorio alternos. Nunca sobrescribe producción como parte de una prueba.

## Flujo de una liberación

1. Confirmar dictamen `Aprobado` de ÉPICA 14 y revisión Git a desplegar.
2. Verificar espacio, salud de servicios y respaldo previo.
3. Crear un directorio nuevo bajo `releases/`.
4. Instalar backend con `composer install --no-dev --optimize-autoloader`.
5. Construir frontend de forma reproducible con `npm ci` y `npm run build`.
6. Vincular `.env` y `storage` compartidos.
7. Activar mantenimiento.
8. Ejecutar migraciones revisadas con `php artisan migrate --force`.
9. Ejecutar únicamente datos iniciales seguros e idempotentes.
10. Ejecutar `php artisan optimize`.
11. Cambiar `current` al release nuevo.
12. Recargar PHP-FPM y Nginx; reiniciar de forma controlada cola y Reverb.
13. Desactivar mantenimiento.
14. Ejecutar health check técnico y humo funcional.
15. Registrar versión, responsable, inicio, fin y resultado.

Si una comprobación crítica falla, se detiene el procedimiento. El rollback vuelve al release anterior y restaura datos solo cuando una migración incompatible lo exige y existe respaldo confirmado.

## Orden y dependencias

| HU   | Responsable único          | Depende de                                                   |
| :--- | :------------------------- | :----------------------------------------------------------- |
| HU01 | Tech Lead                  | Hardware, red institucional y alcance E15 confirmados         |
| HU02 | Fullstack Backend          | HU01-E15 y backend E06-E14 aprobado                           |
| HU03 | Fullstack Frontend/UX-UI   | HU01-E15, contrato E11 y frontend E06-E14 aprobado            |
| HU04 | Tech Lead                  | HU02-E15 y HU03-E15                                           |
| HU05 | QA                         | HU04-E15 y dictamen `Aprobado` de ÉPICA 14                    |

HU02 y HU03 pueden avanzar en paralelo después de que HU01 fije URL, red, rutas y arquitectura. HU04 integra sus artefactos y HU05 valida sobre la versión final instalada.

---

# HU01-E15-Preparar servidor y red institucional

## Descripción

**Como** Tech Lead,  
**quiero** preparar el hardware, sistema operativo, identidad de red y controles de acceso,  
**para** disponer de una base estable y restringida donde desplegar REPARA-79.

## Prioridad

Crítica.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `deployment/inventory/institutional-server.example.md`.
- Crear `deployment/runbooks/installation.md`.
- Registrar sin secretos:
  - modelo y número de inventario;
  - CPU, RAM, disco y estado SMART;
  - interfaz de red y MAC;
  - hostname;
  - IP o reserva DHCP;
  - prefijo de red, gateway y DNS;
  - URL institucional;
  - equipo o subred administrativa;
  - existencia de UPS o riesgo eléctrico.
- Instalar Ubuntu Server 24.04 LTS actualizado.
- Configurar zona horaria `America/Mexico_City` y sincronización de tiempo.
- Crear cuentas administrativas individuales y usuario de despliegue.
- Configurar OpenSSH mediante llave.
- Validar `sshd` antes de deshabilitar acceso root o contraseña.
- Aplicar UFW con política de mínimo acceso.
- Mantener actualizaciones automáticas de seguridad y definir reinicios.
- Comprobar conectividad, resolución y acceso desde una estación autorizada.

## Impacto en el modelo de datos

No modifica tablas de REPARA-79.

Define los parámetros que utilizarán:

- PostgreSQL;
- Laravel;
- Nginx;
- Reverb;
- frontend;
- respaldos.

## Dependencias

- Acceso físico autorizado al Dell PowerEdge T110 II.
- Información real de la red institucional.
- Medio de instalación de Ubuntu.
- Estación administrativa con llave SSH.
- Medio externo o destino separado para respaldos.

## Subtareas

1. **Auditar hardware y energía** — Verificar RAM, disco SMART, capacidad, red, reloj y protección eléctrica; registrar riesgos.
2. **Instalar y actualizar Ubuntu** — Instalar 24.04 LTS, parches, hostname, zona horaria y sincronización.
3. **Configurar acceso administrativo** — Crear cuentas individuales, usuario de despliegue, llaves SSH y privilegios mínimos.
4. **Integrar la red institucional** — Reservar IP, registrar gateway, DNS, URL y comprobar conectividad sin inventar valores.
5. **Aplicar seguridad base** — Configurar UFW, SSH sin root, actualizaciones de seguridad y política de reinicio.
6. **Documentar inventario y recuperación de acceso** — Registrar configuración, responsables institucionales y acceso por consola física.

## Criterios de aceptación

1. El servidor se identifica como Dell PowerEdge T110 II.
2. El disco no presenta alertas críticas SMART.
3. Ubuntu Server 24.04 LTS está actualizado.
4. La hora y zona horaria son correctas.
5. El hostname y la IP permanecen estables después de reiniciar.
6. La URL elegida resuelve o se documenta el acceso por IP.
7. Un usuario administrativo entra mediante llave SSH.
8. `root` no inicia sesión directamente por SSH.
9. Antes de restringir SSH se verifica una segunda sesión funcional.
10. UFW permite web solo desde la LAN autorizada y SSH desde el origen administrativo.
11. Los puertos `5432` y `8080` no están expuestos.
12. Las actualizaciones de seguridad y reinicios están documentados.
13. El riesgo de energía y la ubicación del respaldo externo están registrados.
14. El inventario no contiene contraseñas o claves privadas.

## Definition of Done

1. **Dado que** el servidor físico fue asignado, **cuando** se complete el inventario, **entonces** hardware, disco, energía, red y responsables quedarán identificados sin exponer secretos.
2. **Dado que** Ubuntu está instalado, **cuando** el servidor reinicie, **entonces** conservará hostname, hora, IP y conectividad institucional.
3. **Dado que** se habilita administración remota, **cuando** un usuario autorizado acceda, **entonces** utilizará una cuenta individual y llave SSH sin iniciar sesión como root.
4. **Dado que** UFW está activo, **cuando** se revise desde la red, **entonces** solo estarán disponibles los puertos y orígenes expresamente autorizados.

## Reglas de negocio

- No se inventan parámetros de red.
- El servidor no se expone a Internet.
- SSH se restringe después de validar acceso alterno.
- Las cuentas del sistema operativo son individuales.
- No se almacenan llaves privadas en el servidor o repositorio sin protección.
- PostgreSQL y Reverb permanecen locales.
- Las alertas críticas de disco bloquean el despliegue hasta resolver o aceptar formalmente el riesgo.

## Definition of Ready

- Existe acceso físico y autorización institucional.
- Se conoce la red o está disponible su responsable.
- Hay una llave SSH de administración.
- Existe un destino de respaldo separado.
- La versión candidata del sistema aún no se instala.

---

# HU02-E15-Preparar backend y persistencia de producción

## Descripción

**Como** integrante Fullstack Backend,  
**quiero** preparar Laravel, PostgreSQL, almacenamiento, colas, Reverb y respaldos,  
**para** que los datos y procesos críticos operen de forma persistente y recuperable.

## Prioridad

Crítica.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Crear `deployment/env/backend.production.example`.
- Actualizar `backend/.env.example` para representar correctamente PostgreSQL y las variables vigentes sin secretos.
- Crear:
  - `deployment/supervisor/repara79-queue.conf`
  - `deployment/supervisor/repara79-reverb.conf`
  - `deployment/scripts/backup.sh`
  - `deployment/scripts/verify-restore.sh`
  - `deployment/scripts/health-check.sh`
- Documentar PHP 8.3 y extensiones requeridas:
  - `ctype`, `curl`, `dom`, `fileinfo`, `mbstring`, `openssl`, `pdo_pgsql`, `tokenizer`, `xml`, `bcmath`, `gd` o la extensión usada por PDF/imágenes, `zip`.
- Crear base y rol PostgreSQL local sin `SUPERUSER`.
- Restringir escucha y `pg_hba.conf` a conexiones locales.
- Preparar `.env` productivo con permisos restrictivos.
- Instalar dependencias Composer sin paquetes de desarrollo.
- Ejecutar migraciones y datos iniciales seguros.
- Preparar almacenamiento compartido y permisos.
- Supervisar `queue:work` y `reverb:start`.
- Implementar respaldo conjunto y restauración aislada.

## Impacto en el modelo de datos

Implementa el esquema aprobado mediante migraciones.

Reglas:

- no se ejecutan cambios manuales fuera de migraciones;
- no se usa `migrate:fresh`, `db:wipe` o datos demo en producción;
- se registra la lista de migraciones aplicadas;
- los seeders productivos son idempotentes;
- no se crea una cuenta con contraseña fija.

`UsuarioSubdirectorSeeder.php` debe dejar de crear una cuenta administrativa con credenciales fijas. El acceso inicial se resuelve mediante un comando o procedimiento de bootstrap que reciba credenciales de forma segura, no las escriba en Git y obligue a cambiar la contraseña temporal.

## Dependencias

- HU01-E15-Preparar servidor y red institucional.
- Dictamen `Aprobado` de ÉPICA 14 para el backend.
- Migraciones E06-E13 terminadas.
- Reverb y notificaciones de E11 integrados.
- URL institucional confirmada.
- Destino externo de respaldo disponible.

## Subtareas

1. **Instalar runtime backend** — Preparar PHP-FPM, extensiones, Composer, PostgreSQL y Supervisor con versiones compatibles.
2. **Asegurar PostgreSQL** — Crear base, rol de aplicación, autenticación local, privilegios mínimos y registro de versión.
3. **Construir configuración productiva** — Completar variables Laravel, Sanctum, almacenamiento, cola y Reverb sin secretos versionados.
4. **Eliminar credenciales iniciales inseguras** — Sustituir el seeder fijo por un bootstrap controlado e idempotente.
5. **Preparar procesos persistentes** — Configurar un worker conservador para 8 GB RAM y un proceso Reverb reiniciable por Supervisor.
6. **Preparar archivos y permisos** — Configurar `storage`, `bootstrap/cache`, logs y directorios compartidos sin `777`.
7. **Automatizar respaldo y restauración** — Respaldar PostgreSQL y archivos, aplicar retención, checksum y copia externa, y verificar restauración aislada.
8. **Entregar verificación de salud** — Comprobar `/up`, base de datos, escritura controlada, cola, Reverb y espacio disponible.

## Criterios de aceptación

1. PHP 8.3 carga todas las extensiones requeridas.
2. Composer instala con `--no-dev --optimize-autoloader`.
3. PostgreSQL solo acepta la conexión productiva desde el servidor.
4. El rol de aplicación no es superusuario.
5. `APP_ENV=production` y `APP_DEBUG=false`.
6. Laravel conecta a PostgreSQL mediante variables no versionadas.
7. No existe una cuenta productiva con contraseña fija en el código.
8. Los catálogos se inicializan sin datos demo ni duplicados.
9. Evidencias y PDF persisten entre releases.
10. Solo `storage` y `bootstrap/cache` tienen escritura para el proceso web.
11. Supervisor reinicia cola y Reverb si terminan inesperadamente.
12. Un despliegue reinicia de forma controlada los procesos de larga duración.
13. La caída de Reverb no elimina notificaciones persistentes.
14. El respaldo incluye base, evidencias, reportes e inventario de versión.
15. La copia válida sale del HDD principal.
16. La restauración se verifica en una base y ruta alternas.
17. Los scripts fallan con código distinto de cero si una etapa crítica falla.
18. Logs y respaldos no exponen secretos.

## Definition of Done

1. **Dado que** Laravel inicia en producción, **cuando** se consulte su configuración efectiva, **entonces** utilizará PostgreSQL, debug desactivado, almacenamiento persistente, cola database y Reverb.
2. **Dado que** el servidor o un proceso reinicia, **cuando** Supervisor recupere servicios, **entonces** cola y Reverb volverán a operar sin intervención manual.
3. **Dado que** se inicializa una instalación nueva, **cuando** se ejecuten migraciones y bootstrap, **entonces** existirán catálogos y acceso administrativo seguro sin credenciales fijas.
4. **Dado que** se genera un respaldo, **cuando** se valide y copie fuera del HDD, **entonces** PostgreSQL, evidencias, reportes y versión tendrán checksum y registro de resultado.
5. **Dado que** se ejecuta un simulacro de restauración, **cuando** finalice, **entonces** los datos y archivos podrán consultarse en un destino aislado sin alterar producción.

## Reglas de negocio

- La base productiva nunca se reinicializa destructivamente.
- Los cambios de esquema se realizan por migración.
- Los secretos no se versionan ni imprimen en logs.
- No se usa una contraseña administrativa predeterminada.
- Reverb complementa REST; no sustituye `notifications`.
- Los archivos protegidos se recuperan mediante API autorizada.
- Un respaldo almacenado solo en el mismo HDD no cuenta como respaldo válido.
- La prueba de restauración nunca apunta a producción.

## Definition of Ready

- HU01 está terminada.
- La URL y red están confirmadas.
- El backend pasó ÉPICA 14.
- Las migraciones están revisadas.
- Existe un medio de respaldo externo.
- Se conocen los tamaños esperados de archivos.

---

# HU03-E15-Preparar frontend para la red institucional

## Descripción

**Como** integrante Fullstack Frontend/UX-UI,  
**quiero** producir un build estático configurado para la URL institucional,  
**para** que los usuarios accedan a la API y notificaciones sin dependencias de desarrollo o direcciones locales.

## Prioridad

Muy alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Sustituir `frontend/.env.example` por variables reales de REPARA-79.
- Crear `deployment/env/frontend.production.example`.
- Revisar:
  - `frontend/src/api/axios.ts`
  - `frontend/vite.config.ts`
  - configuración de Laravel Echo de ÉPICA 11.
- Usar `VITE_API_URL=/api` para el mismo origen.
- Configurar Reverb a través del host y puerto externos de Nginx.
- Eliminar el fallback productivo a `http://localhost:8000/api`.
- Retirar variables y dependencias de Gemini si no existe un caso de uso aprobado.
- Garantizar que ninguna clave privada se incluya en el bundle.
- Construir mediante `npm ci` y `npm run build`.
- Probar rutas React con recarga directa mediante fallback de Nginx.
- Documentar tamaño y checksum del artefacto.

## Impacto en el modelo de datos

No modifica PostgreSQL.

Consume:

- API bajo `/api`;
- autorización de broadcast;
- Reverb mediante `/app` y `/apps`;
- descargas protegidas de evidencias y PDF.

## Dependencias

- HU01-E15-Preparar servidor y red institucional.
- URL y esquema HTTP/HTTPS definidos.
- Frontend E06-E14 aprobado.
- Contrato Reverb/Echo de ÉPICA 11.
- DTO definitivos del backend.

## Subtareas

1. **Limpiar configuración heredada** — Reemplazar variables Gemini y fallbacks locales por variables documentadas de REPARA-79.
2. **Configurar API de mismo origen** — Usar `/api`, conservar autenticación y evitar CORS innecesario.
3. **Configurar Echo para producción** — Consumir la clave pública y conectar WebSocket a Nginx sin exponer el puerto interno.
4. **Generar build reproducible** — Ejecutar instalación bloqueada por lockfile, pruebas, lint, build y checksum.
5. **Validar navegación estática** — Probar acceso inicial, recarga de rutas, errores de API, descarga de PDF y reconexión WebSocket.
6. **Documentar artefacto** — Registrar revisión Git, Node/npm utilizados, variables públicas y ubicación de `dist`.

## Criterios de aceptación

1. El `.env.example` solo contiene variables vigentes de REPARA-79.
2. El bundle no contiene `localhost`, claves privadas, contraseñas o secretos.
3. La API se consume desde `/api`.
4. Echo usa el host institucional y el proxy de Nginx.
5. `REVERB_APP_SECRET` nunca llega al frontend.
6. Un fallo WebSocket no bloquea la consulta REST.
7. `npm ci`, `npm run test:run`, lint y build concluyen correctamente.
8. `frontend/dist` es autocontenido.
9. Login, Dashboard y rutas profundas cargan al refrescar.
10. Los errores `401` y `403` conservan el comportamiento definido.
11. PDF se descarga mediante el endpoint autenticado.
12. El artefacto se relaciona con una revisión Git y checksum.
13. Vite no se ejecuta como servidor en producción.

## Definition of Done

1. **Dado que** el usuario abre la URL institucional, **cuando** React solicita información, **entonces** utilizará `/api` en el mismo origen y nunca intentará conectarse a localhost.
2. **Dado que** Reverb está disponible detrás de Nginx, **cuando** llegue una notificación, **entonces** Echo la recibirá sin acceder directamente al puerto interno.
3. **Dado que** Reverb no está disponible, **cuando** el usuario abra o recupere la aplicación, **entonces** podrá consultar sus notificaciones persistentes mediante REST.
4. **Dado que** se construye el frontend desde el lockfile, **cuando** termine la validación, **entonces** existirá un artefacto identificado, sin secretos y apto para Nginx.

## Reglas de negocio

- El frontend solo contiene configuración pública.
- La API y WebSocket usan la URL institucional.
- No se ejecuta el servidor Vite en producción.
- No se incorporan Gemini, Resend u otros servicios externos.
- Las rutas protegidas conservan autorización backend.
- El bundle se genera desde una revisión aprobada.
- El tiempo real puede degradarse sin impedir el flujo principal.

## Definition of Ready

- HU01 está terminada.
- La URL institucional está definida.
- E11 y E14 están aprobadas.
- Existe lockfile actualizado.
- Los contratos API están congelados para la liberación.

---

# HU04-E15-Publicar y operar la versión institucional

## Descripción

**Como** Tech Lead,  
**quiero** integrar Nginx, releases, procesos y procedimientos operativos,  
**para** publicar una versión identificable que pueda actualizarse, supervisarse y revertirse con seguridad.

## Prioridad

Crítica.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear:
  - `deployment/nginx/repara79.conf`
  - `deployment/scripts/deploy.sh`
  - `deployment/scripts/rollback.sh`
  - `deployment/README.md`
  - `deployment/runbooks/release.md`
  - `deployment/runbooks/operations.md`
  - `deployment/runbooks/backup-restore.md`
  - `deployment/runbooks/incident-recovery.md`
- Implementar la estructura `releases/current/shared`.
- Configurar Nginx para:
  - servir `frontend/dist`;
  - fallback a `index.html`;
  - enrutar `/api` a `backend/public/index.php` por PHP-FPM;
  - autorizar `/api/broadcasting/auth`;
  - proxificar `/app` y `/apps` a Reverb local;
  - bloquear archivos ocultos y sensibles;
  - bloquear acceso directo a evidencias y reportes;
  - limitar cargas y tiempos de espera;
  - registrar logs separados;
  - aplicar encabezados de seguridad.
- Configurar HTTPS si existe un certificado confiable.
- Coordinar mantenimiento, respaldo previo, migraciones, optimize, cambio de symlink y reinicio de procesos.
- Incorporar health check y rollback.
- Configurar rotación de logs y checklist operativo.

## Impacto en el modelo de datos

Ejecuta migraciones aprobadas durante una liberación.

Antes de una migración potencialmente incompatible:

- se confirma respaldo;
- se revisa estrategia de rollback;
- se detiene la liberación si no existe recuperación verificable.

No ejecuta seeders de desarrollo.

## Dependencias

- HU02-E15-Preparar backend y persistencia de producción.
- HU03-E15-Preparar frontend para la red institucional.
- Dictamen `Aprobado` de ÉPICA 14.
- Acceso administrativo al servidor.
- Certificado y DNS, si se usará HTTPS.

## Subtareas

1. **Construir publicación Nginx** — Integrar SPA, API, PHP-FPM, WebSocket, límites, encabezados, logs y bloqueo de archivos.
2. **Implementar releases compartidos** — Crear directorios, symlink `current`, persistencia de `.env`/storage y permisos mínimos.
3. **Automatizar liberación segura** — Validar versión, respaldo, dependencias, migraciones, optimización, cambio atómico y health check.
4. **Automatizar rollback controlado** — Volver al release anterior, recuperar procesos y documentar tratamiento de migraciones.
5. **Preparar operación cotidiana** — Documentar inicio, parada, reinicio, logs, disco, cola fallida, Reverb y respaldo.
6. **Realizar entrega institucional** — Registrar URL, versión, responsables, ubicación de respaldos y recuperación por consola.

## Criterios de aceptación

1. `nginx -t` valida la configuración.
2. React carga en `/` y las rutas profundas sobreviven una recarga.
3. `/api` llega exclusivamente a `backend/public/index.php`.
4. `/app` y `/apps` actualizan correctamente la conexión WebSocket.
5. `5432` y `8080` no son accesibles desde un cliente de la LAN.
6. El repositorio, `.env`, logs y backups no se sirven por Nginx.
7. Evidencias y reportes no se descargan directamente desde `/storage`.
8. El límite Nginx admite la petición de tres imágenes de 5 MB con margen controlado.
9. Una liberación registra revisión, responsable, fechas y resultado.
10. El script se detiene si falla backup, build, migración o health check.
11. `php artisan optimize` se ejecuta después de configurar producción.
12. Worker y Reverb se reinician tras cambiar de release.
13. El release anterior permanece disponible.
14. El rollback de código fue ensayado.
15. La restauración de datos se usa solo cuando es necesaria y con aprobación explícita.
16. Los logs rotan y el espacio se puede supervisar.
17. Tras reiniciar el servidor, Nginx, PHP-FPM, PostgreSQL, Supervisor, cola y Reverb regresan automáticamente.
18. El manual permite a otra persona autorizada comprobar salud y respaldos.

## Definition of Done

1. **Dado que** existe una revisión aprobada, **cuando** se ejecute el despliegue, **entonces** se creará un release nuevo, se conservarán datos compartidos y se activará solo después de superar verificaciones críticas.
2. **Dado que** Nginx recibe peticiones de la LAN, **cuando** se soliciten SPA, API o WebSocket, **entonces** cada ruta llegará al componente correcto sin exponer puertos o archivos internos.
3. **Dado que** una liberación falla después del cambio, **cuando** se ejecute rollback, **entonces** la versión anterior volverá a atender y el incidente quedará registrado.
4. **Dado que** el servidor reinicia, **cuando** complete el arranque, **entonces** todos los servicios requeridos estarán activos y el health check será satisfactorio.
5. **Dado que** el equipo entrega la operación, **cuando** el responsable institucional consulte los runbooks, **entonces** podrá revisar servicios, logs, disco, respaldos y acciones de recuperación.

## Reglas de negocio

- Solo se despliegan revisiones aprobadas.
- Ningún paso crítico se ignora automáticamente.
- No se publica el repositorio completo.
- Base de datos y Reverb no se exponen.
- Los procesos de larga duración se supervisan.
- El respaldo previo es obligatorio para cambios de esquema.
- No se ejecutan comandos destructivos en producción sin autorización y recuperación confirmada.
- Cada intervención queda registrada.

## Definition of Ready

- HU02 y HU03 están terminadas.
- Existe un release candidato aprobado.
- Nginx, PHP-FPM y Supervisor están instalados.
- El respaldo y health check funcionan.
- La URL y certificado, si aplica, están disponibles.

---

# HU05-E15-Validar despliegue y recuperación institucional

## Descripción

**Como** responsable de QA,  
**quiero** validar el sistema desde la red institucional y comprobar su recuperación,  
**para** asegurar que la versión entregada funciona después de desplegarse y reiniciarse.

## Prioridad

Crítica.

## Responsable único

QA.

## Alcance técnico

- Crear:
  - `docs/evidencias/epica-15/matriz-despliegue.md`
  - `docs/evidencias/epica-15/resultado-despliegue.md`
  - `docs/evidencias/epica-15/resultado-restauracion.md`
  - `docs/evidencias/epica-15/acta-entrega-tecnica.md`
- Validar desde al menos dos equipos cliente de la LAN.
- Ejecutar recorrido completo en navegador Chromium.
- Ejecutar humo en Firefox.
- Verificar los cuatro roles oficiales.
- Probar carga de evidencias, PDF, Archivero y notificación REST/WebSocket.
- Reiniciar servicios y servidor de forma coordinada.
- Verificar respaldo y restauración aislada.
- Revisar exposición de puertos y errores de producción.
- Emitir resultado `Aprobado` o `No aprobado`.

## Impacto en el modelo de datos

Utiliza un conjunto controlado de datos de aceptación.

La prueba de restauración:

- usa otra base;
- usa otro directorio;
- compara conteos y archivos mediante checksum;
- se elimina o archiva según el runbook;
- nunca reemplaza producción.

## Dependencias

- HU04-E15-Publicar y operar la versión institucional.
- Dictamen `Aprobado` de ÉPICA 14.
- Dos equipos autorizados en la LAN.
- Cuentas de los cuatro roles.
- Respaldo completo disponible.
- Ventana autorizada para reinicio.

## Subtareas

1. **Validar acceso de red** — Comprobar URL, DNS/IP, firewall, navegadores, rutas profundas y ausencia de puertos internos.
2. **Ejecutar flujo funcional institucional** — Recorrer ticket, valoración, autorización, reparación, tres evidencias, PDF, Archivero, notificación, Administración y Dashboard.
3. **Validar degradación y seguridad** — Probar Reverb detenido, persistencia REST, permisos, debug desactivado y archivos protegidos.
4. **Validar reinicio y operación** — Reiniciar procesos y servidor, comprobar arranque automático, health check, logs y espacio.
5. **Verificar respaldo y restauración** — Confirmar copia externa, checksum, retención y recuperación en destinos aislados.
6. **Emitir acta técnica** — Registrar versión, resultados, riesgos, responsables, dictamen y pendientes operativos.

## Criterios de aceptación

1. Dos equipos distintos acceden mediante la URL institucional.
2. Chromium completa el flujo y Firefox supera el humo.
3. Las rutas React cargan al abrirse directamente.
4. Los cuatro roles respetan su alcance.
5. Se cargan exactamente las evidencias obligatorias `inicial`, `durante` y `final`.
6. El PDF y la bitácora aparecen después del cierre exitoso.
7. La notificación se persiste y se recibe en tiempo real cuando Reverb está activo.
8. Con Reverb detenido, REST continúa mostrando la notificación y el flujo no se bloquea.
9. Administración y Dashboard conservan las reglas E12-E13.
10. Los errores no muestran stack trace o secretos.
11. `/storage/evidencias` y `/storage/reportes` no permiten descarga directa.
12. PostgreSQL y Reverb no aceptan conexiones directas desde clientes.
13. Tras reiniciar, todos los servicios vuelven automáticamente.
14. El health check detecta un servicio esencial detenido.
15. El respaldo se encuentra fuera del HDD principal.
16. PostgreSQL y archivos se restauran en destinos alternos.
17. Los conteos y checksums restaurados coinciden.
18. No quedan defectos críticos o altos abiertos.
19. La evidencia identifica versión, fecha, equipo y resultado sin revelar secretos.
20. El acta registra responsable institucional y procedimiento de soporte.

## Definition of Done

1. **Dado que** la versión está publicada, **cuando** usuarios de los cuatro roles accedan desde equipos autorizados, **entonces** podrán completar sus funciones y solo verán los recursos permitidos.
2. **Dado que** Reverb se interrumpe, **cuando** finalice una reparación y el usuario recupere la aplicación, **entonces** la notificación persistida seguirá disponible mediante REST.
3. **Dado que** el servidor se reinicia, **cuando** concluya el arranque, **entonces** Nginx, PHP-FPM, PostgreSQL, cola y Reverb volverán a operar sin inicio manual.
4. **Dado que** existe un respaldo externo válido, **cuando** se ejecute el simulacro aislado, **entonces** base de datos, evidencias y reportes se restaurarán con resultados verificables.
5. **Dado que** termina la matriz institucional, **cuando** no existan defectos críticos o altos, **entonces** QA emitirá `Aprobado` y dejará el acta técnica disponible.

## Reglas de negocio

- La validación se realiza sobre la revisión instalada.
- Producción no se destruye para probar recuperación.
- Los reinicios se coordinan en una ventana autorizada.
- Un puerto interno expuesto bloquea la aprobación.
- Un respaldo no restaurable no se considera válido.
- Críticos y altos bloquean la entrega.
- Las evidencias no contienen secretos.
- Resend no forma parte de la validación.

## Definition of Ready

- HU04 está terminada.
- El release y su checksum están registrados.
- ÉPICA 14 está aprobada.
- Hay equipos, cuentas y ventana de prueba.
- Existe respaldo externo.
- El responsable institucional conoce el simulacro.

---

## Definition of Done de la Épica

1. **Dado que** el Dell PowerEdge T110 II está preparado, **cuando** reinicie, **entonces** conservará red, seguridad y servicios necesarios para atender REPARA-79.
2. **Dado que** la aplicación se publica en producción, **cuando** Nginx reciba peticiones, **entonces** entregará React, API y WebSocket sin exponer PostgreSQL, Reverb, secretos o archivos protegidos.
3. **Dado que** se instala una revisión aprobada, **cuando** finalice el despliegue, **entonces** Laravel operará sin debug, React será estático y los procesos permanecerán supervisados.
4. **Dado que** ocurre una falla o actualización, **cuando** se apliquen los runbooks, **entonces** el equipo podrá comprobar salud, volver al release anterior o restaurar datos con trazabilidad.
5. **Dado que** se respaldan PostgreSQL y storage, **cuando** se ejecute el simulacro, **entonces** la copia externa permitirá recuperar datos, evidencias y PDF en un ambiente aislado.
6. **Dado que** QA valida desde la LAN y después de un reinicio, **cuando** no existan defectos críticos o altos, **entonces** emitirá un acta técnica `Aprobado` para la entrega institucional.

## Criterio de cierre

ÉPICA 15 se considera terminada cuando HU01 a HU05 cumplen su Definition of Done, REPARA-79 funciona desde la red institucional sobre una revisión identificada, los servicios reinician automáticamente, el respaldo externo fue restaurado con éxito y la institución recibe la documentación operativa sin secretos.
