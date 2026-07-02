<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoDesperfecto extends Model
{
    protected $table = 'tipos_desperfectos';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
