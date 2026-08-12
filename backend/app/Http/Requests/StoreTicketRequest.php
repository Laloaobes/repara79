<?php

namespace App\Http\Requests;

use App\Rules\SupportedImage;
use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        foreach (['titulo', 'descripcion_desperfecto', 'ubicacion', 'otro_desperfecto'] as $field) {
            if (is_string($this->input($field))) {
                $this->merge([$field => trim($this->input($field))]);
            }
        }
    }

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
            'titulo' => ['required', 'string', 'min:3', 'max:150'],
            'descripcion_desperfecto' => ['required', 'string', 'min:5', 'max:5000'],
            'ubicacion' => ['required', 'string', 'min:3', 'max:255'],
            'otro_desperfecto' => ['nullable', 'string', 'min:3', 'max:150'],
            'fotografia_referencia' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
                new SupportedImage,
            ],
        ];
    }
}
