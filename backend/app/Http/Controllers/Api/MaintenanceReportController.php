<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraReparacion;
use App\Models\Ticket;
use App\Services\ArchiveAccessService;
use App\Services\Reports\MaintenanceReportService;
use Illuminate\Support\Facades\Storage;

class MaintenanceReportController extends Controller
{
    public function __invoke(
        Ticket $ticket,
        ArchiveAccessService $access
    ) {
        $archive = BitacoraReparacion::query()
            ->with('ticket')
            ->where('ticket_id', $ticket->id)
            ->first();

        if (! $archive) {
            return response()->json([
                'success' => false,
                'message' => 'El reporte todavía no está disponible.',
            ], 409);
        }

        $access->ensureCanView(request()->user(), $archive);
        $disk = Storage::disk(MaintenanceReportService::DISK);

        if (! $disk->exists($archive->archivo_pdf)) {
            abort(404);
        }

        return response()->download(
            $disk->path($archive->archivo_pdf),
            "reporte-reparacion-ticket-{$ticket->id}.pdf",
            [
                'Cache-Control' => 'private, no-store',
                'Content-Type' => 'application/pdf',
                'X-Content-Type-Options' => 'nosniff',
            ],
            'inline'
        );
    }
}
