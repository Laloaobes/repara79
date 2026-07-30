<?php

namespace App\Services;

use App\Models\EstadoTicket;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Valoracion;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ValoracionAuthorizationService
{
    public function autorizar(Valoracion $valoracion, User $reviewer): Valoracion
    {
        return $this->decide($valoracion, $reviewer, true);
    }

    public function rechazar(Valoracion $valoracion, User $reviewer, string $reason): Valoracion
    {
        return $this->decide($valoracion, $reviewer, false, $reason);
    }

    private function decide(
        Valoracion $routeValoracion,
        User $reviewer,
        bool $authorize,
        ?string $reason = null
    ): Valoracion {
        return DB::transaction(function () use ($routeValoracion, $reviewer, $authorize, $reason) {
            $valoracion = Valoracion::query()
                ->whereKey($routeValoracion->id)
                ->lockForUpdate()
                ->firstOrFail();

            $ticket = Ticket::query()
                ->whereKey($valoracion->ticket_id)
                ->lockForUpdate()
                ->firstOrFail();

            $estadoValorado = $this->requiredState('Valorado');
            $targetTicketState = $this->requiredState($authorize ? 'Autorizado' : 'Rechazado');

            if (
                $valoracion->estado_general !== 'Pendiente de autorización'
                || $ticket->estado_id !== $estadoValorado->id
            ) {
                throw ValidationException::withMessages([
                    'valoracion' => 'La valoración ya fue procesada o sus estados no permiten esta decisión.',
                ]);
            }

            if ($authorize) {
                $hasValidMaterial = $valoracion->materialesTicket()
                    ->where('cantidad', '>=', 1)
                    ->where('costo_unitario', '>=', 0)
                    ->exists();
                $hasInvalidMaterial = $valoracion->materialesTicket()
                    ->where(function ($query) {
                        $query
                            ->where('cantidad', '<', 1)
                            ->orWhere('costo_unitario', '<', 0);
                    })
                    ->exists();

                if (! $hasValidMaterial || $hasInvalidMaterial) {
                    throw ValidationException::withMessages([
                        'materiales' => 'La valoración requiere al menos un material válido para autorizarse.',
                    ]);
                }
            }

            $valoracion->update([
                'estado_general' => $authorize ? 'Autorizada' : 'Rechazada',
                'motivo_rechazo' => $authorize ? null : $reason,
                'validado_por' => $reviewer->id,
                'fecha_validacion' => now(),
                'veces_revisada' => ((int) $valoracion->veces_revisada) + 1,
            ]);
            $ticket->update(['estado_id' => $targetTicketState->id]);

            return $valoracion->fresh([
                'tecnico',
                'revisadoPor',
                'ticket.estado',
                'ticket.area.sede',
                'ticket.usuario',
                'materialesTicket',
            ]);
        });
    }

    private function requiredState(string $name): EstadoTicket
    {
        $state = EstadoTicket::query()->where('nombre', $name)->first();

        if (! $state) {
            throw ValidationException::withMessages([
                'catalogo' => "El estado requerido {$name} no está configurado.",
            ]);
        }

        return $state;
    }
}
