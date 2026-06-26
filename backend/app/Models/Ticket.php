<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Ticket extends Model
{
    protected $fillable = [
        'folio', 'zona_id', 'creado_por', 'asignado_a',
        'categoria', 'ubicacion_exacta', 'descripcion',
        'prioridad', 'estado', 'motivo_rechazo',
    ];

    public function zona(): BelongsTo
    {
        return $this->belongsTo(Zona::class);
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'asignado_a');
    }

    public function evidencias(): HasMany
    {
        return $this->hasMany(Evidencia::class);
    }

    public function valoracion(): HasOne
    {
        return $this->hasOne(Valoracion::class);
    }

    public function historial(): HasMany
    {
        return $this->hasMany(HistorialEstado::class);
    }

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket) {
            $ultimo = static::max('id') ?? 0;
            $ticket->folio = 'TK-' . str_pad($ultimo + 1, 4, '0', STR_PAD_LEFT);
        });
    }
}
