# Infraestructura de almacenamiento de archivos

## Estado y alcance del MVP

Esta decisión consolida la organización física, nombres, rutas persistidas y
visibilidad de los archivos de REPARA-79. La conversión automática a WebP queda
diferida; las imágenes conservan su formato real.

## Estructura

```text
storage/app/public/
├── perfiles/{profile_uuid}/avatar.webp
└── evidencias/ticket-{id}/
    ├── referencia/{uuid}.{jpg|png|webp}
    ├── inicial/{uuid}.{jpg|png|webp}
    ├── durante/{uuid}.{jpg|png|webp}
    └── final/{uuid}.{jpg|png|webp}

storage/app/private/
└── reportes/ticket-{id}/reporte-reparacion-ticket-{id}.pdf
```

Las carpetas se crean bajo demanda. La base de datos conserva únicamente rutas
relativas. `StoragePath` centraliza estas convenciones para evitar construir
rutas manualmente en controladores.

## Visibilidad aceptada para el MVP

- Avatares, referencias y evidencias de reparación son imágenes públicas.
- El UUID reduce colisiones y evita nombres suministrados por usuarios, pero no
  constituye autorización.
- Los PDF son privados y se almacenan en el disco `protected_reports`, que no
  participa en `storage:link`.
- E09/E10 deben entregar los PDF mediante endpoints autenticados y autorizados.
- El Director General no recibe permisos implícitos mientras su participación
  no esté definida en el flujo funcional.

La publicación de imágenes es una simplificación consciente del MVP. Antes de
ampliar la exposición de red debe reevaluarse si las fotografías institucionales
requieren protección equivalente a los reportes.

## Formatos de imagen

Se admiten exclusivamente JPEG (`.jpg` o `.jpeg`), PNG y WebP. `.jpeg` se
normaliza a `.jpg`. El backend valida peso máximo de 5 MB, MIME real, integridad,
lado máximo de 6000 píxeles y máximo de 20 megapíxeles. SVG, GIF, BMP, AVIF,
HEIC y archivos corruptos se rechazan.

No se cambia una extensión para simular una conversión. La conversión futura a
WebP deberá sustituir el procesamiento interno sin alterar la construcción de
rutas ni los consumidores.

## Perfiles

`users.profile_uuid` es único y estable. Se genera para usuarios actuales y
nuevos, pero no crea carpetas. El endpoint y la interfaz para cargar avatares no
forman parte de este cambio.

## Fotografía de referencia

El antiguo concepto `fotografia_inicial` se renombra a
`fotografia_referencia`. `inicial` queda reservado para la evidencia técnica de
E08. Las cargas nuevas se guardan en:

```text
evidencias/ticket-{id}/referencia/{uuid}.{ext}
```

La creación del ticket, persistencia de la ruta y escritura del archivo se
coordinan para limpiar archivos nuevos si falla la base de datos.

## Migración operativa

Después de aplicar migraciones se trasladan referencias históricas mediante:

```bash
php artisan storage:migrate-ticket-references --dry-run
php artisan storage:migrate-ticket-references
```

El comando es idempotente, comprueba existencia, MIME y tamaño de la copia,
actualiza la ruta y solo entonces retira el archivo anterior. Un fallo produce
código de salida distinto de cero y conserva el original.
