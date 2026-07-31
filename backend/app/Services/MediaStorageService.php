<?php

namespace App\Services;

use App\Models\Ticket;
use App\Support\StoragePath;
use App\Support\SupportedImageType;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class MediaStorageService
{
    public const IMAGE_DISK = 'public';

    public function storeTicketReference(Ticket $ticket, UploadedFile $file): string
    {
        $extension = SupportedImageType::extensionForMime($file->getMimeType());
        $path = StoragePath::ticketReference(
            $ticket->id,
            (string) Str::uuid(),
            $extension
        );

        $stored = Storage::disk(self::IMAGE_DISK)->putFileAs(
            dirname($path),
            $file,
            basename($path)
        );

        if ($stored !== $path || ! Storage::disk(self::IMAGE_DISK)->exists($path)) {
            Storage::disk(self::IMAGE_DISK)->delete($path);
            throw new RuntimeException('No fue posible almacenar la fotografía de referencia.');
        }

        return $path;
    }

    public function delete(?string $path): void
    {
        if ($path !== null && $path !== '') {
            Storage::disk(self::IMAGE_DISK)->delete($path);
        }
    }
}
