<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstadoTicket extends Model
{
    protected $table = 'estados_ticket';

    protected $fillable = [
        'nombre',
        'descripcion',
        'orden',
    ];

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'estado_id');
    }
}
