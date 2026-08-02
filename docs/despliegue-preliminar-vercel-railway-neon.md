# Despliegue preliminar — Vercel, Railway y Neon

Esta guía separa deliberadamente el entorno local del MVP remoto. Ningún secreto de Vercel, Railway o Neon se guarda en Git.

## Qué conserva el entorno local

- `backend/.env` continúa apuntando a PostgreSQL local y `APP_ENV=local`.
- `frontend/.env` continúa usando `VITE_API_URL=http://localhost:8000/api`.
- El registro público continúa disponible porque su valor predeterminado es `true`.
- `storage/app/public` y `storage/app/private` continúan siendo almacenamiento local.
- Los archivos `.env.railway.example` y `.env.vercel.example` son plantillas; no son cargados automáticamente.

## Antes de conectar plataformas

```bash
cd backend
composer install
php artisan migrate
php artisan test

cd ../frontend
npm install
npm run lint
npm run build
```

Los cambios deben estar confirmados y publicados en la rama que se seleccione en ambas plataformas.

## 1. Neon

1. Crear un proyecto y una base exclusiva del MVP.
2. Seleccionar una región cercana a Railway.
3. Copiar la cadena pooled con `sslmode=require`.
4. Guardar esa cadena únicamente como `DB_URL` de Railway.
5. No crear tablas manualmente ni ejecutar migraciones desde Vercel.

## 2. Railway

Crear un servicio desde GitHub con:

- Root Directory: `backend`
- Builder: Railpack, definido en `backend/railway.json`
- Health check: `/api/health`
- Dominio público generado por Railway

Copiar `backend/.env.railway.example` al editor de variables de Railway y sustituir cada marcador. Para generar una clave independiente:

```bash
php artisan key:generate --show
```

Railpack detecta Laravel, instala Composer, ejecuta migraciones y seeders, crea `storage:link` y optimiza cachés. El seeder predeterminado solo crea catálogos idempotentes; nunca crea una contraseña administrativa fija.

### Volumen obligatorio

Adjuntar un Railway Volume al servicio Laravel con mount path:

```text
/app/storage/app
```

Este volumen conserva tanto `public/evidencias` como `private/reportes`. No montar todo `/app/storage`, porque Laravel también necesita directorios efímeros de framework y logs incluidos en la imagen.

### Cuentas demo

Después del primer despliegue, abrir una shell del servicio y ejecutar:

```bash
php artisan app:provision-demo-users
```

El comando crea los cuatro roles con correos `.test` y contraseñas aleatorias mostradas una sola vez. Guardarlas fuera del repositorio. Para rotarlas y revocar sus tokens:

```bash
php artisan app:provision-demo-users --rotate
```

## 3. Vercel

Crear un proyecto desde el mismo repositorio con:

- Framework: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Copiar las variables de `frontend/.env.vercel.example` al panel de Vercel y sustituir el dominio Railway. `frontend/vercel.json` ya incluye el fallback de React Router.

Después del primer despliegue de Vercel, copiar su origen exacto —sin ruta ni diagonal final— a Railway:

```env
CORS_ALLOWED_ORIGINS=https://proyecto.vercel.app
```

Redesplegar Railway después de cambiar la variable.

## Acceso restringido

En Railway:

```env
ALLOW_PUBLIC_REGISTRATION=false
LOGIN_ATTEMPTS_PER_MINUTE=5
```

En Vercel:

```env
VITE_ALLOW_PUBLIC_REGISTRATION=false
```

Estas dos variables cumplen funciones distintas: Vercel oculta la interfaz y Railway bloquea realmente el endpoint. Las rutas funcionales permanecen protegidas por Sanctum y las cuentas inactivas son rechazadas incluso si conservan un token anterior.

Para limitar la visualización del frontend, usar un Preview Deployment con Vercel Deployment Protection. La dirección Railway sigue siendo técnicamente pública, pero no permite registro y no expone operaciones sin un token válido.

## Verificación posterior

1. `GET https://RAILWAY/api/health` responde `200` y tres checks `true`.
2. La pantalla Vercel no muestra la pestaña Registro.
3. Un `POST /api/register` directo responde `404`.
4. Cada cuenta demo puede iniciar sesión y solo ve su alcance.
5. Ejecutar el flujo completo hasta descargar el PDF.
6. Redesplegar Railway y comprobar que las imágenes y el PDF siguen disponibles.
7. Revisar logs Railway y las métricas de consumo de Railway y Neon.

## Auditoría de dependencias

- Composer queda sin avisos conocidos después de actualizar Guzzle y PSR-7.
- El frontend usa React Router `7.18.2`, la versión estable más reciente al preparar este despliegue.
- `npm audit` todavía reporta `GHSA-qwww-vcr4-c8h2`, limitado al modo experimental RSC/Server Actions. REPARA-79 utiliza exclusivamente `BrowserRouter` declarativo en un build Vite estático: no contiene `RouterProvider`, loaders, actions, RSC ni servidor React. No debe ejecutarse `npm audit fix --force`, porque propone bajar a `7.11.0`, versión afectada por otros avisos de XSS y redirección.
- Volver a ejecutar la auditoría antes de publicar; actualizar cuando React Router libere una versión fuera del rango afectado y repetir el build y la regresión.

## Valores que nunca deben cruzarse

- `DB_URL`, `APP_KEY` y credenciales demo: solo Railway o el custodio autorizado.
- `VITE_API_URL`: Vercel; no es secreto porque queda incluido en el bundle.
- `.env` local: nunca se copia completo a los paneles ni se confirma en Git.
- Base local: no se sincroniza automáticamente con Neon.
- Archivos locales de `storage`: no se suben automáticamente al Railway Volume.
