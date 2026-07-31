# Plan de validación — ÉPICA 06

## Objetivo

Comprobar el registro completo de una valoración desde un ticket `Pendiente` y
garantizar que E07 reciba datos estables, sin modificaciones ni persistencia parcial.

## Ambientes

- Suite automatizada: PHPUnit con base aislada configurada por `phpunit.xml`.
- Integración local: PostgreSQL de desarrollo únicamente para migración y consulta
  controlada; las pruebas destructivas no utilizan esta base.
- Frontend: TypeScript y build Vite de producción.

La ejecución concurrente real sobre PostgreSQL se repetirá en la consolidación E14.
En E06 se verifican bloqueo pesimista, restricción única, reintento controlado y
rollback automatizado.

## Matriz

| ID | Criterio | Tipo | Resultado esperado |
| :-- | :-- | :-- | :-- |
| E06-01 | Consulta por estado, folio, área y orden | Automatizada | Solo tickets coincidentes |
| E06-02 | Parámetros inválidos | Automatizada | `422` |
| E06-03 | Acceso con cuatro roles | Automatizada/manual | Solo mantenimiento registra |
| E06-04 | Detalle completo | Regresión API/UI | Datos del ticket disponibles |
| E06-05 | Cero materiales | Automatizada | `422`, sin cambios |
| E06-06 | Uno y varios materiales | Automatizada | Persistencia completa |
| E06-07 | Cantidades inválidas | Automatizada | `422` |
| E06-08 | Costos inválidos, cero y decimales | Automatizada | Rechazo o cálculo exacto |
| E06-09 | Subtotales y total | Automatizada/manual | Dos posiciones decimales |
| E06-10 | Ticket no pendiente | Automatizada | `422`, sin cambios |
| E06-11 | Ticket ya valorado/reintento | Automatizada | Un solo registro |
| E06-12 | Catálogo faltante | Automatizada | Rollback y error controlado |
| E06-13 | Valoraciones propias | Automatizada | Solo registros del autor |
| E06-14 | Eliminación posicional | Automatizada | Ruta inexistente |
| E06-15 | Confirmación/cancelación | Inspección funcional | Cancelar no invoca API |
| E06-16 | Envío único y error recuperable | Inspección funcional | Bloqueo y captura conservada |
| E06-17 | Móvil, escritorio y teclado | Inspección funcional | Controles operables |
| E06-18 | Regresión E05 | Suite y recorrido | Tickets continúan disponibles |
| E06-19 | Entrada para E07 | Automatizada | Estados y DTO definitivos |

## Severidad

- Crítica: pérdida de datos, autorización incorrecta o transición parcial.
- Alta: duplicidad, contrato monetario incorrecto o imposibilidad de completar flujo.
- Media: error recuperable de interacción o mensaje.
- Baja: detalle visual sin impacto funcional.

E06 no se aprueba con defectos críticos o altos abiertos.

## Comandos

```text
cd backend && php artisan test
cd frontend && npm run lint
cd frontend && npm run build
cd backend && php artisan migrate:status
```
