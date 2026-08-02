<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BitacoraReparacion extends Model
{
    protected $table = 'bitacoras_reparacion';

    protected $fillable = [
        'ticket_id',
        'reparacion_id',
        'titulo',
        'descripcion_final',
        'archivo_pdf',
        'generado_por',
        'fecha_generacion',
    ];

    protected $hidden = [
        'archivo_pdf',
    ];

    protected function casts(): array
    {
        return [
            'fecha_generacion' => 'datetime',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function reparacion(): BelongsTo
    {
        return $this->belongsTo(Reparacion::class);
    }

    public function generadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generado_por');
    }
}
