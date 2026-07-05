<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreValoracionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ticket_id' => ['required', 'integer', 'exists:tickets,id'],
            'diagnostico' => ['required', 'string'],
            'tiempo_estimado_horas' => ['nullable', 'integer', 'min:1'],
            'observaciones' => ['nullable', 'string'],
        ];
    }
}
