# Contrato de autorización administrativa — ÉPICA 07

## Alcance

Este documento es la fuente contractual de HU01-E07. E07 recibe sin reinterpretar el
contrato de materiales de `docs/epica-06-contrato-valoracion.md`.

La solicitud se decide como unidad. No existe autorización individual por material y
`historial_ticket` no participa.

## Roles y permisos

| Operación | Rol |
| :-- | :-- |
| Listar pendientes | `Subdirector Administrativo` |
| Consultar detalle administrativo | `Subdirector Administrativo` |
| Autorizar | `Subdirector Administrativo` |
| Rechazar | `Subdirector Administrativo` |
| Corregir y reenviar | Autor original con rol `Personal de Mantenimiento` |

Un integrante de mantenimiento distinto del autor recibe `404` al intentar reenviar,
para no confirmar la existencia de una valoración ajena.

## Estados

| Acción | Ticket | Solicitud |
| :-- | :-- | :-- |
| Entrada desde E06 | `Valorado` | `Pendiente de autorización` |
| Autorizar | `Autorizado` | `Autorizada` |
| Rechazar | `Rechazado` | `Rechazada` |
| Corregir y reenviar | `Valorado` | `Pendiente de autorización` |

Autorizar o rechazar exige que ambos estados de entrada coincidan. Cada decisión
exitosa registra `validado_por`, `fecha_validacion` e incrementa `veces_revisada`
exactamente una vez.

El reenvío conserva `veces_revisada` y limpia `motivo_rechazo`, `validado_por` y
`fecha_validacion`.

## DTO

Cada material de salida utiliza:

```json
{
  "id": 41,
  "descripcion": "Cable THW calibre 12",
  "cantidad": 25,
  "costo_unitario": "18.50",
  "subtotal": "462.50"
}
```

Los importes son strings con dos decimales. El servidor calcula `subtotal` y
`costo_estimado`.

Una valoración administrativa incluye:

```json
{
  "id": 15,
  "ticket_id": 27,
  "estado": "Pendiente de autorización",
  "observaciones": "Sustituir cableado dañado.",
  "motivo_rechazo": null,
  "veces_revisada": 0,
  "valorado_por": 8,
  "validado_por": null,
  "fecha_creacion": "2026-07-29T18:20:00.000000Z",
  "fecha_validacion": null,
  "tecnico": {
    "id": 8,
    "name": "Personal de mantenimiento"
  },
  "revisado_por": null,
  "ticket": {
    "id": 27,
    "folio": "TK-027",
    "titulo": "Falla eléctrica",
    "descripcion_desperfecto": "No funciona la iluminación.",
    "ubicacion": "Laboratorio 2",
    "estado": {
      "id": 2,
      "nombre": "Valorado"
    },
    "area": {
      "id": 3,
      "nombre": "Laboratorios",
      "sede": {
        "id": 1,
        "nombre": "CBTA 79"
      }
    },
    "usuario": {
      "id": 12,
      "name": "Usuario reportante",
      "email": "usuario@example.test"
    }
  },
  "materiales": [],
  "costo_estimado": "462.50"
}
```

El arreglo de materiales se abrevia en el ejemplo; cada elemento utiliza el DTO
completo indicado arriba.

## Endpoints

### `GET /api/valoraciones/pendientes`

Rol: `Subdirector Administrativo`.

Parámetros:

| Parámetro | Regla |
| :-- | :-- |
| `search` | Folio `TK-001`, ID o parte del título; máximo 150 caracteres |
| `area_id` | Área existente |
| `sort` | `fecha_desc`, `fecha_asc`, `costo_desc` o `costo_asc` |

Devuelve exclusivamente solicitudes `Pendiente de autorización`. Una consulta sin
resultados devuelve `200` y `data: []`. Parámetros inválidos devuelven `422`.

### `GET /api/valoraciones/{valoracion}`

Rol: `Subdirector Administrativo`.

Devuelve el DTO completo, incluidas ubicación, sede, área, reportante, autor,
observaciones, materiales y total. Una valoración inexistente devuelve `404`.

### `POST /api/valoraciones/{valoracion}/autorizar`

Rol: `Subdirector Administrativo`. No recibe payload.

Bloquea solicitud y ticket, valida los estados de entrada y comprueba que todos los
materiales sean válidos. En éxito devuelve `200`, solicitud `Autorizada` y ticket
`Autorizado`.

### `POST /api/valoraciones/{valoracion}/rechazar`

Rol: `Subdirector Administrativo`.

```json
{
  "motivo_rechazo": "Ajustar cantidades y descripción."
}
```

El motivo se recorta, es obligatorio y admite máximo 500 caracteres. En éxito devuelve
solicitud `Rechazada` y ticket `Rechazado`.

### `PUT /api/valoraciones/{valoracion}/reenviar`

Rol: autor original con rol `Personal de Mantenimiento`.

```json
{
  "observaciones": "Se ajustaron las cantidades.",
  "materiales": [
    {
      "id": 41,
      "descripcion": "Cable THW calibre 12",
      "cantidad": 20,
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

La colección representa el estado completo:

- un ID existente de la valoración se actualiza;
- un elemento sin ID se crea;
- un material existente omitido se elimina;
- un ID ajeno o duplicado produce `422`;
- índices posicionales no se aceptan.

Observaciones y materiales usan los mismos límites de E06: observaciones hasta 5,000
caracteres, entre 1 y 50 materiales, descripción hasta 150, cantidad entera entre 1 y
1,000,000 y costo unitario de 0 a 99,999,999.99 con máximo dos decimales.

## Errores

- `200`: operación correcta.
- `401`: sesión ausente.
- `403`: rol no permitido.
- `404`: recurso inexistente o valoración ajena durante reenvío.
- `422`: filtros o payload inválidos, estados incompatibles, segunda decisión,
  catálogo faltante o material ajeno.

Ejemplo:

```json
{
  "message": "The valoracion field is invalid.",
  "errors": {
    "valoracion": [
      "La valoración ya fue procesada o sus estados no permiten esta decisión."
    ]
  }
}
```

## Atomicidad y concurrencia

Las decisiones y el reenvío:

1. abren una transacción;
2. bloquean la solicitud mediante `lockForUpdate`;
3. bloquean el ticket;
4. vuelven a comprobar estado y propiedad;
5. aplican todos los cambios;
6. confirman o revierten la operación completa.

Dos decisiones concurrentes no pueden prosperar. La segunda observa el estado ya
procesado y devuelve `422`.

HU02 y HU03 Backend pueden evolucionar en paralelo después de aprobar este contrato.
HU04 consume HU02 y HU03. HU05 depende de la decisión administrativa; HU06 consume
HU05. HU07 valida el flujo integrado y la regresión E06–E07.
