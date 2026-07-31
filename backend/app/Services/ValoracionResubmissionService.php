<?php

namespace App\Services;

use App\Models\EstadoTicket;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Valoracion;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ValoracionResubmissionService
{
    public function reenviar(Valoracion $routeValoracion, User $author, array $data): Valoracion
    {
        return DB::transaction(function () use ($routeValoracion, $author, $data) {
            $valoracion = Valoracion::query()
                ->whereKey($routeValoracion->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($valoracion->valorado_por !== $author->id) {
                abort(404);
            }

            $ticket = Ticket::query()
                ->whereKey($valoracion->ticket_id)
                ->lockForUpdate()
                ->firstOrFail();

            $estadoRechazado = $this->requiredState('Rechazado');
            $estadoValorado = $this->requiredState('Valorado');

            if (
                $valoracion->estado_general !== 'Rechazada'
                || $ticket->estado_id !== $estadoRechazado->id
            ) {
                throw ValidationException::withMessages([
                    'valoracion' => 'Solo se puede corregir y reenviar una valoración rechazada.',
                ]);
            }

            $existingMaterials = $valoracion->materialesTicket()
                ->lockForUpdate()
                ->get()
                ->keyBy('id');
            $receivedIds = collect($data['materiales'])
                ->pluck('id')
                ->filter()
                ->map(fn ($id) => (int) $id);

            if ($receivedIds->diff($existingMaterials->keys())->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'materiales' => 'Uno o más materiales no pertenecen a esta valoración.',
                ]);
            }

            foreach ($data['materiales'] as $materialData) {
                $attributes = [
                    'nombre_material' => $materialData['descripcion'],
                    'cantidad' => $materialData['cantidad'],
                    'costo_unitario' => $materialData['costo_unitario'],
                ];

                if (isset($materialData['id'])) {
                    $existingMaterials->get((int) $materialData['id'])->update($attributes);
                } else {
                    $valoracion->materialesTicket()->create($attributes);
                }
            }

            $idsToDelete = $existingMaterials->keys()->diff($receivedIds);
            if ($idsToDelete->isNotEmpty()) {
                $valoracion->materialesTicket()->whereIn('id', $idsToDelete)->delete();
            }

            $valoracion->update([
                'observaciones' => $data['observaciones'],
                'estado_general' => 'Pendiente de autorización',
                'motivo_rechazo' => null,
                'validado_por' => null,
                'fecha_validacion' => null,
            ]);
            $ticket->update(['estado_id' => $estadoValorado->id]);

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
