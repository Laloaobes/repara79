<?php

namespace App\Support;

use InvalidArgumentException;

final class SupportedImageType
{
    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public static function extensionForMime(string $mime): string
    {
        return self::MIME_EXTENSIONS[$mime]
            ?? throw new InvalidArgumentException('Formato de imagen no permitido.');
    }

    public static function isAllowedMime(?string $mime): bool
    {
        return $mime !== null && array_key_exists($mime, self::MIME_EXTENSIONS);
    }
}
