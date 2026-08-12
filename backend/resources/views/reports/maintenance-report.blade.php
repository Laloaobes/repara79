<!DOCTYPE html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Informe {{ 'REPARA79-T'.$ticket->id }}</title>
    <style>
        @page { margin: 112px 38px 62px; }
        * { box-sizing: border-box; }
        body { color: #253a31; font-family: "DejaVu Sans", sans-serif; font-size: 9px; line-height: 1.4; }
        .page-header { border-bottom: 3px solid #52b788; height: 86px; left: 0; position: fixed; right: 0; top: -92px; }
        .brand-table, .info-table, .materials-table, .timeline-table { border-collapse: collapse; width: 100%; }
        .brand-table td { border: 0; padding: 0; vertical-align: middle; }
        .brand-mark { background: #163d2a; border-radius: 8px; color: #fff; font-size: 18px; font-weight: bold; height: 42px; line-height: 42px; text-align: center; width: 42px; }
        .brand-name { color: #163d2a; font-size: 18px; font-weight: bold; letter-spacing: .4px; }
        .brand-name span { color: #3e9667; }
        .institution { color: #64776d; font-size: 8px; letter-spacing: .6px; text-transform: uppercase; }
        .document-id { background: #edf7f1; border: 1px solid #b9dac7; border-radius: 5px; color: #1f6242; font-size: 9px; font-weight: bold; padding: 7px 9px; text-align: center; }
        .page-footer { border-top: 1px solid #cddbd3; bottom: -43px; color: #718078; font-size: 7.5px; left: 0; padding-top: 7px; position: fixed; right: 0; }
        .page-number:after { content: "Página " counter(page); }
        h1 { color: #163d2a; font-size: 17px; margin: 0 0 3px; }
        h2 { border-bottom: 1px solid #8fc6a8; color: #245c42; font-size: 11.5px; margin: 16px 0 7px; padding-bottom: 4px; page-break-after: avoid; }
        h3 { color: #245c42; font-size: 9.5px; margin: 9px 0 4px; }
        p { margin: 4px 0; }
        .intro { background: #f3f8f5; border-left: 4px solid #52b788; margin-bottom: 12px; padding: 9px 11px; }
        .muted { color: #6d7d75; }
        .info-table th, .info-table td, .timeline-table th, .timeline-table td { border: 1px solid #d8e3dd; padding: 6px; text-align: left; vertical-align: top; }
        .info-table th, .timeline-table th { background: #edf5f0; color: #214d38; font-size: 8px; width: 17%; }
        .materials-table th, .materials-table td { border: 1px solid #ceded5; padding: 6px; text-align: left; }
        .materials-table th { background: #214d38; color: #fff; font-size: 8px; }
        .materials-table .number { text-align: right; white-space: nowrap; }
        .materials-table tfoot th, .materials-table tfoot td { background: #edf5f0; color: #163d2a; font-weight: bold; }
        .text-block { background: #f7faf8; border: 1px solid #dbe6e0; border-radius: 4px; margin: 5px 0; padding: 7px; }
        .evidence { border: 1px solid #d3e0d9; margin: 0 0 12px; page-break-inside: avoid; }
        .evidence-title { background: #edf5f0; color: #214d38; font-size: 9px; font-weight: bold; padding: 6px 8px; }
        .evidence img { display: block; height: 265px; object-fit: contain; padding: 8px; width: 100%; }
        .signature-table { border-collapse: collapse; margin-top: 30px; width: 100%; }
        .signature-table td { border: 0; padding: 28px 24px 0; text-align: center; width: 50%; }
        .signature-line { border-top: 1px solid #74837b; padding-top: 5px; }
        .status { background: #dff3e7; border-radius: 9px; color: #21613e; display: inline-block; font-size: 8px; font-weight: bold; padding: 2px 7px; }
    </style>
</head>
<body>
    @php
        $reportId = 'REPARA79-T'.$ticket->id;
        $timezone = config('app.timezone');
        $formatDate = fn ($date) => $date ? $date->timezone($timezone)->format('d/m/Y H:i') : 'No registrado';
        $materials = $valuation?->materialesTicket ?? collect();
    @endphp

    <header class="page-header">
        <table class="brand-table">
            <tr>
                <td style="width: 50px"><div class="brand-mark">79</div></td>
                <td>
                    <div class="brand-name">REPARA<span>79</span></div>
                    <div class="institution">CBTA No. 79 · Gestión institucional de reparaciones</div>
                </td>
                <td style="width: 145px"><div class="document-id">{{ $reportId }}<br><span class="muted">Informe final</span></div></td>
            </tr>
        </table>
    </header>

    <footer class="page-footer">
        <table class="brand-table"><tr><td>{{ $reportId }} · Generado {{ $formatDate($generatedAt) }}</td><td style="text-align: right"><span class="page-number"></span></td></tr></table>
    </footer>

    <h1>Informe final de mantenimiento</h1>
    <p class="muted">Expediente documental del cierre de la reparación correspondiente al ticket TK-{{ str_pad((string) $ticket->id, 3, '0', STR_PAD_LEFT) }}.</p>

    <div class="intro"><strong>Estado del expediente:</strong> <span class="status">Reparación concluida</span><br>Este documento fue generado automáticamente a partir de la información confirmada en REPARA-79. Su consulta digital requiere una sesión autorizada.</div>

    <h2>1. Identificación del reporte</h2>
    <table class="info-table">
        <tr><th>Identificador</th><td>{{ $reportId }}</td><th>Folio del ticket</th><td>TK-{{ str_pad((string) $ticket->id, 3, '0', STR_PAD_LEFT) }}</td></tr>
        <tr><th>Fecha de generación</th><td>{{ $formatDate($generatedAt) }}</td><th>Estado</th><td>{{ $ticket->estado?->nombre ?? 'No registrado' }}</td></tr>
    </table>

    <h2>2. Información general</h2>
    <table class="info-table">
        <tr><th>Título</th><td colspan="3">{{ $ticket->titulo }}</td></tr>
        <tr><th>Sede</th><td>{{ $ticket->area?->sede?->nombre ?? 'No registrada' }}</td><th>Área</th><td>{{ $ticket->area?->nombre ?? 'No registrada' }}</td></tr>
        <tr><th>Ubicación</th><td>{{ $ticket->ubicacion }}</td><th>Prioridad</th><td>{{ $ticket->prioridad?->nombre ?? 'No registrada' }}</td></tr>
        <tr><th>Tipo</th><td>{{ $ticket->tipoDesperfecto?->nombre ?? 'No registrado' }}</td><th>Reportante</th><td>{{ $ticket->usuario?->name ?? 'No registrado' }}</td></tr>
        <tr><th>Fecha de reporte</th><td>{{ $formatDate($ticket->fecha_reporte) }}</td><th>Responsable técnico</th><td>{{ $repair->responsable?->name ?? 'No registrado' }}</td></tr>
    </table>
    <h3>Descripción del desperfecto</h3>
    <div class="text-block">{{ $ticket->descripcion_desperfecto }}</div>

    <h2>3. Valoración técnica y autorización</h2>
    <table class="info-table">
        <tr><th>Valorado por</th><td>{{ $valuation?->tecnico?->name ?? 'No registrado' }}</td><th>Fecha de valoración</th><td>{{ $formatDate($valuation?->fecha_creacion) }}</td></tr>
        <tr><th>Autorizado por</th><td>{{ $valuation?->revisadoPor?->name ?? 'No registrado' }}</td><th>Fecha de autorización</th><td>{{ $formatDate($valuation?->fecha_validacion) }}</td></tr>
    </table>
    <h3>Observaciones</h3>
    <div class="text-block">{{ $valuation?->observaciones ?? 'Sin observaciones registradas.' }}</div>

    <h3>Materiales autorizados</h3>
    <table class="materials-table">
        <thead><tr><th>Material</th><th>Código</th><th class="number">Cantidad</th><th class="number">Costo unitario</th><th class="number">Subtotal</th></tr></thead>
        <tbody>
        @forelse($materials as $material)
            @php $subtotal = (int) $material->cantidad * (float) $material->costo_unitario; @endphp
            <tr>
                <td>{{ $material->nombre_material }}</td>
                <td>{{ $material->codigo_material ?: 'No registrado' }}</td>
                <td class="number">{{ $material->cantidad }}</td>
                <td class="number">${{ number_format((float) $material->costo_unitario, 2) }} MXN</td>
                <td class="number">${{ number_format($subtotal, 2) }} MXN</td>
            </tr>
        @empty
            <tr><td colspan="5">Sin materiales registrados.</td></tr>
        @endforelse
        </tbody>
        <tfoot><tr><th colspan="4">Costo estimado autorizado</th><td class="number">${{ number_format((float) ($valuation?->costo_estimado ?? 0), 2) }} MXN</td></tr></tfoot>
    </table>

    <h2>4. Ejecución de la reparación</h2>
    <table class="timeline-table">
        <tr><th>Inicio</th><td>{{ $formatDate($repair->fecha_inicio) }}</td><th>Finalización</th><td>{{ $formatDate($repair->fecha_reparacion) }}</td></tr>
        <tr><th>Responsable</th><td colspan="3">{{ $repair->responsable?->name ?? 'No registrado' }}</td></tr>
    </table>
    <h3>Estado inicial confirmado</h3><div class="text-block">{{ $repair->estado_inicial }}</div>
    <h3>Proceso realizado</h3><div class="text-block">{{ $repair->proceso_reparacion }}</div>
    <h3>Resultado final</h3><div class="text-block">{{ $repair->estado_final }}</div>

    <h2>5. Evidencias fotográficas</h2>
    @foreach(['inicial' => 'Estado inicial', 'durante' => 'Durante la reparación', 'final' => 'Resultado final'] as $key => $label)
        <div class="evidence">
            <div class="evidence-title">{{ $label }}</div>
            @if($evidences->has($key))
                <img src="{{ $evidences->get($key)['data_uri'] }}" alt="{{ $label }}">
            @else
                <p style="padding: 8px">Sin evidencia registrada.</p>
            @endif
        </div>
    @endforeach

    <h2>6. Conformidad documental</h2>
    <p>Las firmas siguientes pueden utilizarse para dejar constancia de revisión institucional cuando el procedimiento interno del plantel lo requiera. El sistema no presume su firma automática.</p>
    <table class="signature-table"><tr><td><div class="signature-line">Personal de Mantenimiento<br><span class="muted">{{ $repair->responsable?->name ?? 'Nombre y firma' }}</span></div></td><td><div class="signature-line">Revisión administrativa<br><span class="muted">Nombre y firma</span></div></td></tr></table>
</body>
</html>
