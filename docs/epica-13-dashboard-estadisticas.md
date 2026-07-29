# ÉPICA 13 — Estadísticas y Dashboard Avanzado

## Identificación

- **Estado real:** Implementada parcialmente; existe un Dashboard básico que calcula indicadores en frontend a partir de la lista completa de tickets.
- **Prioridad:** Alta.
- **Actor funcional:** Subdirector Administrativo.
- **Dependencias funcionales:** ÉPICAS 06 a 12 integradas y datos reales disponibles.
- **Enfoque:** Resumen administrativo útil, eficiente y comprensible para el MVP.

## Objetivo

Proporcionar al Subdirector Administrativo una vista consolidada del mantenimiento institucional mediante indicadores y distribuciones calculados por la API sobre PostgreSQL, para identificar carga operativa, prioridades, áreas con mayor incidencia y costo estimado de materiales autorizados.

## Resultado esperado

Al terminar la épica:

1. El Subdirector Administrativo abre el Dashboard general sin descargar todos los tickets.
2. La API devuelve indicadores consolidados desde PostgreSQL.
3. El resumen presenta total de tickets, pendientes, en reparación, reparados y costo estimado autorizado.
4. Se visualizan distribuciones por todos los estados y prioridades existentes.
5. Se muestran las áreas con mayor número de reportes y su sede.
6. Se muestran los cinco tickets más recientes dentro del alcance filtrado.
7. El usuario puede filtrar por periodo, sede o área.
8. Los demás roles conservan su Dashboard operativo básico y no acceden a estadísticas globales.

## Alcance esencial

- Endpoint administrativo único de estadísticas.
- Agregaciones SQL en backend.
- Resumen de estados clave.
- Distribución completa por estado.
- Distribución completa por prioridad.
- Cinco áreas con más tickets.
- Costo estimado de materiales autorizados.
- Cinco tickets recientes.
- Filtros por fecha de reporte, sede y área.
- Visualizaciones responsive y accesibles.
- Estados de carga, vacío y error.
- Pruebas de cálculos, permisos, filtros y regresión.

## Recortes deliberados por tiempo

- No se agregan librerías de gráficas.
- No se implementan series históricas mensuales.
- No se calculan predicciones, tendencias o inteligencia artificial.
- No se calcula costo real, ahorro, presupuesto o consumo de inventario.
- No se calcula tiempo promedio de atención o cumplimiento de SLA.
- No se agregan mapas geográficos.
- No se exporta a Excel, CSV, imagen o PDF.
- No se construyen dashboards configurables por usuario.
- No se implementa caché, materialized views o procesos ETL.
- No se muestran métricas de cuentas o catálogos administrativos.
- No se implementa actualización en tiempo real mediante Reverb.
- No se agregan filtros por estado o prioridad durante el MVP; ambas variables ya se muestran como distribuciones.

## Aclaración sobre costos

El sistema no registra compras, salidas de almacén o consumo real. Por ello:

- La etiqueta oficial es **Costo estimado de materiales autorizados**.
- Solo se incluyen solicitudes con `estado_general = 'Autorizada'`.
- Cada subtotal se calcula como `cantidad × costo_unitario`.
- El total es la suma de esos subtotales.
- No se almacena un total nuevo en base de datos.
- El indicador no se presenta como gasto ejercido.

## Contraste con la implementación actual

| Capacidad                          | Estado actual       | Pendiente principal                                         |
| :--------------------------------- | :------------------ | :---------------------------------------------------------- |
| Dashboard por rol                  | Parcial             | Separar resumen administrativo del operativo.               |
| Indicadores básicos                | Parcial             | Calcularlos en backend y cubrir estados oficiales.          |
| Carga de datos                     | Ineficiente         | Evitar descargar todos los tickets para contar en React.    |
| Distribución por estado            | Parcial visual      | Usar todos los estados y conteos de PostgreSQL.              |
| Distribución por prioridad         | Parcial             | Usar catálogo dinámico, sin nombres codificados.             |
| Estadísticas por área              | No implementado     | Agrupar y devolver las cinco áreas principales.              |
| Costo estimado autorizado          | No implementado     | Calcular desde solicitudes y materiales.                     |
| Filtros administrativos            | No implementado     | Validar fecha, sede y área en API e interfaz.                |
| Tickets recientes                  | Parcial             | Limitar a cinco y obtenerlos desde el endpoint agregado.     |
| API de Dashboard                   | No implementado     | Crear controlador, request, servicio y ruta protegida.       |
| Pruebas de estadísticas            | No implementado     | Validar agregaciones, cero datos, permisos y frontend.        |

