<?php

namespace App\Support;

use InvalidArgumentException;

final class StoragePath
{
    private const IMAGE_EXTENSIONS = ['jpg', 'png', 'webp'];

    public static function profileAvatar(string $profileUuid): string
    {
        return "perfiles/{$profileUuid}/avatar.webp";
    }

    public static function ticketReference(int $ticketId, string $fileUuid, string $extension): string
    {
        return sprintf(
            'evidencias/ticket-%d/referencia/%s.%s',
            $ticketId,
            $fileUuid,
            self::normalizeImageExtension($extension)
        );
    }

    public static function repairEvidence(
        int $ticketId,
        string $stage,
        string $fileUuid,
        string $extension
    ): string {
        if (! in_array($stage, ['inicial', 'durante', 'final'], true)) {
            throw new InvalidArgumentException('Etapa de evidencia no permitida.');
        }

        return sprintf(
            'evidencias/ticket-%d/%s/%s.%s',
            $ticketId,
            $stage,
            $fileUuid,
            self::normalizeImageExtension($extension)
        );
    }

    public static function repairReport(int $ticketId): string
    {
        return "reportes/ticket-{$ticketId}/reporte-reparacion-ticket-{$ticketId}.pdf";
    }

    public static function normalizeImageExtension(string $extension): string
    {
        $normalized = strtolower($extension) === 'jpeg' ? 'jpg' : strtolower($extension);

        if (! in_array($normalized, self::IMAGE_EXTENSIONS, true)) {
            throw new InvalidArgumentException('Formato de imagen no permitido.');
        }

        return $normalized;
    }
}
