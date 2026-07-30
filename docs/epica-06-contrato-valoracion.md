# Contrato de valoración técnica — ÉPICA 06

## Estado y alcance

Este documento es la fuente contractual de HU01-E06. Define la consulta de tickets
elegibles, el registro de una valoración completa y la consulta de valoraciones
propias. ÉPICA 06 no permite borradores persistidos, edición ni eliminación después
del envío.

Roles oficiales:

- `Personal de Mantenimiento`: consulta tickets operativos, registra valoraciones y
  consulta las propias.
- Los demás roles autenticados conservan el alcance de tickets definido por el
  módulo, pero reciben `403` al registrar o consultar valoraciones propias.

Transición atómica:

```text
Ticket Pendiente + sin valoración
              ↓
Ticket Valorado + solicitud Pendiente de autorización
```

## Límites

| Dato | Regla |
| :-- | :-- |
| `observaciones` | String recortada, obligatoria, máximo 5,000 caracteres |
| `materiales` | Arreglo obligatorio, entre 1 y 50 elementos |
| `descripcion` | String recortada, obligatoria, máximo 150 caracteres |
| `cantidad` | Entero entre 1 y 1,000,000 |
| `costo_unitario` | Decimal entre 0 y 99,999,999.99, máximo dos decimales |

El cliente no controla autor, fecha, estado, subtotal ni total. Los campos adicionales
en cada material son rechazados. Los campos superiores no reconocidos se ignoran y no
se persisten.

## DTO público

### Material de entrada

```json
{
  "descripcion": "Cable THW calibre 12",
  "cantidad": 25,
  "costo_unitario": 18.50
}
```

### Material de salida

```json
{
  "id": 41,
  "descripcion": "Cable THW calibre 12",
  "cantidad": 25,
  "costo_unitario": "18.50",
  "subtotal": "462.50"
}
```

`descripcion` es el alias público de `materiales_ticket.nombre_material`.
`costo_unitario`, `subtotal` y `costo_estimado` siempre son strings decimales con dos
posiciones. Subtotal y total se calculan en el servidor y no se almacenan.

### Valoración de salida

```json
{
  "id": 15,
  "ticket_id": 27,
  "estado": "Pendiente de autorización",
  "observaciones": "Se requiere sustituir cableado dañado.",
  "motivo_rechazo": null,
  "veces_revisada": 0,
  "valorado_por": 8,
  "fecha_creacion": "2026-07-29T18:20:00.000000Z",
  "tecnico": {
    "id": 8,
    "name": "Personal de mantenimiento"
  },
  "materiales": [
    {
      "id": 41,
      "descripcion": "Cable THW calibre 12",
      "cantidad": 25,
      "costo_unitario": "18.50",
      "subtotal": "462.50"
    }
  ],
  "costo_estimado": "462.50",
  "created_at": "2026-07-29T18:20:00.000000Z"
}
```

Los campos administrativos permanecen nulos hasta la decisión de E07.
`codigo_material`, `inventario_ref`, `estado_individual` y el rechazo individual no
forman parte del contrato.

## Endpoints

### `GET /api/tickets`

Autenticación: Sanctum.

Parámetros de E06:

| Parámetro | Valores |
| :-- | :-- |
| `estado` | Estado oficial; la bandeja E06 envía `Pendiente` |
| `search` | Folio `TK-001`, ID numérico o parte del título; máximo 150 caracteres |
| `area_id` | ID existente de área |
| `sort` | `fecha_desc` o `fecha_asc` |

Personal de Mantenimiento y Subdirector pueden consultar el conjunto operativo. Los
demás usuarios conservan el alcance de tickets propios. Los filtros se aplican en el
servidor. Una consulta sin coincidencias responde `200` con `data: []`. Parámetros
inválidos responden `422`.

### `GET /api/tickets/{ticket}`

Autenticación: Sanctum.

Devuelve ticket, área, sede, tipo, prioridad, reportante, estado, evidencia y
valoración disponible. Personal de Mantenimiento y Subdirector pueden consultar
cualquier ticket; los demás usuarios reciben `404` al intentar inferir uno ajeno.

Respuestas: `200`, `401` o `404`.

### `POST /api/valoraciones`

Autenticación: Sanctum. Rol exclusivo: `Personal de Mantenimiento`.

Petición:

```json
{
  "ticket_id": 27,
  "observaciones": "Se requiere sustituir cableado dañado.",
  "materiales": [
    {
      "descripcion": "Cable THW calibre 12",
      "cantidad": 25,
      "costo_unitario": 18.50
    },
    {
      "descripcion": "Interruptor termomagnético",
      "cantidad": 1,
      "costo_unitario": 340
    }
  ]
}
```

Éxito `201`:

```json
{
  "success": true,
  "message": "Valoración registrada correctamente",
  "data": {
    "id": 15,
    "ticket_id": 27,
    "estado": "Pendiente de autorización",
    "materiales": [],
    "costo_estimado": "802.50"
  }
}
```

El ejemplo abrevia los materiales; la respuesta real utiliza el DTO público completo.

Errores:

- `401`: no autenticado.
- `403`: rol distinto de Personal de Mantenimiento.
- `422`: `ticket_id` inexistente, payload inválido, ticket no `Pendiente`,
  valoración existente, reintento concurrente o catálogo requerido ausente.

Ejemplo `422`:

```json
{
  "message": "The ticket id field is invalid.",
  "errors": {
    "ticket_id": [
      "Solo se puede valorar un ticket en estado Pendiente."
    ]
  }
}
```

La operación bloquea el ticket dentro de una transacción. Tras obtener el bloqueo
vuelve a comprobar estado y existencia. La restricción única de
`solicitudes_materiales.ticket_id` actúa como segunda barrera; una colisión se
transforma en un error controlado. Una falla revierte solicitud, materiales y estado.

Los estados `Pendiente` y `Valorado` se consultan de `estados_ticket`; nunca se crean
durante la operación.

### `GET /api/valoraciones/mis-valoraciones`

Autenticación: Sanctum. Rol exclusivo: `Personal de Mantenimiento`.

Parámetro opcional:

- `sort`: `fecha_desc` o `fecha_asc`.

Devuelve únicamente las valoraciones cuyo `valorado_por` coincide con el usuario
autenticado, mediante el DTO completo. No existe endpoint de edición o eliminación
para una valoración enviada.

Respuestas: `200`, `401`, `403` o `422`.

## Dependencias y entrega

- HU02 implementa este contrato en Backend.
- HU03 lo consume desde Frontend.
- HU04 verifica respuesta HTTP y persistencia.
- E07 recibe ticket `Valorado`, solicitud `Pendiente de autorización`,
  observaciones, autor, fecha, materiales completos y `costo_estimado`.
- E09 y E13 deben reutilizar los importes ya definidos sin aceptar totales del cliente.

HU02 y HU03 pueden desarrollarse en paralelo después de aprobar este documento; HU04
requiere ambas integradas.
