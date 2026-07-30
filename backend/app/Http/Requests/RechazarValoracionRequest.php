<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RechazarValoracionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'motivo_rechazo' => ['required', 'string', 'max:500'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'motivo_rechazo' => is_string($this->input('motivo_rechazo'))
                ? trim($this->input('motivo_rechazo'))
                : $this->input('motivo_rechazo'),
        ]);
    }
}
