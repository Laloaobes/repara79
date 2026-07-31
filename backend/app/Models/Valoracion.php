<?php

namespace App\Models;

use App\Support\DecimalMoney;
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
                'id' => $material->id,
                'descripcion' => $material->nombre_material,
                'cantidad' => (int) $material->cantidad,
                'costo_unitario' => DecimalMoney::format($material->costo_unitario),
                'subtotal' => DecimalMoney::formatCents(
                    DecimalMoney::multiplyToCents(
                        (int) $material->cantidad,
                        $material->costo_unitario
                    )
                ),
            ])
            ->values()
            ->all();
    }

    public function getCostoEstimadoAttribute(): string
    {
        $materiales = $this->relationLoaded('materialesTicket')
            ? $this->getRelation('materialesTicket')
            : $this->materialesTicket()->get();

        $totalCents = $materiales->sum(
            fn (MaterialTicket $material) => DecimalMoney::multiplyToCents(
                (int) $material->cantidad,
                $material->costo_unitario
            )
        );

        return DecimalMoney::formatCents($totalCents);
    }

    public function getEstadoAttribute(): string
    {
        return $this->estado_general ?? 'Pendiente de autorización';
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
