<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreValoracionRequest extends FormRequest
{
    public const MAX_MATERIALES = 50;

    public const MAX_CANTIDAD = 1000000;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $materiales = collect($this->input('materiales', []))
            ->map(function ($material) {
                if (! is_array($material)) {
                    return $material;
                }

                if (array_key_exists('descripcion', $material) && is_string($material['descripcion'])) {
                    $material['descripcion'] = trim($material['descripcion']);
                }

                return $material;
            })
            ->all();

        $this->merge([
            'observaciones' => is_string($this->input('observaciones'))
                ? trim($this->input('observaciones'))
                : $this->input('observaciones'),
            'materiales' => $materiales,
        ]);
    }

    public function rules(): array
    {
        return [
            'ticket_id' => ['required', 'integer', 'exists:tickets,id'],
            'observaciones' => ['required', 'string', 'min:5', 'max:5000'],
            'materiales' => ['required', 'array', 'min:1', 'max:'.self::MAX_MATERIALES],
            'materiales.*' => ['required', 'array:descripcion,cantidad,costo_unitario'],
            'materiales.*.descripcion' => ['required', 'string', 'min:2', 'max:150'],
            'materiales.*.cantidad' => [
                'required',
                'integer',
                'min:1',
                'max:'.self::MAX_CANTIDAD,
            ],
            'materiales.*.costo_unitario' => [
                'required',
                'numeric',
                'decimal:0,2',
                'min:0',
                'max:99999999.99',
            ],
        ];
    }
}
