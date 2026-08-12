<?php

namespace App\Services;

use App\Events\UserNotificationCreated;
use App\Models\BitacoraReparacion;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Throwable;

class RepairFinishedNotificationService
{
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
        $now = now();

        foreach ($recipients as $recipient) {
            $notificationId = $this->deterministicUuid("{$eventKey}:{$recipient->id}");
            $data = [
                'event_key' => $eventKey,
                'type' => 'reparacion_finalizada',
                'title' => 'Reparación finalizada',
                'message' => "El ticket TK-{$archive->ticket_id} fue reparado y archivado.",
                'ticket_id' => $archive->ticket_id,
                'archive_id' => $archive->id,
                'url' => "/archivero-reparaciones/{$archive->id}",
            ];

            $inserted = DB::table('notifications')->insertOrIgnore([
                'id' => $notificationId,
                'type' => 'reparacion_finalizada',
                'notifiable_type' => User::class,
                'notifiable_id' => $recipient->id,
                'data' => json_encode($data, JSON_THROW_ON_ERROR),
                'read_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            if ($inserted === 1) {
                try {
                    UserNotificationCreated::dispatch($recipient->id, [
                        'id' => $notificationId,
                        ...$data,
                        'read_at' => null,
                        'created_at' => $now->toISOString(),
                    ]);
                } catch (Throwable $broadcastError) {
                    Log::warning('La notificación persistió, pero Reverb no pudo transmitirla.', [
                        'notification_id' => $notificationId,
                        'user_id' => $recipient->id,
                        'error' => $broadcastError->getMessage(),
                    ]);
                }
            }
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
