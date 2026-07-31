<?php

namespace App\Console\Commands;

use App\Models\Ticket;
use App\Services\MediaStorageService;
use App\Support\StoragePath;
use App\Support\SupportedImageType;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class MigrateLegacyTicketReferences extends Command
{
    protected $signature = 'storage:migrate-ticket-references {--dry-run : Mostrar cambios sin modificar archivos ni base de datos}';

    protected $description = 'Mueve fotografías históricas de tickets a la estructura de referencias protegidas';

    public function handle(): int
    {
        $disk = Storage::disk(MediaStorageService::IMAGE_DISK);
        $migrated = 0;
        $skipped = 0;
        $failed = 0;

        Ticket::query()
            ->whereNotNull('fotografia_referencia')
            ->orderBy('id')
            ->each(function (Ticket $ticket) use ($disk, &$migrated, &$skipped, &$failed): void {
                $source = $ticket->fotografia_referencia;
                $expectedPrefix = "evidencias/ticket-{$ticket->id}/referencia/";

                if (str_starts_with($source, $expectedPrefix)) {
                    $skipped++;

                    return;
                }

                if (str_starts_with($source, 'http://') || str_starts_with($source, 'https://')) {
                    $this->error("Ticket {$ticket->id}: la ruta remota no puede migrarse automáticamente.");
                    $failed++;

                    return;
                }

                if (! $disk->exists($source)) {
                    $this->error("Ticket {$ticket->id}: no existe {$source}.");
                    $failed++;

                    return;
                }

                try {
                    $extension = SupportedImageType::extensionForMime((string) $disk->mimeType($source));
                    $target = StoragePath::ticketReference(
                        $ticket->id,
                        (string) Str::uuid(),
                        $extension
                    );

                    if ($this->option('dry-run')) {
                        $this->line("Ticket {$ticket->id}: {$source} -> {$target}");
                        $migrated++;

                        return;
                    }

                    if (! $disk->copy($source, $target) || ! $disk->exists($target)) {
                        throw new \RuntimeException('No fue posible copiar el archivo.');
                    }

                    if ($disk->size($source) !== $disk->size($target)) {
                        $disk->delete($target);
                        throw new \RuntimeException('La copia no coincide con el archivo original.');
                    }

                    try {
                        $ticket->update(['fotografia_referencia' => $target]);
                    } catch (Throwable $exception) {
                        $disk->delete($target);
                        throw $exception;
                    }

                    if (! $disk->delete($source)) {
                        $this->warn("Ticket {$ticket->id}: migrado, pero no se pudo retirar el archivo anterior.");
                    }

                    $migrated++;
                } catch (Throwable $exception) {
                    $this->error("Ticket {$ticket->id}: {$exception->getMessage()}");
                    $failed++;
                }
            });

        $this->info("Migradas: {$migrated}; omitidas: {$skipped}; fallidas: {$failed}.");

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }
}
