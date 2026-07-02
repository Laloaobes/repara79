<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PrioridadTicket extends Model
{
    protected $table = 'prioridades_ticket';

    protected $primaryKey = 'id_prioridad';

    protected $fillable = [
        'nombre',
        'color',
        'descripcion',
    ];

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'prioridad_id', 'id_prioridad');
    }
}
