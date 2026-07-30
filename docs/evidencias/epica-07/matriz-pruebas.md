# Matriz de pruebas — ÉPICA 07

| ID | HU | Escenario | Evidencia |
| :-- | :-- | :-- | :-- |
| E07-01 | HU02 | Listado solo pendiente | `ValoracionAuthorizationTest` |
| E07-02 | HU02 | Búsqueda por folio/título | `ValoracionAuthorizationTest` |
| E07-03 | HU02 | Filtro por área y cuatro órdenes | `ValoracionAuthorizationTest` |
| E07-04 | HU02 | Detalle y contrato monetario | `ValoracionAuthorizationTest` |
| E07-05 | HU02–HU03 | Permisos de cuatro roles | `ValoracionAuthorizationTest` |
| E07-06 | HU03 | Autorización atómica | `ValoracionAuthorizationTest` |
| E07-07 | HU03 | Rechazo y motivo recortado | `ValoracionAuthorizationTest` |
| E07-08 | HU03 | Segunda decisión/estado inconsistente | `ValoracionAuthorizationTest` |
| E07-09 | HU03 | Material o catálogo faltante | `ValoracionAuthorizationTest` |
| E07-10 | HU04 | Filtros, detalle, confirmación y errores | Lint, build e inspección funcional |
| E07-11 | HU05 | Propiedad exclusiva | `ValoracionResubmissionTest` |
| E07-12 | HU05 | Sincronización por ID | `ValoracionResubmissionTest` |
| E07-13 | HU05 | Limpieza del ciclo y contador conservado | `ValoracionResubmissionTest` |
| E07-14 | HU05 | Estado inválido y rollback | `ValoracionResubmissionTest` |
| E07-15 | HU06 | Motivo visible y formulario precargado | Inspección funcional |
| E07-16 | HU06 | Validación, confirmación y captura conservada | Lint, build e inspección funcional |
| E07-17 | HU07 | Regresión E06 | `ValoracionFlowTest` |
| E07-18 | HU07 | Suite, formato, lint y build | Resultado reproducible |

Los defectos de permisos, concurrencia, transición parcial, propiedad o pérdida de
materiales se consideran críticos o altos y bloquean la aprobación.
