<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Valoracion extends Model
{
    protected $table = 'valoraciones';

    protected $fillable = [
        'ticket_id',
        'tecnico_id',
        'diagnostico',
        'materiales',
        'costo_estimado',
        'tiempo_estimado_horas',
        'estado',
        'observaciones',
        'motivo_rechazo',
        'revisado_por_id',
        'revisado_at',
    ];

    protected function casts(): array
    {
        return [
            'materiales' => 'array',
            'costo_estimado' => 'decimal:2',
            'revisado_at' => 'datetime',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function revisadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revisado_por_id');
    }
}
