import React, { useState } from 'react';

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<'solicitante' | 'subdirector' | 'mantenimiento'>('solicitante');

  // List of materials added dynamically (just state for demo interactions when testing the HTML form skeleton)
  const [materials, setMaterials] = useState<Array<{ name: string; code: string; qty: number; cost: number }>>([
    { name: 'Teflón para tuberías de alta presión 3/4"', code: 'TEF-GAS-01', qty: 1, cost: 22.00 },
    { name: 'Manguera flexible tramada para gas 1.5m', code: 'MAG-FLEX-03', qty: 1, cost: 180.00 }
  ]);

  const [newMaterial, setNewMaterial] = useState({ name: '', code: '', qty: 1, cost: 0 });

  const handleAddMaterial = () => {
    if (newMaterial.name && newMaterial.code) {
      setMaterials([...materials, {
        name: newMaterial.name,
        code: newMaterial.code,
        qty: Number(newMaterial.qty),
        cost: Number(newMaterial.cost)
      }]);
      setNewMaterial({ name: '', code: '', qty: 1, cost: 0 });
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
      {/* 
        SPA SIDEBAR NAVIGATION 
        Estructura típica de SPA: un panel lateral para cambiar entre los diferentes roles/secciones del sistema.
      */}
      <nav aria-label="Navegación del Sistema REPARA - 79" style={{ width: '280px', borderRight: '1px solid #ccc', padding: '20px', backgroundColor: '#fcfcfc' }}>
        <header>
          <h2>REPARA - 79</h2>
          <p><small>Sistema de Gestión de Tickets de Mantenimiento</small></p>
        </header>

        <hr />

        <div>
          <h3>Roles del Sistema</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <button
                type="button"
                aria-current={activeTab === 'solicitante' ? 'page' : undefined}
                onClick={() => setActiveTab('solicitante')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px',
                  fontWeight: activeTab === 'solicitante' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >
                1. Dashboard del Solicitante
              </button>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <button
                type="button"
                aria-current={activeTab === 'subdirector' ? 'page' : undefined}
                onClick={() => setActiveTab('subdirector')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px',
                  fontWeight: activeTab === 'subdirector' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >
                2. Panel del Subdirector Administrativo
              </button>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <button
                type="button"
                aria-current={activeTab === 'mantenimiento' ? 'page' : undefined}
                onClick={() => setActiveTab('mantenimiento')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px',
                  fontWeight: activeTab === 'mantenimiento' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >
                3. Panel de Mantenimiento
              </button>
            </li>
          </ul>
        </div>

        <hr style={{ marginTop: '30px' }} />

        <footer>
          <p><small>© 2026 REPARA - 79. Dirección de Administración y Servicios.</small></p>
        </footer>
      </nav>

      {/* 
        MAIN CONTENT AREA
        Donde se renderiza dinámicamente cada sección según el rol seleccionado.
      */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* ==================================================================== */}
        {/* 1. DASHBOARD DEL SOLICITANTE                                         */}
        {/* ==================================================================== */}
        {activeTab === 'solicitante' && (
          <section aria-labelledby="solicitante-title">
            <header>
              <h1 id="solicitante-title">Dashboard del Solicitante</h1>
              <p>Espacio para usuarios registrados: reporte fallas, desperfectos y consulte el estado de sus solicitudes de servicio.</p>
            </header>

            <hr style={{ margin: '20px 0' }} />

            {/* Formulario para Reportar un Desperfecto */}
            <article aria-labelledby="form-report-title" style={{ marginBottom: '40px', border: '1px solid #ddd', padding: '20px' }}>
              <h2 id="form-report-title">Reportar Nuevo Desperfecto en la Unidad</h2>
              <p><small>Por favor, llene detalladamente los campos descritos a continuación para iniciar la orden de servicio.</small></p>

              <form onSubmit={(e) => { e.preventDefault(); alert('Reporte enviado ficticiamente (Estructura Base).'); }}>
                <div>
                  <p>
                    <label htmlFor="area-select"><strong>Área o Departamento:</strong></label><br />
                    <select id="area-select" name="area" required defaultValue="">
                      <option value="" disabled>-- Seleccione un área del plantel o edificio --</option>
                      <option value="sistemas">Sistemas / Cómputo</option>
                      <option value="recursos_humanos">Recursos Humanos / Oficinas</option>
                      <option value="aulas">Aulas / Salones de Clase</option>
                      <option value="laboratorios">Laboratorios de Ciencias</option>
                      <option value="biblioteca">Biblioteca Central</option>
                      <option value="exterior">Jardines y Fachada Exterior</option>
                      <option value="servicios_generales">Baños y Sanitarios Públicos</option>
                    </select>
                  </p>
                </div>

                <div>
                  <p>
                    <label htmlFor="desperfecto-type"><strong>Tipo de desperfecto:</strong></label><br />
                    <input 
                      type="text" 
                      id="desperfecto-type" 
                      name="type" 
                      placeholder="Ej. Fuga de agua, Cristal roto, Foco fundido, Cerradura atascada" 
                      style={{ width: '100%', maxWidth: '500px' }}
                      required 
                    />
                  </p>
                </div>

                <div>
                  <p>
                    <label htmlFor="location"><strong>Ubicación exacta dentro del área:</strong></label><br />
                    <input 
                      type="text" 
                      id="location" 
                      name="location" 
                      placeholder="Ej. Aula 102, segunda hilera de bancos, junto a la ventana izquierda" 
                      style={{ width: '100%', maxWidth: '500px' }}
                      required 
                    />
                  </p>
                </div>

                <div>
                  <p>
                    <label htmlFor="description"><strong>Descripción detallada de la problemática:</strong></label><br />
                    <textarea 
                      id="description" 
                      name="description" 
                      rows={5} 
                      placeholder="Escriba a detalle todos los síntomas o aspectos observados con el desperfecto..."
                      style={{ width: '100%', maxWidth: '500px' }}
                      required 
                    />
                  </p>
                </div>

                <div>
                  <p>
                    <label htmlFor="initial-photo"><strong>Fotografía inicial de evidencia (Carga de archivo):</strong></label><br />
                    <input 
                      type="file" 
                      id="initial-photo" 
                      name="photo" 
                      accept="image/*" 
                      aria-describedby="photo-instructions"
                      required 
                    />
                    <br />
                    <small id="photo-instructions">Suba una imagen legible en formato PNG o JPG donde se visualice claramente el problema físico reportado.</small>
                  </p>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Enviar Reporte de Desperfecto
                  </button>
                </div>
              </form>
            </article>

            {/* Lista/Tabla Simple con Historial de Tickets Reportados */}
            <section aria-labelledby="history-table-title" style={{ border: '1px solid #ddd', padding: '20px' }}>
              <h2 id="history-table-title">Historial de Mis Tickets Reportados</h2>
              <p>Consulte a continuación el historial de mantenimiento de su sector asignado y su estatus en tiempo real.</p>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <caption>Relación de solicitudes presentadas en el ciclo administrativo actual</caption>
                <thead>
                  <tr style={{ borderBottom: '2px solid #555', textAlign: 'left' }}>
                    <th scope="col" style={{ padding: '10px' }}>Folio</th>
                    <th scope="col" style={{ padding: '10px' }}>Fecha</th>
                    <th scope="col" style={{ padding: '10px' }}>Tipo de Desperfecto</th>
                    <th scope="col" style={{ padding: '10px' }}>Ubicación</th>
                    <th scope="col" style={{ padding: '10px' }}>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>#REP-7901</td>
                    <td style={{ padding: '10px' }}>12/06/2026</td>
                    <td>Fuga de gas en cocina escolar</td>
                    <td>Cafetería Central (Cocina 1)</td>
                    <td>
                      <span aria-label="Estatus: En Inspección"><strong>En Inspección por Mantenimiento</strong></span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>#REP-7902</td>
                    <td style={{ padding: '10px' }}>08/06/2026</td>
                    <td>Contacto de corriente roto</td>
                    <td>Aula de Computo C (Muro Norte)</td>
                    <td>
                      <span aria-label="Estatus: Material Autorizado"><strong>Material Autorizado (Presupuestado)</strong></span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>#REP-7903</td>
                    <td style={{ padding: '10px' }}>04/06/2026</td>
                    <td>Foco fundido en pasillo exterior</td>
                    <td>Pasillo B (Sección Alumnos)</td>
                    <td>
                      <span aria-label="Estatus: Resuelto"><strong>Reparación Completada y Cerrada</strong></span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </section>
        )}

        {/* ==================================================================== */}
        {/* 2. PANEL DEL SUBDIRECTOR ADMINISTRATIVO                              */}
        {/* ==================================================================== */}
        {activeTab === 'subdirector' && (
          <section aria-labelledby="subdirector-title">
            <header>
              <h1 id="subdirector-title">Panel del Subdirector Administrativo</h1>
              <p>Módulo de validación estratégica: autorice o rechace las solicitudes entrantes y apruebe las requisiciones de insumos cotizados por los técnicos.</p>
            </header>

            <hr style={{ margin: '20px 0' }} />

            {/* Revisión de Tickets Entrantes (Autorizar / Rechazar con Motivo) */}
            <section aria-labelledby="revision-tickets-title" style={{ marginBottom: '40px' }}>
              <h2 id="revision-tickets-title">Revisión y Aprobación de Tickets Entrantes</h2>
              <p>Revise la lista de reportes de desperfectos iniciales para aprobar o declinar su ejecución física.</p>

              {/* Fila de ticket de ejemplo a autorizar */}
              <article aria-labelledby="item-title-revisar" style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px' }}>
                <header>
                  <h3 id="item-title-revisar">Folio: #REP-7901 - Fuga de gas LP</h3>
                  <p><small>Ubicado en: Cafetería Central • Reportado por: Ismael Montalvo • Fecha: 12/06/2026</small></p>
                </header>

                <div>
                  <p><strong>Ubicación Exacta:</strong> Cocina de cafetería central, línea de manguera de alimentación de la estufa 1.</p>
                  <p><strong>Descripción:</strong> Se percibe fuerte aroma a gas licuado de petróleo por las mañanas. El personal de cafetería tiene miedo de encender la estufa.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); alert('Decisión sobre ticket guardada ficticiamente.'); }}>
                  <fieldset style={{ border: '1px solid #ccc', padding: '15px', marginTop: '15px' }}>
                    <legend><strong>Evaluación de Viabilidad Administrativa:</strong></legend>
                    
                    <p style={{ marginTop: '5px' }}>
                      <label htmlFor="reasons-textarea"><strong>En caso de RECHAZAR, especifique el motivo detallado de rechazo:</strong></label><br />
                      <textarea
                        id="reasons-textarea"
                        name="rejection_reason"
                        rows={3}
                        placeholder="Ej. Se coordina directamente con garantía de la estufa / No procede por mantenimiento externo ya contratado..."
                        style={{ width: '100%', maxWidth: '600px' }}
                      />
                    </p>

                    <div style={{ gap: '10px', display: 'flex' }}>
                      <button 
                        type="submit" 
                        onClick={() => alert('Ticket Autorizado con éxito (Estructura Base).')} 
                        style={{ padding: '8px 15px', backgroundColor: '#eef', cursor: 'pointer' }}
                      >
                        Autorizar Ejecución del Ticket #REP-7901
                      </button>
                      <button 
                        type="submit" 
                        onClick={() => alert('Ticket Rechazado con éxito (Estructura Base).')} 
                        style={{ padding: '8px 15px', backgroundColor: '#fee', cursor: 'pointer' }}
                      >
                        Rechazar Solicitud
                      </button>
                    </div>
                  </fieldset>
                </form>
              </article>
            </section>

            {/* Aprobar / Rechazar Lista de Materiales y Costos Estimados por Técnico */}
            <section aria-labelledby="materials-approval-title" style={{ border: '1px solid #ddd', padding: '20px' }}>
              <h2 id="materials-approval-title">Dictamen de Lista de Materiales y Presupuestos Requeridos</h2>
              <p>Tome determinaciones con respecto a las cotizaciones enviadas por el técnico asignado tras su visita de inspección física.</p>

              {/* Item de presupuesto de materiales */}
              <article aria-labelledby="material-budget-title" style={{ marginTop: '20px', border: '1px dotted #777', padding: '15px' }}>
                <header>
                  <h3 id="material-budget-title">Presupuesto Propuesto para: Ticket #REP-7902 - Contacto de corriente roto</h3>
                  <p><small>Técnico Evaluador: Tec. Manuel Ortiz • Costeo registrado el: 14/06/2026</small></p>
                </header>

                {/* Tabla de desglose de materiales */}
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                  <caption>Materiales requeridos para corrección dieléctrica en Aula C</caption>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #555', textAlign: 'left' }}>
                      <th scope="col" style={{ padding: '8px' }}>Nombre de Material / Diagnóstico</th>
                      <th scope="col" style={{ padding: '8px' }}>Código Técnico</th>
                      <th scope="col" style={{ padding: '8px' }}>Cantidad</th>
                      <th scope="col" style={{ padding: '8px' }}>Costo Unidad ($)</th>
                      <th scope="col" style={{ padding: '8px' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px' }}>Contacto doble Leviton con placa blanca plástica</td>
                      <td style={{ padding: '8px' }}><code>CONT-002</code></td>
                      <td style={{ padding: '8px' }}>2 unidades</td>
                      <td style={{ padding: '8px' }}>$45.00</td>
                      <td style={{ padding: '8px' }}>$90.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px' }}>Cable conductor calibre 12 cobre (10 metros)</td>
                      <td style={{ padding: '8px' }}><code>CAB-C12</code></td>
                      <td style={{ padding: '8px' }}>1 unidad</td>
                      <td style={{ padding: '8px' }}>$125.00</td>
                      <td style={{ padding: '8px' }}>$125.00</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px' }}>Cinta aislante aisladora 3M Super 33 negra</td>
                      <td style={{ padding: '8px' }}><code>CINT-3M</code></td>
                      <td style={{ padding: '8px' }}>1 pza</td>
                      <td style={{ padding: '8px' }}>$35.00</td>
                      <td style={{ padding: '8px' }}>$35.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #333' }}>
                      <th scope="row" colSpan={4} style={{ textAlign: 'right', padding: '8px' }}>Costo Total Estimado Evaluado:</th>
                      <td style={{ padding: '8px' }}><strong>$250.00</strong></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Acciones de aprobación del presupuesto */}
                <form onSubmit={(e) => { e.preventDefault(); alert('Estatus de la lista de egreso modificado ficticiamente.'); }}>
                  <fieldset style={{ padding: '15px' }}>
                    <legend><strong>Veredicto de Presupuesto Técnico:</strong></legend>
                    <p>
                      <label htmlFor="budget-justification"><strong>Notas / Comentarios sobre la decisión presupuestal:</strong></label><br />
                      <input 
                        type="text" 
                        id="budget-justification" 
                        placeholder="Ej. Aprobado para compra inmediata / Costos excedidos, se solicita cotizar con marca genérica." 
                        style={{ width: '100%', maxWidth: '600px' }} 
                      />
                    </p>
                    <div style={{ gap: '10px', display: 'flex' }}>
                      <button 
                        type="submit" 
                        onClick={() => alert('Lista de materiales APROBADA con éxito.')}
                        style={{ padding: '8px 15px', cursor: 'pointer' }}
                      >
                        Aprobar Lista de Materiales e Iniciar Suministro
                      </button>
                      <button 
                        type="submit" 
                        onClick={() => alert('Lista de materiales RECHAZADA.')}
                        style={{ padding: '8px 15px', cursor: 'pointer' }}
                      >
                        Rechazar Lista de Materiales e Insumos
                      </button>
                    </div>
                  </fieldset>
                </form>
              </article>
            </section>
          </section>
        )}

        {/* ==================================================================== */}
        {/* 3. PANEL DEL PERSONAL DE MANTENIMIENTO                              */}
        {/* ==================================================================== */}
        {activeTab === 'mantenimiento' && (
          <section aria-labelledby="mantenimiento-title">
            <header>
              <h1 id="mantenimiento-title">Panel del Personal de Mantenimiento</h1>
              <p>Módulo técnico: Gestione los registros de inspección inicial, asocie las requisiciones de materiales al almacén, y documente con rigor el cierre con evidencia visual.</p>
            </header>

            <hr style={{ margin: '20px 0' }} />

            {/* Inspección y Requisición de Materiales Requeridos */}
            <section aria-labelledby="inspection-materials-title" style={{ marginBottom: '40px', border: '1px solid #ddd', padding: '20px' }}>
              <h2 id="inspection-materials-title">1. Registro de Inspección y Requisición de Materiales</h2>
              <p>Llene este formulario detallado tras finalizar la inspección inicial para requerir la materia prima al subdirector.</p>

              <div>
                <p><strong>Inspección para Ticket:</strong> #REP-7901 - Fuga de gas LP</p>
                <p><strong>Ubicación:</strong> Cocina de cafetería escolar</p>
              </div>

              {/* Formulario Dinámico o Detallado de Materiales Requeridos */}
              <fieldset style={{ width: '100%', border: '1px solid #ccc', padding: '15px' }}>
                <legend><strong>Insumos Registrados para Materiales Requeridos:</strong></legend>
                
                {materials.length === 0 ? (
                  <p>No se han añadido materiales. Agregue un insumo para comenzar.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <caption>Insumos anexados preliminarmente para la cotización de este ticket</caption>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #999', textAlign: 'left' }}>
                        <th scope="col" style={{ padding: '8px' }}>Nombre Insumo</th>
                        <th scope="col" style={{ padding: '8px' }}>Código Identificador</th>
                        <th scope="col" style={{ padding: '8px' }}>Cantidad</th>
                        <th scope="col" style={{ padding: '8px' }}>Costo Estimado Unitario</th>
                        <th scope="col" style={{ padding: '8px' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((mat, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px' }}>{mat.name}</td>
                          <td style={{ padding: '8px' }}><code>{mat.code}</code></td>
                          <td style={{ padding: '8px' }}>{mat.qty} pzas</td>
                          <td style={{ padding: '8px' }}>${mat.cost.toFixed(2)}</td>
                          <td style={{ padding: '8px' }}>
                            <button type="button" onClick={() => handleRemoveMaterial(index)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Formulario interno para añadir items a la lista de consumo */}
                <fieldset style={{ padding: '12px' }}>
                  <legend>Identificación de Nuevo Insumo:</legend>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <label htmlFor="insumo-name"><strong>Nombre del insumo / Material:</strong></label><br />
                      <input 
                        type="text" 
                        id="insumo-name" 
                        value={newMaterial.name} 
                        onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                        placeholder="Ej. Teflón en cinta, Llave de paso 3/4..." 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="insumo-code"><strong>Código del catálogo / Inventario:</strong></label><br />
                      <input 
                        type="text" 
                        id="insumo-code" 
                        value={newMaterial.code}
                        onChange={(e) => setNewMaterial({ ...newMaterial, code: e.target.value })}
                        placeholder="Ej. TEF-GAS-01" 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="insumo-qty"><strong>Cantidad requerida:</strong></label><br />
                      <input 
                        type="number" 
                        id="insumo-qty" 
                        min="1"
                        value={newMaterial.qty}
                        onChange={(e) => setNewMaterial({ ...newMaterial, qty: Number(e.target.value) })}
                        placeholder="Ej. 2" 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="insumo-cost"><strong>Costo unitario estimado ($):</strong></label><br />
                      <input 
                        type="number" 
                        id="insumo-cost" 
                        min="0"
                        step="0.01"
                        value={newMaterial.cost}
                        onChange={(e) => setNewMaterial({ ...newMaterial, cost: Number(e.target.value) })}
                        placeholder="Ej. 22.50" 
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <button type="button" onClick={handleAddMaterial} style={{ padding: '6px 12px', cursor: 'pointer' }}>
                    Añadir Item a la Solicitud
                  </button>
                </fieldset>

                <div style={{ marginTop: '20px' }}>
                  <button 
                    type="button" 
                    onClick={() => alert('Lista de materiales enviados para la aprobación del Subdirector.')} 
                    style={{ padding: '10px 20px', cursor: 'pointer' }}
                  >
                    Enviar Requisición de Materiales Completa
                  </button>
                </div>
              </fieldset>
            </section>

            {/* Formulario de Ejecución de la Reparación (Con Tres Inputs de Carga Especializada) */}
            <section aria-labelledby="execution-materials-title" style={{ border: '1px solid #ddd', padding: '20px' }}>
              <h2 id="execution-materials-title">2. Formulario de Cierre y Ejecución de Obra Física</h2>
              <p>Complete estos campos únicamente tras culminar los labores mecánicos. Es obligatorio anexar evidencia del progreso.</p>

              <form onSubmit={(e) => { e.preventDefault(); alert('Reparación cerrada con registro de evidencias (Estructura Base).'); }}>
                <fieldset style={{ border: '1px dashed #777', padding: '20px' }}>
                  <legend><strong>Carga Obligatoria de Archivos de Evidencia:</strong></legend>

                  <p>Asocie capturas tomadas durante el transcurso de su jornada operativa:</p>

                  {/* Input 1: ANTES */}
                  <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="photo-before"><strong>1. Fotografía: "Antes" (Estado inicial del desperfecto):</strong></label><br />
                    <input 
                      type="file" 
                      id="photo-before" 
                      name="photoBefore" 
                      accept="image/*" 
                      aria-describedby="before-help"
                      required 
                    />
                    <br />
                    <small id="before-help">Evidencia visual que represente las condiciones previas a la reparación.</small>
                  </div>

                  {/* Input 2: DURANTE */}
                  <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="photo-during"><strong>2. Fotografía: "Durante" (Proceso técnico/desarmado):</strong></label><br />
                    <input 
                      type="file" 
                      id="photo-during" 
                      name="photoDuring" 
                      accept="image/*" 
                      aria-describedby="during-help"
                      required 
                    />
                    <br />
                    <small id="during-help">Evidencia visual que represente la mano de obra, cambio de partes o proceso activo.</small>
                  </div>

                  {/* Input 3: DESPUÉS */}
                  <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="photo-after"><strong>3. Fotografía: "Después" (Finalización total del servicio):</strong></label><br />
                    <input 
                      type="file" 
                      id="photo-after" 
                      name="photoAfter" 
                      accept="image/*" 
                      aria-describedby="after-help"
                      required 
                    />
                    <br />
                    <small id="after-help">Evidencia visual que represente el sector totalmente corregido o reinstalado.</small>
                  </div>
                </fieldset>

                <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                  <label htmlFor="technical-notes"><strong>Notas Técnicas de Entrega (Bitácora de campo):</strong></label><br />
                  <textarea 
                    id="technical-notes" 
                    name="execution_notes" 
                    rows={4} 
                    placeholder="Escriba los pormenores del servicio técnico realizado. Ejemplo: Se sustituyó manguera agrietada de 1.5 metros, se aplicó cinta teflón a alta presión, se realizó prueba de hermeticidad con agua jabonosa resultando libre de fugas..." 
                    style={{ width: '100%' }}
                    required 
                  />
                </div>

                <div>
                  <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Registrar Evidencias de Ejecución y Cerrar Ticket de Servicio
                  </button>
                </div>
              </form>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}
