<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rol' => [
                'required',
                'string',
                Rule::in([
                    'Responsable del Lugar',
                    'Personal de Mantenimiento',
                    'Subdirector Administrativo',
                    'Usuario Registrado',
                ]),
            ],
            'area_ids' => [
                'exclude_unless:rol,Responsable del Lugar',
                'required_if:rol,Responsable del Lugar',
                'array',
                'min:1',
            ],
            'area_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('areas', 'id'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'area_ids.required_if' => 'Debes asignar al menos un área al Responsable del Lugar.',
            'area_ids.min' => 'Debes asignar al menos un área al Responsable del Lugar.',
            'area_ids.*.exists' => 'Una de las áreas seleccionadas ya no existe.',
        ];
    }
}
