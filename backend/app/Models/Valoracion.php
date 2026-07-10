<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Valoracion extends Model
{
    protected $table = 'solicitudes_materiales';

    protected $fillable = [
        'ticket_id',
        'estado_general',
        'observaciones',
        'motivo_rechazo',
        'veces_revisada',
        'valorado_por',
        'validado_por',
        'fecha_creacion',
        'fecha_validacion',
    ];

    protected $appends = [
        'materiales',
        'costo_estimado',
        'estado',
        'tecnico_id',
        'revisado_por_id',
        'revisado_at',
    ];

    protected function casts(): array
    {
        return [
            'fecha_creacion' => 'datetime',
            'fecha_validacion' => 'datetime',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valorado_por');
    }

    public function revisadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validado_por');
    }

    public function materialesTicket(): HasMany
    {
        return $this->hasMany(MaterialTicket::class, 'solicitud_id');
    }

    public function getMaterialesAttribute(): array
    {
        $materiales = $this->relationLoaded('materialesTicket')
            ? $this->getRelation('materialesTicket')
            : $this->materialesTicket()->orderBy('id')->get();

        return $materiales
            ->map(fn (MaterialTicket $material) => [
                'descripcion' => $material->nombre_material,
                'costo' => (float) $material->costo_unitario,
            ])
            ->values()
            ->all();
    }

    public function getCostoEstimadoAttribute(): float
    {
        $materiales = $this->relationLoaded('materialesTicket')
            ? $this->getRelation('materialesTicket')
            : $this->materialesTicket()->get();

        return (float) $materiales->sum(
            fn (MaterialTicket $material) => $material->cantidad * (float) $material->costo_unitario
        );
    }

    public function getEstadoAttribute(): string
    {
        return $this->estado_general ?? 'Pendiente';
    }

    public function getTecnicoIdAttribute(): ?int
    {
        return $this->valorado_por;
    }

    public function getRevisadoPorIdAttribute(): ?int
    {
        return $this->validado_por;
    }

    public function getRevisadoAtAttribute(): mixed
    {
        return $this->fecha_validacion;
    }
}