### Evidencia técnica del contraste

- `DashboardPage.tsx` consume la lista de tickets y realiza todos los conteos en memoria.
- Para Subdirector Administrativo, `TicketController::index` devuelve todos los tickets sin paginación.
- La tarjeta actual de urgentes depende de comparar nombres de prioridades codificados en frontend.
- La barra actual mezcla prioridad `urgente` con estados, por lo que sus segmentos no son mutuamente excluyentes.
- La lista llamada “recientes” renderiza todos los tickets recibidos.
- El campo visual de responsable aparece siempre sin asignar.
- No existe `DashboardController`, `DashboardService` o ruta estadística.
- No hay una librería de gráficas instalada; no es necesaria para el alcance refinado.

## Alcance por rol

| Rol                          | Dashboard resultante                                                                  |
| :--------------------------- | :------------------------------------------------------------------------------------ |
| Subdirector Administrativo   | Dashboard administrativo global con indicadores, distribuciones, filtros y recientes. |
| Personal de Mantenimiento    | Conserva su resumen operativo y accesos de trabajo; sin estadísticas globales.         |
| Responsable del Lugar        | Conserva su resumen de tickets permitidos; sin estadísticas globales.                  |
| Usuario Registrado           | Conserva su resumen de tickets propios; sin estadísticas globales.                     |

El endpoint administrativo utiliza `auth:sanctum`, cuenta activa y `role:Subdirector Administrativo`.

## Fuente y significado de los indicadores

| Indicador                              | Cálculo                                                                 |
| :------------------------------------- | :---------------------------------------------------------------------- |
| Total de tickets                       | Conteo de tickets dentro del filtro.                                    |
| Pendientes                             | Estado `Pendiente`.                                                     |
| En reparación                          | Estado `En reparación`.                                                 |
| Reparados                              | Estado `Reparado`.                                                      |
| Costo estimado autorizado              | Suma de `cantidad × costo_unitario` en solicitudes `Autorizada`.        |
| Distribución por estado                | Conteo agrupado por `estados_ticket`, incluyendo valores en cero.       |
| Distribución por prioridad             | Conteo agrupado por `prioridades_ticket`, incluyendo valores en cero.   |
| Áreas con mayor incidencia             | Conteo de tickets agrupado por área y sede, limitado a cinco.           |
| Tickets recientes                      | Cinco tickets ordenados por `fecha_reporte DESC`, después por ID.       |

Los estados clave se identifican con los nombres oficiales protegidos por ÉPICA 12. Las prioridades se devuelven dinámicamente y no se codifican por nombre.

## Filtros del MVP

| Parámetro     | Formato       | Regla                                                                   |
| :------------ | :------------ | :---------------------------------------------------------------------- |
| `date_from`   | `YYYY-MM-DD`  | Opcional; inicio inclusivo sobre `tickets.fecha_reporte`.               |
| `date_to`     | `YYYY-MM-DD`  | Opcional; fin inclusivo sobre `tickets.fecha_reporte`.                  |
| `sede_id`     | Entero        | Opcional; sede existente.                                               |
| `area_id`     | Entero        | Opcional; área existente y perteneciente a la sede enviada, si aplica.  |

Reglas:

- Sin fechas se consulta todo el histórico.
- Puede enviarse solo una fecha.
- Si ambas existen, `date_from` no puede ser posterior a `date_to`.
- El filtro temporal se aplica a `tickets.fecha_reporte`.
- Todos los indicadores utilizan exactamente el mismo conjunto filtrado de tickets.
- El costo corresponde a materiales autorizados relacionados con esos tickets, aunque la autorización haya ocurrido después.
- Cambiar sede limpia un área que ya no le pertenezca.

## Contrato API

### Endpoint

`GET /api/dashboard/administrativo`

