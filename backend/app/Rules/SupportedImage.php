<?php

namespace App\Rules;

use App\Support\SupportedImageType;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

class SupportedImage implements ValidationRule
{
    private const MAX_PIXELS = 20_000_000;

    private const MAX_SIDE = 6_000;

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $value instanceof UploadedFile || ! $value->isValid()) {
            $fail('La imagen no pudo cargarse correctamente.');

            return;
        }

        if (! SupportedImageType::isAllowedMime($value->getMimeType())) {
            $fail('La imagen debe ser JPG, PNG o WebP.');

            return;
        }

        $dimensions = @getimagesize($value->getPathname());

        if ($dimensions === false) {
            $fail('El archivo no contiene una imagen válida.');

            return;
        }

        [$width, $height] = $dimensions;

        if ($width > self::MAX_SIDE || $height > self::MAX_SIDE || $width * $height > self::MAX_PIXELS) {
            $fail('La imagen excede el límite permitido de dimensiones o resolución.');
        }
    }
}
