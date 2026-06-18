<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoUsuario extends Model
{
    protected $table = 'tipos_usuarios';

    protected $fillable = [
        'nombre'
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
