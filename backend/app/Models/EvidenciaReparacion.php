<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvidenciaReparacion extends Model
{
    protected $table = 'evidencias_reparacion';

    protected $fillable = [
        'reparacion_id',
        'imagen',
        'descripcion',
        'tipo_evidencia',
    ];

    protected $appends = [
        'imagen_url',
    ];

    protected $hidden = [
        'imagen',
    ];

    public function reparacion(): BelongsTo
    {
        return $this->belongsTo(Reparacion::class);
    }

    public function getImagenUrlAttribute(): string
    {
        return url('/storage/'.$this->imagen);
    }
}