### Respuesta mínima

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_tickets": 125,
      "pending_tickets": 18,
      "in_repair_tickets": 7,
      "repaired_tickets": 83,
      "authorized_material_estimate": "18450.50"
    },
    "by_status": [],
    "by_priority": [],
    "top_areas": [],
    "recent_tickets": [],
    "applied_filters": {},
    "generated_at": "2026-07-25T12:00:00-06:00"
  }
}
```

### Estructuras agrupadas

- `by_status`: `id`, `name`, `order`, `count`.
- `by_priority`: `id`, `name`, `color`, `count`.
- `top_areas`: `area_id`, `area_name`, `sede_id`, `sede_name`, `count`.
- `recent_tickets`: ID, título, fecha, estado, prioridad, área y sede.

Los conteos son enteros. El importe se serializa como cadena decimal con dos posiciones para evitar pérdida de precisión.

## Consultas y rendimiento

- Las agregaciones se ejecutan en PostgreSQL mediante `COUNT`, `SUM`, `GROUP BY` y subconsultas controladas.
- No se cargan modelos completos para contar en PHP.
- Cada relación se une una sola vez por consulta.
- La consulta de costos evita multiplicar registros por joins no controlados.
- Se revisa el plan con `EXPLAIN ANALYZE` usando datos representativos.
- Solo se agregan índices si el plan confirma su necesidad.
- No se crean tablas estadísticas nuevas.
- El endpoint debe mantener un número fijo y pequeño de consultas, independiente del número de tickets.

## Diseño visual mínimo

- Cinco tarjetas de resumen.
- Una distribución por estado mediante barras horizontales.
- Una distribución por prioridad mediante barras horizontales y colores del catálogo.
- Una sección con las cinco áreas principales.
- Una lista de cinco tickets recientes.
- Filtros compactos de periodo, sede y área.
- Cada barra incluye etiqueta, valor numérico y porcentaje; el color nunca es el único medio de interpretación.
- El estado vacío muestra ceros y explica que no existen datos para el filtro.

## Orden y dependencias

| HU   | Responsable único          | Depende de                                         |
| :--- | :------------------------- | :------------------------------------------------- |
| HU01 | Tech Lead                  | Contratos y modelo consolidados E06-E12            |
| HU02 | Fullstack Backend          | HU01-E13 y datos de E06-E12                        |
| HU03 | Fullstack Frontend/UX-UI   | HU01-E13 y contrato API de HU02-E13                |
| HU04 | QA                         | HU02-E13 y HU03-E13                                |

HU03 puede iniciar con un mock aprobado. QA comienza cuando el endpoint y el Dashboard administrativo estén integrados.

---

# HU01-E13-Definir contrato de estadísticas administrativas

## Descripción

**Como** Tech Lead,  
**quiero** definir indicadores, filtros, consultas y respuestas del Dashboard,  
**para** que backend, frontend y QA utilicen las mismas definiciones y no presenten métricas engañosas.

## Prioridad

Muy alta.

## Responsable único

Tech Lead.

## Alcance técnico

- Crear `docs/epica-13-contrato-dashboard.md`.
- Definir significado y fuente de cada indicador.
- Definir alcance exclusivo del Subdirector Administrativo.
- Definir filtros comunes y campo temporal.
- Definir el cálculo del costo estimado autorizado.
- Definir DTO, precisión decimal, valores cero y orden.
- Definir límite de áreas y tickets recientes.
- Definir estrategia SQL y revisión con `EXPLAIN ANALYZE`.
- Confirmar que no se incorporará una librería de gráficas.
- Definir comportamiento de los dashboards básicos de otros roles.

## Impacto en el modelo de datos

No crea tablas ni modifica información funcional.

Puede recomendar índices únicamente después de revisar el plan real de:

- `tickets`
- `estados_ticket`
- `prioridades_ticket`
- `areas`
- `sedes`
- `solicitudes_materiales`
- `materiales_ticket`

## Dependencias

- Estados oficiales protegidos.
- Prioridades dinámicas de ÉPICA 12.
- Flujo de valoración y autorización definido.
- Esquema PostgreSQL actualizado.

## Subtareas

1. **Definir métricas y costos** — Documentar fórmulas, fuentes, estados clave y diferencia entre costo estimado autorizado y gasto real.
2. **Definir filtros y alcance** — Establecer fecha de reporte, sede, área, permisos y conjunto común de tickets.
3. **Definir contrato de respuesta** — Especificar DTO, ceros, decimales, orden, recientes, top de áreas y errores.
4. **Definir rendimiento y presentación** — Limitar consultas, revisar planes y aprobar visualizaciones accesibles sin nueva dependencia.

## Criterios de aceptación

1. Cada indicador tiene nombre, fórmula y fuente.
2. El costo no se denomina gasto real.
3. Todos los módulos usan el mismo conjunto filtrado.
4. El contrato define comportamiento sin datos.
5. Estados se incluyen aunque su conteo sea cero.
6. Prioridades se obtienen dinámicamente.
7. El endpoint y DTO están documentados.
8. Solo Subdirector Administrativo accede.
9. El contrato limita áreas y tickets recientes a cinco.
10. No requiere migración funcional ni biblioteca gráfica.

## Definition of Done

1. **Dado que** existen métricas con posibles interpretaciones distintas, **cuando** se consulte el contrato, **entonces** cada indicador tendrá fórmula, fuente, filtro y etiqueta inequívocos.
2. **Dado que** el Dashboard utilizará datos agregados, **cuando** backend implemente las consultas, **entonces** podrá hacerlo sin descargar todos los tickets ni contar en PHP.
3. **Dado que** frontend debe representar estados y prioridades variables, **cuando** consuma el DTO, **entonces** recibirá etiquetas, orden, colores y valores cero desde la API.
4. **Dado que** el plazo exige un MVP, **cuando** finalice HU01, **entonces** el alcance no incluirá predicciones, exportaciones o dependencias visuales nuevas.

## Reglas de negocio

- Las métricas son de solo lectura.
- El costo es estimado y autorizado.
- Todos los filtros parten de `fecha_reporte`.
- No se codifican prioridades por nombre.
- Estados clave usan nombres oficiales.
- El Dashboard no cambia tickets o catálogos.
- Otros roles no acceden al endpoint global.

## Definition of Ready

- El modelo y estados están consolidados.
- ÉPICA 12 definió catálogos protegidos.
- El origen de costos está confirmado.
- Los recortes visuales fueron aceptados.

---

# HU02-E13-Implementar API de estadísticas

## Descripción

**Como** Subdirector Administrativo,  
**quiero** consultar indicadores consolidados mediante una API protegida,  
**para** conocer el estado institucional sin procesar todos los tickets en el navegador.

## Prioridad

Muy alta.

## Responsable único

Fullstack Backend.

## Alcance técnico

- Request nuevo:
  - `backend/app/Http/Requests/Admin/AdminDashboardRequest.php`
- Controlador nuevo:
  - `backend/app/Http/Controllers/Api/Admin/DashboardController.php`
- Servicio nuevo:
  - `backend/app/Services/Admin/DashboardService.php`
- Recurso o DTO recomendado:
  - `backend/app/Http/Resources/AdminDashboardResource.php`
- Ruta:
  - `backend/routes/api.php`
  - `GET /api/dashboard/administrativo`
- Prueba de consulta recomendada durante desarrollo:
  - `EXPLAIN ANALYZE` sobre las agregaciones con datos representativos.

La ruta usa autenticación Sanctum, cuenta activa y rol `Subdirector Administrativo`.

## Impacto en el modelo de datos

Solo consulta:

- `tickets`
- `estados_ticket`
- `prioridades_ticket`
- `areas`
- `sedes`
- `solicitudes_materiales`
- `materiales_ticket`

No persiste estadísticas.

Si el análisis demuestra índices faltantes, se crea una migración independiente:

- `backend/database/migrations/XXXX_XX_XX_XXXXXX_add_dashboard_query_indexes.php`

La migración solo incluye índices justificados y evita duplicar índices existentes.

## Dependencias

- HU01-E13-Definir contrato de estadísticas administrativas.
- Modelos y relaciones E06-E12 disponibles.
- Datos de solicitudes autorizadas consistentes.
- Middleware de cuenta activa de ÉPICA 12.

## Subtareas

1. **Validar filtros administrativos** — Crear request para fechas, sede, área, coherencia de rango y pertenencia área-sede.
2. **Construir conjunto base** — Aplicar una sola definición filtrada de tickets reutilizable en todas las agregaciones.
3. **Implementar resumen y distribuciones** — Calcular tarjetas, estados y prioridades, incluyendo catálogos con cero.
4. **Implementar costos y áreas** — Calcular materiales autorizados sin doble conteo y obtener las cinco áreas principales.
5. **Implementar recientes y DTO** — Devolver cinco tickets, filtros aplicados, fecha de generación y decimales consistentes.
6. **Proteger y optimizar endpoint** — Registrar ruta, validar rol, revisar consultas y agregar solo índices justificados.

## Criterios de aceptación

1. Solo un usuario activo con rol `Subdirector Administrativo` recibe `200`.
2. Otros roles reciben `403`.
3. Los filtros inválidos reciben `422`.
4. Todos los indicadores utilizan los mismos tickets filtrados.
5. Los conteos coinciden con consultas directas a PostgreSQL.
6. Todos los estados y prioridades aparecen aunque tengan cero.
7. El costo incluye solo solicitudes `Autorizada`.
8. El costo usa `cantidad × costo_unitario` y evita doble conteo.
9. El importe se devuelve con dos decimales.
10. `top_areas` contiene como máximo cinco elementos.
11. `recent_tickets` contiene como máximo cinco elementos.
12. Sede y área se respetan conjuntamente.
13. La respuesta no contiene modelos completos o datos sensibles.
14. El número de consultas no crece con el número de tickets.

## Definition of Done

1. **Dado que** el Subdirector Administrativo solicita estadísticas sin filtros o con filtros válidos, **cuando** la API procese la consulta, **entonces** devolverá todos los indicadores sobre un conjunto coherente de tickets.
2. **Dado que** existen catálogos sin tickets, **cuando** se generen distribuciones, **entonces** los estados y prioridades aparecerán con conteo cero y orden estable.
3. **Dado que** existen materiales autorizados, **cuando** se calcule el indicador económico, **entonces** el total coincidirá con la suma decimal de cantidades por costos unitarios sin duplicaciones.
4. **Dado que** un usuario sin permiso o un filtro inválido solicita el endpoint, **cuando** se valide la petición, **entonces** será rechazada sin ejecutar una consulta global innecesaria.

## Reglas de negocio

- Endpoint de solo lectura.
- Solo Subdirector Administrativo activo.
- Fechas filtran `tickets.fecha_reporte`.
- Solicitud autorizada usa el valor oficial `Autorizada`.
- No se almacenan totales.
- Estados y prioridades provienen de catálogos.
- No se devuelve ruta de archivos o información privada.
- Las consultas agregadas se ejecutan en base de datos.

## Definition of Ready

- HU01 está terminada.
- Existen datos de todos los estados y prioridades.
- Hay materiales con costos controlados.
- Hay más de cinco áreas para probar el límite.
- Se puede ejecutar análisis de consultas en un ambiente no productivo.

---

# HU03-E13-Visualizar Dashboard administrativo

## Descripción

**Como** Subdirector Administrativo,  
**quiero** visualizar y filtrar indicadores institucionales claros,  
**para** identificar rápidamente carga de trabajo, distribución y áreas con mayor incidencia.

## Prioridad

Alta.

## Responsable único

Fullstack Frontend/UX-UI.

## Alcance técnico

- Página existente a refactorizar:
  - `frontend/src/modules/dashboard/pages/DashboardPage.tsx`
- Componente administrativo nuevo:
  - `frontend/src/modules/dashboard/components/AdminDashboard.tsx`
- Componentes recomendados:
  - `frontend/src/modules/dashboard/components/DashboardFilters.tsx`
  - `frontend/src/modules/dashboard/components/SummaryCards.tsx`
  - `frontend/src/modules/dashboard/components/DistributionBars.tsx`
  - `frontend/src/modules/dashboard/components/TopAreasPanel.tsx`
  - `frontend/src/modules/dashboard/components/RecentTicketsPanel.tsx`
- Servicio nuevo:
  - `frontend/src/modules/dashboard/services/dashboardService.ts`
- Tipos nuevos:
  - `frontend/src/modules/dashboard/types/dashboard.ts`

No se instala una dependencia de gráficas. Las visualizaciones utilizan HTML, CSS y Tailwind.

## Impacto en el modelo de datos

No modifica el esquema. Consume HU02.

## Dependencias

- HU02-E13-Implementar API de estadísticas.
- Puede iniciar con mock aprobado en HU01.
- Catálogos de sedes y áreas disponibles.
- Dashboard básico actual identificado.

## Subtareas

1. **Separar Dashboard por rol** — Renderizar `AdminDashboard` para Subdirector y conservar la experiencia operativa de otros roles.
2. **Crear filtros administrativos** — Implementar fechas, sede y área dependiente, aplicar, limpiar y mantener estado coherente.
3. **Implementar tarjetas y distribuciones** — Mostrar resumen, barras por estado y prioridad con valor, porcentaje, etiquetas y colores accesibles.
4. **Implementar áreas y recientes** — Mostrar top cinco con sede y cinco tickets navegables al detalle autorizado.
5. **Resolver estados de consulta** — Manejar carga, cero resultados, error, reintento y evitar conservar cifras del filtro anterior.
6. **Eliminar cálculos administrativos locales** — Consumir directamente el DTO y no descargar todos los tickets para contar.

## Criterios de aceptación

1. Solo Subdirector Administrativo ve las estadísticas globales.
2. Los otros roles mantienen su Dashboard básico.
3. Las cinco tarjetas muestran valores devueltos por API.
4. El costo se etiqueta como estimado de materiales autorizados y usa formato MXN.
5. Estados y prioridades se renderizan dinámicamente.
6. Cada barra muestra etiqueta, conteo y porcentaje.
7. El color no es el único indicador.
8. Top de áreas contiene como máximo cinco y muestra sede.
9. Tickets recientes contiene como máximo cinco y navega al detalle.
10. Cambiar sede limpia áreas incompatibles.
11. Aplicar o limpiar filtros realiza una única consulta vigente.
12. Un filtro sin resultados muestra ceros y estado vacío.
13. Un error no conserva cifras como si fueran actuales.
14. La interfaz no calcula agregaciones sobre una lista de tickets.
15. El Dashboard funciona en móvil y escritorio.

## Definition of Done

1. **Dado que** un Subdirector Administrativo abre el Dashboard, **cuando** la API responda, **entonces** verá resumen, distribuciones, áreas y tickets recientes con datos institucionales.
2. **Dado que** modifica periodo, sede o área, **cuando** aplique el filtro, **entonces** todas las secciones se actualizarán conjuntamente y mostrarán el alcance aplicado.
3. **Dado que** no existen datos o la API falla, **cuando** concluya la solicitud, **entonces** la interfaz mostrará un estado explícito sin cifras engañosas.
4. **Dado que** otro rol abre su inicio, **cuando** se renderice el Dashboard, **entonces** conservará su resumen operativo y no solicitará estadísticas globales.

## Reglas de negocio

- Frontend no recalcula indicadores.
- Costo se muestra como estimación autorizada.
- Prioridades no se codifican por nombre.
- Área depende de sede si existe filtro de sede.
- Filtros se aplican mediante acción explícita.
- Las solicitudes anteriores se cancelan o ignoran si queda una más reciente.
- Las barras tienen texto y valor accesibles.
- No se incorpora tiempo real.

## Definition of Ready

- HU02 está disponible o existe mock aprobado.
- El DTO y valores cero están documentados.
- Existen datos para estados de carga, vacío y error.
- El diseño contempla móvil y escritorio.

---

# HU04-E13-Validar estadísticas y Dashboard

## Descripción

**Como** responsable de QA,  
**quiero** validar cálculos, filtros, permisos y presentación del Dashboard,  
**para** asegurar que los indicadores representen datos reales sin exponer información global a otros roles.

## Prioridad

Muy alta.

## Responsable único

QA.

## Alcance técnico

- Pruebas backend recomendadas:
  - `backend/tests/Feature/AdminDashboardTest.php`
  - `backend/tests/Unit/DashboardServiceTest.php`
- Evidencia funcional:
  - `docs/evidencias/epica-13/matriz-pruebas.md`
  - `docs/evidencias/epica-13/resultado-pruebas.md`
- Validaciones mínimas:
  - `cd backend && php artisan test`
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`

