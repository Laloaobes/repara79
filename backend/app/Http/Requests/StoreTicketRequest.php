<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'area_id' => ['required', 'integer', 'exists:areas,id'],
            'tipo_desperfecto_id' => ['required', 'integer', 'exists:tipos_desperfectos,id'],
            'prioridad_id' => ['required', 'integer', 'exists:prioridades_ticket,id_prioridad'],
            'titulo' => ['required', 'string', 'max:150'],
            'descripcion_desperfecto' => ['required', 'string'],
            'ubicacion' => ['required', 'string'],
            'otro_desperfecto' => ['nullable', 'string', 'max:150'],
        ];
    }
}
