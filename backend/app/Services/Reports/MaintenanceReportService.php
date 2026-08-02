<?php

namespace App\Services\Reports;

use App\Models\Reparacion;
use App\Support\StoragePath;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class MaintenanceReportService
{
    public const DISK = 'protected_reports';

    public function generate(Reparacion $repair): array
    {
        $repair->loadMissing([
            'responsable',
            'evidencias',
            'ticket.estado',
            'ticket.prioridad',
            'ticket.tipoDesperfecto',
            'ticket.usuario',
            'ticket.area.sede',
            'ticket.valoracion.materialesTicket',
            'ticket.valoracion.tecnico',
            'ticket.valoracion.revisadoPor',
        ]);

        $path = StoragePath::repairReport($repair->ticket_id);
        $generatedAt = CarbonImmutable::now();
        $evidences = $repair->evidencias
            ->keyBy('tipo_evidencia')
            ->map(fn ($evidence) => [
                'tipo' => $evidence->tipo_evidencia,
                'data_uri' => $this->evidenceDataUri($evidence->imagen),
            ]);

        $output = Pdf::loadView('reports.maintenance-report', [
            'repair' => $repair,
            'ticket' => $repair->ticket,
            'valuation' => $repair->ticket->valoracion,
            'evidences' => $evidences,
            'generatedAt' => $generatedAt,
        ])
            ->setPaper('letter')
            ->setOption([
                'defaultFont' => 'DejaVu Sans',
                'isRemoteEnabled' => false,
                'isPhpEnabled' => false,
                'isJavascriptEnabled' => false,
            ])
            ->output();

        if (! str_starts_with($output, '%PDF-')) {
            throw new RuntimeException('El motor no generó un documento PDF válido.');
        }

        $disk = Storage::disk(self::DISK);

        if (! $disk->put($path, $output) || ! $disk->exists($path) || $disk->size($path) === 0) {
            $disk->delete($path);
            throw new RuntimeException('No fue posible almacenar el reporte de reparación.');
        }

        return [
            'path' => $path,
            'generated_at' => $generatedAt,
        ];
    }

    public function delete(?string $path): void
    {
        if ($path) {
            Storage::disk(self::DISK)->delete($path);
        }
    }

    private function evidenceDataUri(string $path): string
    {
        $disk = Storage::disk('public');

        if (! $disk->exists($path)) {
            throw new RuntimeException("No existe la evidencia requerida: {$path}");
        }

        $mime = $disk->mimeType($path);

        if (! in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            throw new RuntimeException('Una evidencia tiene un formato no permitido.');
        }

        return "data:{$mime};base64,".base64_encode($disk->get($path));
    }
}