El frontend se valida manualmente porque actualmente no existe un framework de pruebas automatizadas.

## Impacto en el modelo de datos

Las pruebas consultan:

- `tickets`
- `estados_ticket`
- `prioridades_ticket`
- `areas`
- `sedes`
- `solicitudes_materiales`
- `materiales_ticket`

No modifican el esquema productivo.

## Dependencias

- HU02-E13-Implementar API de estadísticas.
- HU03-E13-Visualizar Dashboard administrativo.
- Datos controlados de E06-E12.
- Usuarios de los cuatro roles.

## Subtareas

1. **Preparar matriz y dataset calculable** — Crear tickets, estados, prioridades, áreas, fechas y materiales con resultados esperados manualmente.
2. **Automatizar API y cálculos** — Probar permisos, filtros, ceros, agrupaciones, límites, decimales y ausencia de doble conteo.
3. **Validar interfaz y accesibilidad** — Comprobar tarjetas, barras, porcentajes, filtros, navegación, estados y responsividad.
4. **Ejecutar rendimiento y regresión** — Revisar consultas, flujo de tickets, suite, lint, build, defectos y dictamen.

## Criterios de aceptación

1. Cada criterio de HU02 y HU03 tiene al menos un caso.
2. Solo Subdirector Administrativo activo accede al endpoint global.
3. Se validan conteos con datos conocidos y estados en cero.
4. Se prueban prioridades creadas o renombradas desde ÉPICA 12.
5. Se prueba cada filtro y sus combinaciones válidas.
6. Se rechazan fechas invertidas y área ajena a sede.
7. El costo coincide exactamente con el cálculo manual.
8. Solicitudes no autorizadas no se incluyen.
9. No existe doble conteo con varios materiales.
10. Top de áreas y recientes respetan el límite de cinco.
11. Se prueban base vacía y filtro sin resultados.
12. Otros roles no solicitan o visualizan estadísticas globales.
13. Las visualizaciones tienen etiquetas numéricas y navegación por teclado.
14. Las consultas no presentan crecimiento N+1.
15. Suite backend, lint y build concluyen correctamente.
16. No quedan defectos críticos o altos abiertos.

