<!DOCTYPE html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Reporte de reparación {{ $ticket->id }}</title>
    <style>
        @page { margin: 34px 42px; }
        body { color: #26352d; font-family: "DejaVu Sans", sans-serif; font-size: 10px; line-height: 1.45; }
        h1 { color: #163d2a; font-size: 20px; margin: 0 0 4px; }
        h2 { border-bottom: 1px solid #b7d8c5; color: #245c42; font-size: 13px; margin: 18px 0 8px; padding-bottom: 4px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #dbe7e0; padding: 6px; text-align: left; vertical-align: top; }
        th { background: #eef7f1; color: #163d2a; }
        .header { border-bottom: 3px solid #52b788; margin-bottom: 14px; padding-bottom: 10px; }
        .muted { color: #60746a; }
        .evidence { margin-bottom: 14px; page-break-inside: avoid; }
        .evidence img { border: 1px solid #dbe7e0; height: 210px; object-fit: contain; width: 100%; }
        .footer { color: #708078; font-size: 8px; margin-top: 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>REPARA-79 — Informe final de mantenimiento</h1>
        <div class="muted">CBTa 79 · Ticket TK-{{ str_pad((string) $ticket->id, 3, '0', STR_PAD_LEFT) }}</div>
        <div class="muted">Generado: {{ $generatedAt->timezone(config('app.timezone'))->format('d/m/Y H:i') }}</div>
    </div>

    <h2>Información general</h2>
    <table>
        <tr><th>Título</th><td>{{ $ticket->titulo }}</td><th>Estado</th><td>{{ $ticket->estado?->nombre }}</td></tr>
        <tr><th>Área</th><td>{{ $ticket->area?->nombre }}</td><th>Sede</th><td>{{ $ticket->area?->sede?->nombre }}</td></tr>
        <tr><th>Ubicación</th><td>{{ $ticket->ubicacion }}</td><th>Prioridad</th><td>{{ $ticket->prioridad?->nombre }}</td></tr>
        <tr><th>Reportante</th><td>{{ $ticket->usuario?->name }}</td><th>Tipo</th><td>{{ $ticket->tipoDesperfecto?->nombre }}</td></tr>
    </table>
    <p><strong>Descripción reportada:</strong> {{ $ticket->descripcion_desperfecto }}</p>

    <h2>Valoración técnica</h2>
    <p>{{ $valuation?->observaciones ?? 'Sin observaciones registradas.' }}</p>
    <table>
        <thead><tr><th>Material autorizado</th><th>Cantidad</th><th>Costo unitario</th><th>Subtotal</th></tr></thead>
        <tbody>
        @forelse($valuation?->materiales ?? [] as $material)
            <tr>
                <td>{{ $material['descripcion'] }}</td>
                <td>{{ $material['cantidad'] }}</td>
                <td>${{ $material['costo_unitario'] }}</td>
                <td>${{ $material['subtotal'] }}</td>
            </tr>
        @empty
            <tr><td colspan="4">Sin materiales registrados.</td></tr>
        @endforelse
        </tbody>
        <tfoot><tr><th colspan="3">Costo estimado autorizado</th><th>${{ $valuation?->costo_estimado ?? '0.00' }}</th></tr></tfoot>
    </table>

    <h2>Reparación realizada</h2>
    <p><strong>Estado inicial:</strong> {{ $repair->estado_inicial }}</p>
    <p><strong>Proceso:</strong> {{ $repair->proceso_reparacion }}</p>
    <p><strong>Resultado final:</strong> {{ $repair->estado_final }}</p>
    <p><strong>Responsable:</strong> {{ $repair->responsable?->name }}</p>

    <h2>Evidencias fotográficas</h2>
    @foreach(['inicial' => 'Inicial', 'durante' => 'Durante la reparación', 'final' => 'Final'] as $key => $label)
        <div class="evidence">
            <strong>{{ $label }}</strong>
            @if($evidences->has($key))
                <img src="{{ $evidences->get($key)['data_uri'] }}" alt="Evidencia {{ $label }}">
            @else
                <p>Sin evidencia.</p>
            @endif
        </div>
    @endforeach

    <div class="footer">Documento generado automáticamente por REPARA-79. No sustituye las políticas institucionales de resguardo.</div>
</body>
</html>
