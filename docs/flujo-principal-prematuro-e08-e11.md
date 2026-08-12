# Flujo principal prematuro — E08 a E11

## Propósito

Esta entrega cierra el recorrido mínimo del ticket para habilitar una versión preliminar del MVP. Se priorizó un flujo funcional y verificable; no pretende agotar el refinamiento visual ni todas las capacidades de las épicas.

## Flujo implementado

1. Una valoración autorizada deja el ticket en `Autorizado`.
2. Personal de Mantenimiento consulta la bandeja y toma el ticket de forma exclusiva.
3. El ticket cambia a `En reparación` y se registra su estado inicial.
4. El mismo responsable finaliza la reparación con proceso, estado final y tres imágenes: `inicial`, `durante` y `final`.
5. En una sola operación se cambia el ticket a `Reparado`, se genera el PDF privado y se crea la bitácora.
6. Tras confirmar el cierre se notifican el Subdirector Administrativo y los responsables activos del área.
7. Los actores autorizados consultan el archivero y descargan el PDF mediante un endpoint autenticado.

Las evidencias fotográficas permanecen públicas por la decisión vigente del MVP. Los PDF se almacenan en `storage/app/private/reportes` y nunca se exponen mediante `storage:link`.

## API mínima

- `GET /api/reparaciones`
- `POST /api/tickets/{ticket}/reparacion`
- `POST /api/reparaciones/{reparacion}/finalizar`
- `GET /api/bitacoras-reparacion`
- `GET /api/bitacoras-reparacion/{bitacora}`
- `GET /api/tickets/{ticket}/reporte-reparacion`
- `GET /api/notifications`
- `PATCH /api/notifications/{notification}/read`
- `PATCH /api/notifications/read-all`

## Puesta al día del entorno

Después de integrar la rama:

```bash
cd backend
composer install
php artisan migrate
php artisan storage:link
php artisan optimize:clear
php artisan test

cd ../frontend
npm install
npm run build
```

La generación del PDF usa una dependencia incluida por Composer y no requiere ejecutar un servicio adicional. JPG y PNG pueden incrustarse directamente; para incrustar evidencias WebP, el PHP del servidor debe tener habilitada la extensión GD con soporte WebP. Esta verificación debe formar parte de la preparación del despliegue (`php -m` y `gd_info()`). No se añadió conversión automática de imágenes.

## Refinamiento incorporado posteriormente

- Notificaciones instantáneas con Reverb, canal privado Sanctum y Echo; REST
  permanece como degradación segura.
- Búsqueda de reparaciones por folio, título, descripción o ubicación.
- Estado inicial precargado y editable a partir del reporte original.
- Validación local, vistas previas y progreso de carga para las tres evidencias.
- Paginación y detalle dedicado del Archivero Digital.
- Informe PDF con identidad REPARA-79, identificador documental, responsables,
  fechas, materiales en MXN, evidencias y espacio de conformidad.

## Trabajo todavía reservado para refinamiento del equipo

- Compresión o conversión automática de imágenes a WebP.
- Sustitución del identificador visual propio de REPARA-79 por un logotipo
  institucional, únicamente cuando el plantel entregue un recurso aprobado.
- Pruebas automatizadas del frontend y ampliación de escenarios de accesibilidad.
- Observabilidad, reintentos de notificación y endurecimiento específico del servidor de producción.

Estas tareas permiten aportaciones sustanciales posteriores sin dejar incompleto el recorrido principal del MVP.
