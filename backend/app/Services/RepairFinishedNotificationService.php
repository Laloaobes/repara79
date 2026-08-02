<?php

namespace App\Services;

use App\Models\BitacoraReparacion;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RepairFinishedNotificationService
{
    public function notify(BitacoraReparacion $archive): void
    {
        $archive->loadMissing('ticket.area');
        $recipients = User::query()
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->where(function ($query) use ($archive): void {
                $query->whereHas('tipoUsuario', fn ($roleQuery) => $roleQuery
                    ->where('nombre', 'Subdirector Administrativo'))
                    ->orWhere(function ($responsibleQuery) use ($archive): void {
                        $responsibleQuery
                            ->whereHas('tipoUsuario', fn ($roleQuery) => $roleQuery
                                ->where('nombre', 'Responsable del Lugar'))
                            ->whereHas('areas', fn ($areaQuery) => $areaQuery
                                ->where('areas.id', $archive->ticket->area_id)
                                ->where('usuario_area.activo', true));
                    });
            })
            ->whereKeyNot($archive->generado_por)
            ->get()
            ->unique('id');

        $eventKey = "reparacion_finalizada:{$archive->id}";
        $now = now();

        foreach ($recipients as $recipient) {
            DB::table('notifications')->insertOrIgnore([
                'id' => $this->deterministicUuid("{$eventKey}:{$recipient->id}"),
                'type' => 'reparacion_finalizada',
                'notifiable_type' => User::class,
                'notifiable_id' => $recipient->id,
                'data' => json_encode([
                    'event_key' => $eventKey,
                    'type' => 'reparacion_finalizada',
                    'title' => 'Reparación finalizada',
                    'message' => "El ticket TK-{$archive->ticket_id} fue reparado y archivado.",
                    'ticket_id' => $archive->ticket_id,
                    'archive_id' => $archive->id,
                    'url' => '/archivero-reparaciones',
                ], JSON_THROW_ON_ERROR),
                'read_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    private function deterministicUuid(string $value): string
    {
        $hex = md5($value);

        return sprintf(
            '%s-%s-5%s-%s%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 13, 3),
            dechex((hexdec($hex[16]) & 0x3) | 0x8),
            substr($hex, 17, 3),
            substr($hex, 20, 12)
        );
    }
}
