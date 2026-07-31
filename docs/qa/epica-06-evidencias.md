# Evidencias de validación — ÉPICA 06

## Identificación

- Fecha: 2026-07-29.
- Rama: `feature/afinacion-valoracion-tecnica`.
- Contrato: `docs/epica-06-contrato-valoracion.md`.
- Suite principal: `backend/tests/Feature/Valoracion/ValoracionFlowTest.php`.

## Trazabilidad

| Caso | Evidencia |
| :-- | :-- |
| E06-01, E06-02 | Prueba de filtros de tickets pendientes |
| E06-03 | Middleware de rol y prueba de usuario no autorizado |
| E06-05–E06-09 | Validaciones, persistencia y contrato decimal |
| E06-10 | Prueba de ticket no pendiente |
| E06-11 | Prueba de segundo intento y restricción única |
| E06-12 | Prueba de catálogo faltante y ausencia de cambios |
| E06-13 | Prueba de alcance por autor |
| E06-14 | Prueba de ruta de eliminación inexistente |
| E06-15 | Formulario abre diálogo antes de invocar el servicio |
| E06-16 | Candado sincrónico y estado de petición del formulario |
| E06-17 | Etiquetas, diálogo modal, foco inicial, ciclo de tabulación y clases responsivas |
| E06-18 | Suite completa Backend, lint y build |
| E06-19 | Aserciones de ticket `Valorado`, solicitud `Pendiente de autorización` y DTO |

## Auditoría de datos heredados

Antes de la normalización local se observaron:

- seis solicitudes;
- una solicitud con estado antiguo `Pendiente`;
- ninguna solicitud en `Pendiente de autorización`;
- ninguna solicitud sin observaciones, autor o fecha;
- nueve materiales;
- ninguna cantidad menor que uno.

La migración `2026_07_29_000000_normalize_pending_valoraciones_state.php` normaliza
únicamente solicitudes inequívocas: ticket `Valorado`, datos obligatorios presentes,
al menos un material y ausencia de cantidades o costos inválidos. No inventa valores
ni elimina filas.

## Resultados

Los resultados finales de comandos se registran al cerrar la implementación:

| Verificación | Resultado |
| :-- | :-- |
| PHPUnit E06 | 9 pruebas, 67 aserciones aprobadas |
| Suite Backend completa | 11 pruebas, 69 aserciones aprobadas |
| TypeScript lint | Aprobado |
| Build Vite | Aprobado; 1,763 módulos transformados |
| Build CSS | 43.05 kB; gzip 8.26 kB |
| Build JavaScript | 387.06 kB; gzip 114.61 kB |
| Laravel Pint | Aprobado |
| Migraciones | 15 ejecutadas; normalización E06 en batch 9 |

Después de la migración:

- seis solicitudes totales;
- cero solicitudes con estado antiguo `Pendiente`;
- una solicitud en `Pendiente de autorización`.

## Defectos

No se identificaron defectos críticos o altos abiertos en la implementación.

Observación para E14: repetir una carrera realmente paralela sobre PostgreSQL aislado.
E06 ya incorpora bloqueo de fila, restricción única y transformación del conflicto en
`422`; la prueba actual certifica reintento y ausencia de duplicados sobre la base
aislada disponible.

## Dictamen

`Aprobada con observaciones`.

Suite, lint, build, formato y migración concluyeron correctamente. No hay defectos
críticos o altos abiertos. La observación de repetir concurrencia paralela sobre
PostgreSQL aislado se conserva para E14 y no bloquea el cierre E06 porque el ambiente
destructivo PostgreSQL de QA todavía no forma parte del repositorio.
