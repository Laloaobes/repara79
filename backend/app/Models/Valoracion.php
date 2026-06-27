<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Valoracion extends Model
{
    protected $fillable = ['ticket_id', 'tecnico_id', 'tiempo_estimado', 'costo_total', 'observaciones'];
    protected $casts = ['costo_total' => 'float'];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function materiales(): HasMany
    {
        return $this->hasMany(MaterialValoracion::class);
    }
}
