<?php

namespace App\Http\Resources;

use App\Support\DecimalMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ValoracionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $materiales = $this->materialesTicket;
        $totalCents = $materiales->sum(
            fn ($material) => DecimalMoney::multiplyToCents(
                (int) $material->cantidad,
                $material->costo_unitario
            )
        );

        return [
            'id' => $this->id,
            'ticket_id' => $this->ticket_id,
            'estado' => $this->estado_general,
            'observaciones' => $this->observaciones,
            'motivo_rechazo' => $this->motivo_rechazo,
            'veces_revisada' => (int) $this->veces_revisada,
            'valorado_por' => $this->valorado_por,
            'fecha_creacion' => $this->fecha_creacion?->toISOString(),
            'tecnico' => $this->whenLoaded('tecnico', fn () => [
                'id' => $this->tecnico?->id,
                'name' => $this->tecnico?->name,
            ]),
            'ticket' => $this->whenLoaded('ticket', fn () => [
                'id' => $this->ticket->id,
                'titulo' => $this->ticket->titulo,
                'estado' => $this->ticket->relationLoaded('estado') && $this->ticket->estado
                    ? [
                        'id' => $this->ticket->estado->id,
                        'nombre' => $this->ticket->estado->nombre,
                    ]
                    : null,
            ]),
            'materiales' => MaterialTicketResource::collection($materiales),
            'costo_estimado' => DecimalMoney::formatCents($totalCents),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
