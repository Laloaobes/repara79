<?php

namespace App\Services;

use App\Models\BitacoraReparacion;
use App\Models\Reparacion;
use App\Services\Reports\MaintenanceReportService;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class RepairArchiveService
{
    public function create(
        Reparacion $repair,
        string $reportPath,
        CarbonInterface $generatedAt
    ): BitacoraReparacion {
        if (! Storage::disk(MaintenanceReportService::DISK)->exists($reportPath)) {
            throw new RuntimeException('No puede archivarse una reparación sin reporte.');
        }

        $repair->loadMissing('ticket');

        return BitacoraReparacion::query()->create([
            'ticket_id' => $repair->ticket_id,
            'reparacion_id' => $repair->id,
            'titulo' => "Ticket #{$repair->ticket_id} - {$repair->ticket->titulo}",
            'descripcion_final' => $repair->estado_final,
            'archivo_pdf' => $reportPath,
            'generado_por' => $repair->realizado_por,
            'fecha_generacion' => $generatedAt,
        ]);
    }
}
