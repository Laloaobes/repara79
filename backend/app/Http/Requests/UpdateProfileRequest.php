<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        foreach (['name', 'email', 'telefono', 'apellido_paterno', 'apellido_materno'] as $field) {
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
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'telefono' => ['nullable', 'string', 'regex:/^[0-9+()\-\s]{7,20}$/'],
            'apellido_paterno' => ['nullable', 'string', 'min:2', 'max:100'],
            'apellido_materno' => ['nullable', 'string', 'min:2', 'max:100'],
        ];
    }
}
