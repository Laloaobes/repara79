<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexPendingValuationTicketsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => [
                'sometimes',
                'string',
                Rule::in([
                    'Pendiente',
                    'Valorado',
                    'Autorizado',
                    'En reparación',
                    'Rechazado',
                    'Reparado',
                ]),
            ],
            'search' => ['sometimes', 'string', 'max:150'],
            'area_id' => ['sometimes', 'integer', 'exists:areas,id'],
            'sort' => ['sometimes', 'string', Rule::in(['fecha_desc', 'fecha_asc'])],
        ];
    }
}
