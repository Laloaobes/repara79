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
                    'Administrador',
                    'Usuario Registrado',
                ]),
            ],
        ];
    }
}
