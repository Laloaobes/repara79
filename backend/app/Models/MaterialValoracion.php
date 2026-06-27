<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialValoracion extends Model
{
    protected $fillable = ['valoracion_id', 'nombre', 'cantidad', 'precio_unitario', 'subtotal'];
    protected $casts = ['precio_unitario' => 'float', 'subtotal' => 'float'];

    public function valoracion(): BelongsTo
    {
        return $this->belongsTo(Valoracion::class);
    }
}
