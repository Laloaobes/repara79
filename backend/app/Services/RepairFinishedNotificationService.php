<?php

namespace App\Services;

use App\Models\BitacoraReparacion;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class RepairFinishedNotificationService
{
    public function __construct(
        private readonly UserNotificationService $notifications,
    ) {}

    public function notify(BitacoraReparacion $archive): void
    {
        $archive->loadMissing('ticket.area');
        $administrators = User::query()
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->whereHas('tipoUsuario', fn ($roleQuery) => $roleQuery
                ->where('nombre', 'Subdirector Administrativo'))
            ->whereKeyNot($archive->generado_por)
            ->get();

        $responsibles = collect();

        if (Schema::hasTable('usuario_area')) {
            $responsibles = User::query()
                ->where('activo', true)
                ->whereNull('deleted_at')
                ->whereHas('tipoUsuario', fn ($roleQuery) => $roleQuery
                    ->where('nombre', 'Responsable del Lugar'))
                ->whereHas('areas', fn ($areaQuery) => $areaQuery
                    ->where('areas.id', $archive->ticket->area_id)
                    ->where('usuario_area.activo', true))
                ->whereKeyNot($archive->generado_por)
                ->get();
        } else {
            Log::error('No existe usuario_area; se notificará a administración sin responsables de área.');
        }

        $recipients = $administrators
            ->concat($responsibles)
            ->unique('id');

        $eventKey = "reparacion_finalizada:{$archive->id}";
        $this->notifications->send($recipients, $eventKey, [
            'type' => 'reparacion_finalizada',
            'title' => 'Reparación finalizada',
            'message' => "El ticket TK-{$archive->ticket_id} fue reparado y archivado.",
            'ticket_id' => $archive->ticket_id,
            'archive_id' => $archive->id,
            'url' => "/archivero-reparaciones/{$archive->id}",
        ]);
    }
}
