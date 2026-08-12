<?php

namespace App\Services;

use App\Models\User;
use App\Models\Valoracion;

class ValoracionNotificationService
{
    public function __construct(
        private readonly UserNotificationService $notifications,
    ) {}

    public function notifyDecision(Valoracion $valoracion, bool $authorized): void
    {
        $recipient = User::query()
            ->whereKey($valoracion->valorado_por)
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->whereHas('tipoUsuario', fn ($query) => $query
                ->where('nombre', 'Personal de Mantenimiento'))
            ->get();
        $type = $authorized ? 'valoracion_autorizada' : 'valoracion_rechazada';
        $decision = $authorized ? 'autorizada' : 'rechazada';

        $this->notifications->send(
            $recipient,
            "{$type}:{$valoracion->id}:{$valoracion->veces_revisada}",
            [
                'type' => $type,
                'title' => $authorized
                    ? 'Valoración técnica autorizada'
                    : 'Valoración técnica rechazada',
                'message' => "Tu valoración del ticket TK-{$valoracion->ticket_id} fue {$decision}.",
                'ticket_id' => $valoracion->ticket_id,
                'valoracion_id' => $valoracion->id,
                'url' => '/mis-valoraciones',
            ]
        );
    }

    public function notifyResubmission(Valoracion $valoracion): void
    {
        $administrators = User::query()
            ->where('activo', true)
            ->whereNull('deleted_at')
            ->whereHas('tipoUsuario', fn ($query) => $query
                ->where('nombre', 'Subdirector Administrativo'))
            ->get();

        $this->notifications->send(
            $administrators,
            "valoracion_corregida:{$valoracion->id}:{$valoracion->veces_revisada}",
            [
                'type' => 'valoracion_corregida',
                'title' => 'Valoración técnica corregida',
                'message' => "La valoración del ticket TK-{$valoracion->ticket_id} fue corregida y reenviada.",
                'ticket_id' => $valoracion->ticket_id,
                'valoracion_id' => $valoracion->id,
                'url' => '/valoraciones-por-aprobar',
            ]
        );
    }
}
