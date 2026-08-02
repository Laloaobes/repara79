<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RepairResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_id' => $this->ticket_id,
            'realizado_por' => $this->realizado_por,
            'estado_inicial' => $this->estado_inicial,
            'proceso_reparacion' => $this->proceso_reparacion,
            'estado_final' => $this->estado_final,
            'fecha_inicio' => $this->fecha_inicio?->toISOString(),
            'fecha_reparacion' => $this->fecha_reparacion?->toISOString(),
            'ticket' => $this->whenLoaded('ticket', fn () => [
                'id' => $this->ticket->id,
                'folio' => 'TK-'.str_pad((string) $this->ticket->id, 3, '0', STR_PAD_LEFT),
                'titulo' => $this->ticket->titulo,
                'descripcion_desperfecto' => $this->ticket->descripcion_desperfecto,
                'ubicacion' => $this->ticket->ubicacion,
                'estado' => $this->ticket->estado?->nombre,
                'area' => $this->ticket->area?->nombre,
            ]),
            'responsable' => $this->whenLoaded('responsable', fn () => [
                'id' => $this->responsable?->id,
                'name' => $this->responsable?->name,
            ]),
            'evidencias' => $this->whenLoaded('evidencias', fn () => $this->evidencias
                ->sortBy(fn ($evidence) => array_search(
                    $evidence->tipo_evidencia,
                    ['inicial', 'durante', 'final'],
                    true
                ))
                ->values()
                ->map(fn ($evidence) => [
                    'id' => $evidence->id,
                    'tipo' => $evidence->tipo_evidencia,
                    'imagen_url' => $evidence->imagen_url,
                ])),
            'archived' => $this->relationLoaded('bitacora') && $this->bitacora !== null,
            'archive_id' => $this->when(
                $this->relationLoaded('bitacora') && $this->bitacora !== null,
                fn () => $this->bitacora->id
            ),
            'report_available' => $this->relationLoaded('bitacora') && $this->bitacora !== null,
            'report_endpoint' => $this->when(
                $this->relationLoaded('bitacora') && $this->bitacora !== null,
                fn () => url("/api/tickets/{$this->ticket_id}/reporte-reparacion")
            ),
        ];
    }
}
