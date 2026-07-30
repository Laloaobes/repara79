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
            'validado_por' => $this->validado_por,
            'fecha_creacion' => $this->fecha_creacion?->toISOString(),
            'fecha_validacion' => $this->fecha_validacion?->toISOString(),
            'tecnico' => $this->whenLoaded('tecnico', fn () => [
                'id' => $this->tecnico?->id,
                'name' => $this->tecnico?->name,
            ]),
            'revisado_por' => $this->whenLoaded('revisadoPor', fn () => $this->revisadoPor
                ? [
                    'id' => $this->revisadoPor->id,
                    'name' => $this->revisadoPor->name,
                ]
                : null),
            'ticket' => $this->whenLoaded('ticket', fn () => [
                'id' => $this->ticket->id,
                'folio' => 'TK-'.str_pad((string) $this->ticket->id, 3, '0', STR_PAD_LEFT),
                'titulo' => $this->ticket->titulo,
                'descripcion_desperfecto' => $this->ticket->descripcion_desperfecto,
                'ubicacion' => $this->ticket->ubicacion,
                'fotografia_inicial_url' => $this->ticket->fotografia_inicial_url,
                'estado' => $this->ticket->relationLoaded('estado') && $this->ticket->estado
                    ? [
                        'id' => $this->ticket->estado->id,
                        'nombre' => $this->ticket->estado->nombre,
                    ]
                    : null,
                'area' => $this->ticket->relationLoaded('area') && $this->ticket->area
                    ? [
                        'id' => $this->ticket->area->id,
                        'nombre' => $this->ticket->area->nombre,
                        'ubicacion' => $this->ticket->area->ubicacion,
                        'sede' => $this->ticket->area->relationLoaded('sede') && $this->ticket->area->sede
                            ? [
                                'id' => $this->ticket->area->sede->id,
                                'nombre' => $this->ticket->area->sede->nombre,
                            ]
                            : null,
                    ]
                    : null,
                'usuario' => $this->ticket->relationLoaded('usuario') && $this->ticket->usuario
                    ? [
                        'id' => $this->ticket->usuario->id,
                        'name' => $this->ticket->usuario->name,
                        'email' => $this->ticket->usuario->email,
                    ]
                    : null,
            ]),
            'materiales' => MaterialTicketResource::collection($materiales),
            'costo_estimado' => DecimalMoney::formatCents($totalCents),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
