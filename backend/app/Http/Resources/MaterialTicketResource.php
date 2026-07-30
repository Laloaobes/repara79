<?php

namespace App\Http\Resources;

use App\Support\DecimalMoney;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialTicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'descripcion' => $this->nombre_material,
            'cantidad' => (int) $this->cantidad,
            'costo_unitario' => DecimalMoney::format($this->costo_unitario),
            'subtotal' => DecimalMoney::formatCents(
                DecimalMoney::multiplyToCents((int) $this->cantidad, $this->costo_unitario)
            ),
        ];
    }
}
