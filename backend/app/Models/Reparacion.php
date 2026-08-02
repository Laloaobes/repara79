<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reparacion extends Model
{
    protected $table = 'reparaciones';

    protected $fillable = [
        'ticket_id',
        'realizado_por',
        'estado_inicial',
        'proceso_reparacion',
        'estado_final',
        'fecha_inicio',
        'fecha_reparacion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'datetime',
            'fecha_reparacion' => 'datetime',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function responsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'realizado_por');
    }

    public function evidencias(): HasMany
    {
        return $this->hasMany(EvidenciaReparacion::class);
    }

    public function bitacora(): HasOne
    {
        return $this->hasOne(BitacoraReparacion::class);
    }
}
