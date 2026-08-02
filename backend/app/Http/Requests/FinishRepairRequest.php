<?php

namespace App\Http\Requests;

use App\Rules\SupportedImage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class FinishRepairRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        foreach (['proceso_reparacion', 'estado_final'] as $field) {
            if ($this->has($field)) {
                $this->merge([$field => trim((string) $this->input($field))]);
            }
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $imageRules = [
            'required',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:5120',
            new SupportedImage,
        ];

        return [
            'proceso_reparacion' => ['required', 'string', 'max:10000'],
            'estado_final' => ['required', 'string', 'max:5000'],
            'evidencia_inicial' => $imageRules,
            'evidencia_durante' => $imageRules,
            'evidencia_final' => $imageRules,
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (function_exists('imagecreatefromwebp')) {
                    return;
                }

                foreach (['inicial', 'durante', 'final'] as $stage) {
                    $field = "evidencia_{$stage}";
                    $file = $this->file($field);

                    if ($file?->getMimeType() === 'image/webp') {
                        $validator->errors()->add(
                            $field,
                            'Este servidor no puede procesar WebP en el reporte; utiliza JPG o PNG.'
                        );
                    }
                }
            },
        ];
    }
}
