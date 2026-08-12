# Guía de auditoría local — Flujo principal REPARA-79

## Preparación única

```powershell
cd backend
composer install
php artisan migrate
php artisan storage:link
php artisan optimize:clear

cd ..\frontend
npm install
```

Los archivos `.env` deben compartir los mismos valores de `REVERB_APP_KEY` y
usar por defecto Reverb en `127.0.0.1:8080`. Los valores documentados en los
`.env.example` son exclusivamente locales; producción debe usar secretos
distintos y orígenes explícitos.

La migración `2026_08_12_000000_restore_usuario_area_pivot` repara instalaciones
locales antiguas en las que el historial marcaba la migración base como
ejecutada, pero la tabla de asignaciones `usuario_area` no existía. Sin esta
tabla no pueden resolverse los Responsables del Lugar destinatarios.

## Procesos durante la auditoría

Abrir tres terminales:

```powershell
# Terminal 1
cd backend
php artisan serve

# Terminal 2
cd backend
composer reverb

# Terminal 3
cd frontend
npm run dev
```

Con `ShouldBroadcastNow` las notificaciones no dependen de un worker para la
auditoría local. Si Reverb se detiene, el cierre sigue siendo válido y la
campana recupera las notificaciones persistidas mediante REST.

## Recorrido recomendado

1. Autorizar una valoración como Subdirector Administrativo.
2. Abrir dos sesiones de Personal de Mantenimiento y comprobar que solo una
   pueda tomar el mismo ticket.
3. Buscar el ticket por folio y título.
4. Confirmar o corregir el estado inicial precargado.
5. Seleccionar las tres evidencias y comprobar vista previa, formato, límite y
   progreso.
6. Finalizar y confirmar el cambio a `Reparado`.
7. Verificar que la campana del destinatario cambie sin recargar.
8. Abrir la notificación, revisar el detalle del Archivero y descargar el PDF.
9. Probar búsqueda, paginación y permisos con los cuatro roles.

## Verificación automatizada

```powershell
cd backend
php artisan test

cd ..\frontend
npm run lint
npm run build
```

No mostrar datos, imágenes o credenciales reales durante la auditoría. Los PDF
son privados; las evidencias fotográficas continúan públicas por la decisión
vigente del MVP.
