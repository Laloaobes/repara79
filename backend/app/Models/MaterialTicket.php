<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialTicket extends Model
{
    protected $table = 'materiales_ticket';

    protected $fillable = [
        'solicitud_id',
        'nombre_material',
        'codigo_material',
        'cantidad',
        'costo_unitario',
        'estado_individual',
        'motivo_rechazo',
        'inventario_ref',
    ];

    protected function casts(): array
    {
        return [
            'costo_unitario' => 'decimal:2',
        ];
    }

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(Valoracion::class, 'solicitud_id');
    }
}
