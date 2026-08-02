<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StartRepairRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('estado_inicial')) {
            $this->merge(['estado_inicial' => trim((string) $this->input('estado_inicial'))]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado_inicial' => ['required', 'string', 'max:5000'],
        ];
    }
}
