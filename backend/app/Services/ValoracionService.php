<?php

namespace App\Services;

use App\Models\EstadoTicket;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Valoracion;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ValoracionService
{
    public function create(User $user, array $data): Valoracion
    {
        try {
            return DB::transaction(function () use ($user, $data) {
                $estadoPendiente = $this->requiredState('Pendiente');
                $estadoValorado = $this->requiredState('Valorado');

                $ticket = Ticket::query()
                    ->whereKey($data['ticket_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($ticket->estado_id !== $estadoPendiente->id) {
                    throw ValidationException::withMessages([
                        'ticket_id' => 'Solo se puede valorar un ticket en estado Pendiente.',
                    ]);
                }

                if ($ticket->valoracion()->exists()) {
                    throw ValidationException::withMessages([
                        'ticket_id' => 'Este ticket ya tiene una valoración registrada.',
                    ]);
                }

                $valoracion = Valoracion::create([
                    'ticket_id' => $ticket->id,
                    'estado_general' => 'Pendiente de autorización',
                    'observaciones' => $data['observaciones'],
                    'valorado_por' => $user->id,
                    'fecha_creacion' => now(),
                ]);

                $valoracion->materialesTicket()->createMany(
                    collect($data['materiales'])->map(fn (array $material) => [
                        'nombre_material' => $material['descripcion'],
                        'cantidad' => $material['cantidad'],
                        'costo_unitario' => $material['costo_unitario'],
                    ])->all()
                );

                $ticket->update(['estado_id' => $estadoValorado->id]);

                return $valoracion->load(['tecnico', 'ticket.estado', 'materialesTicket']);
            });
        } catch (QueryException $exception) {
            if ($this->isUniqueViolation($exception)) {
                throw ValidationException::withMessages([
                    'ticket_id' => 'Este ticket ya tiene una valoración registrada.',
                ]);
            }

            throw $exception;
        }
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

    private function isUniqueViolation(QueryException $exception): bool
    {
        $sqlState = $exception->errorInfo[0] ?? (string) $exception->getCode();

        return in_array($sqlState, ['23000', '23505'], true);
    }
}