## Definition of Done

1. **Dado que** existe un dataset con resultados conocidos, **cuando** QA consulte el endpoint con y sin filtros, **entonces** cada conteo, agrupación y costo coincidirá con el cálculo esperado.
2. **Dado que** usuarios de distintos roles intentan acceder, **cuando** se evalúen API e interfaz, **entonces** únicamente el Subdirector Administrativo activo verá datos globales.
3. **Dado que** la API devuelve datos, ceros o errores, **cuando** se pruebe el Dashboard en móvil y escritorio, **entonces** cada estado será claro, accesible y coherente.
4. **Dado que** se ejecutan pruebas de rendimiento y regresión, **cuando** concluyan suite, lint y build, **entonces** no habrá consultas N+1 ni defectos críticos o altos abiertos.

## Reglas de negocio

- QA valida API, SQL resultante y frontend.
- El cálculo manual documentado es la referencia de costos.
- Las pruebas incluyen importes decimales.
- Cada defecto se relaciona con una HU y criterio.
- No se aprueba con defectos críticos o altos.
- Los datos de prueba se restauran.

## Definition of Ready

- HU02 y HU03 están integradas.
- Existe un dataset reproducible.
- Se puede inspeccionar el número y plan de consultas.
- QA conoce la definición de cada indicador.

