<?php

namespace App\Services;

use App\Events\UserNotificationCreated;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class UserNotificationService
{
    /**
     * @param  iterable<User>  $recipients
     * @param  array<string, mixed>  $data
     */
    public function send(iterable $recipients, string $eventKey, array $data): void
    {
        $now = now();

        foreach (collect($recipients)->unique('id') as $recipient) {
            $notificationId = $this->deterministicUuid("{$eventKey}:{$recipient->id}");
            $payload = [
                'event_key' => $eventKey,
                ...$data,
            ];

            $inserted = DB::table('notifications')->insertOrIgnore([
                'id' => $notificationId,
                'type' => $payload['type'],
                'notifiable_type' => User::class,
                'notifiable_id' => $recipient->id,
                'data' => json_encode($payload, JSON_THROW_ON_ERROR),
                'read_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            if ($inserted !== 1) {
                continue;
            }

            try {
                UserNotificationCreated::dispatch($recipient->id, [
                    'id' => $notificationId,
                    ...$payload,
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
