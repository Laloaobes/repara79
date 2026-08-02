<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RepairArchiveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion_final' => $this->descripcion_final,
            'fecha_generacion' => $this->fecha_generacion?->toISOString(),
            'report_available' => true,
            'report_endpoint' => url("/api/tickets/{$this->ticket_id}/reporte-reparacion"),
            'generado_por' => $this->whenLoaded('generadoPor', fn () => [
                'id' => $this->generadoPor?->id,
                'name' => $this->generadoPor?->name,
            ]),
            'ticket' => $this->whenLoaded('ticket', fn () => [
                'id' => $this->ticket->id,
                'folio' => 'TK-'.str_pad((string) $this->ticket->id, 3, '0', STR_PAD_LEFT),
                'titulo' => $this->ticket->titulo,
                'ubicacion' => $this->ticket->ubicacion,
                'area' => $this->ticket->area?->nombre,
                'sede' => $this->ticket->area?->sede?->nombre,
            ]),
            'reparacion' => $this->whenLoaded('reparacion', fn () => [
                'id' => $this->reparacion->id,
                'estado_inicial' => $this->reparacion->estado_inicial,
                'proceso_reparacion' => $this->reparacion->proceso_reparacion,
                'estado_final' => $this->reparacion->estado_final,
                'fecha_inicio' => $this->reparacion->fecha_inicio?->toISOString(),
                'fecha_reparacion' => $this->reparacion->fecha_reparacion?->toISOString(),
                'evidencias' => $this->reparacion->relationLoaded('evidencias')
                    ? $this->reparacion->evidencias
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
                        ])
                    : [],
            ]),
        ];
    }
}
