<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Ticket extends Model
{
    protected $appends = [
        'fotografia_inicial_url',
    ];

    protected $fillable = [
        'usuario_id',
        'area_id',
        'tipo_desperfecto_id',
        'estado_id',
        'prioridad_id',
        'otro_desperfecto',
        'titulo',
        'descripcion_desperfecto',
        'ubicacion',
        'fotografia_inicial',
        'fecha_reporte',
    ];

    protected function casts(): array
    {
        return [
            'fecha_reporte' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function tipoDesperfecto(): BelongsTo
    {
        return $this->belongsTo(TipoDesperfecto::class);
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(EstadoTicket::class, 'estado_id');
    }

    public function prioridad(): BelongsTo
    {
        return $this->belongsTo(PrioridadTicket::class, 'prioridad_id', 'id_prioridad');
    }

    public function valoracion(): HasOne
    {
        return $this->hasOne(Valoracion::class);
    }

    public function getFotografiaInicialUrlAttribute(): ?string
    {
        if (!$this->fotografia_inicial) {
            return null;
        }

        if (str_starts_with($this->fotografia_inicial, 'http://') || str_starts_with($this->fotografia_inicial, 'https://')) {
            return $this->fotografia_inicial;
        }

        return url('/storage/'.$this->fotografia_inicial);
    }
}