---

## Definition of Done de la Épica

1. **Dado que** el Subdirector Administrativo abre el Dashboard, **cuando** la API consulte PostgreSQL, **entonces** mostrará indicadores y distribuciones calculados sin descargar todos los tickets.
2. **Dado que** se aplican filtros de fecha, sede o área, **cuando** se actualicen las estadísticas, **entonces** todas las secciones utilizarán exactamente el mismo conjunto de tickets.
3. **Dado que** existen materiales autorizados, **cuando** se muestre su costo estimado, **entonces** el valor corresponderá a la suma decimal de cantidades por costos unitarios y no se presentará como gasto real.
4. **Dado que** un rol distinto intenta acceder, **cuando** backend y frontend evalúen permisos, **entonces** no recibirá ni visualizará estadísticas institucionales.
5. **Dado que** backend y frontend están integrados, **cuando** QA ejecute cálculos, filtros, seguridad, rendimiento, lint y build, **entonces** no habrá defectos críticos o altos abiertos y quedará evidencia reproducible.

## Criterio de cierre

ÉPICA 13 se considera terminada cuando HU01 a HU04 cumplen su Definition of Done y el Dashboard administrativo presenta datos consolidados, filtrables y verificables desde PostgreSQL sin incorporar capacidades analíticas fuera del MVP.
