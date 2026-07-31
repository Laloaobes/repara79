<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexValoracionesPendientesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:150'],
            'area_id' => ['sometimes', 'integer', 'exists:areas,id'],
            'sort' => [
                'sometimes',
                'string',
                Rule::in(['fecha_desc', 'fecha_asc', 'costo_desc', 'costo_asc']),
            ],
        ];
    }
}
