<?php

namespace App\Services;

use App\Models\EstadoTicket;
use App\Models\Reparacion;
use App\Models\Ticket;
use App\Models\User;
use App\Services\Reports\MaintenanceReportService;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class RepairService
{
    public function __construct(
        private readonly MediaStorageService $mediaStorage,
        private readonly MaintenanceReportService $reportService,
        private readonly RepairArchiveService $archiveService,
        private readonly RepairFinishedNotificationService $notificationService,
    ) {}

    public function tray(User $user, string $search = ''): array
    {
        $availableQuery = Ticket::query()
            ->with(['estado', 'area.sede', 'prioridad', 'valoracion.materialesTicket'])
            ->whereHas('estado', fn ($query) => $query->where('nombre', 'Autorizado'))
            ->whereDoesntHave('reparacion');

        $inProgressQuery = Reparacion::query()
            ->with(['ticket.estado', 'ticket.area.sede', 'ticket.prioridad', 'responsable', 'evidencias', 'bitacora'])
            ->where('realizado_por', $user->id)
            ->whereNull('fecha_reparacion');

        if ($search !== '') {
            $folioId = preg_match('/^(?:TK-)?0*(\d+)$/i', $search, $matches)
                ? (int) $matches[1]
                : null;

            $ticketSearch = function ($query) use ($search, $folioId): void {
                $query->where(function ($ticketQuery) use ($search, $folioId): void {
                    $ticketQuery->whereLike('titulo', "%{$search}%")
                        ->orWhereLike('descripcion_desperfecto', "%{$search}%")
                        ->orWhereLike('ubicacion', "%{$search}%");

                    if ($folioId !== null) {
                        $ticketQuery->orWhere($ticketQuery->getModel()->getQualifiedKeyName(), $folioId);
                    }
                });
            };

            $availableQuery->where($ticketSearch);
            $inProgressQuery->whereHas('ticket', $ticketSearch);
        }

        $available = $availableQuery
            ->orderBy('created_at')
            ->get();

        $inProgress = $inProgressQuery
            ->orderByDesc('fecha_inicio')
            ->get();

        return [
            'disponibles' => $available,
            'en_curso' => $inProgress,
        ];
    }

    public function start(Ticket $ticket, User $user, string $initialState): Reparacion
    {
        try {
            return DB::transaction(function () use ($ticket, $user, $initialState): Reparacion {
                $lockedTicket = Ticket::query()
                    ->with(['estado', 'valoracion'])
                    ->lockForUpdate()
                    ->findOrFail($ticket->id);

                if ($lockedTicket->estado?->nombre !== 'Autorizado'
                    || $lockedTicket->valoracion?->estado_general !== 'Autorizada') {
                    throw ValidationException::withMessages([
                        'ticket' => 'El ticket no cuenta con una valoración autorizada vigente.',
                    ]);
                }

                if (Reparacion::query()->where('ticket_id', $lockedTicket->id)->exists()) {
                    throw ValidationException::withMessages([
                        'ticket' => 'El ticket ya fue tomado para reparación.',
                    ]);
                }

                $inProgressState = $this->requiredState('En reparación');
                $repair = Reparacion::query()->create([
                    'ticket_id' => $lockedTicket->id,
                    'realizado_por' => $user->id,
                    'estado_inicial' => $initialState,
                    'fecha_inicio' => now(),
                ]);

                $lockedTicket->update(['estado_id' => $inProgressState->id]);

                return $repair->load([
                    'ticket.estado',
                    'ticket.area.sede',
                    'responsable',
                    'evidencias',
                    'bitacora',
                ]);
            }, 3);
        } catch (QueryException $exception) {
            throw ValidationException::withMessages([
                'ticket' => 'El ticket ya fue tomado para reparación.',
            ]);
        }
    }

    public function finish(Reparacion $repair, User $user, array $data): array
    {
        $evidencePaths = [];
        $reportPath = null;
        $committed = false;
        DB::beginTransaction();

        try {
            $lockedRepair = Reparacion::query()->lockForUpdate()->findOrFail($repair->id);

            if ($lockedRepair->realizado_por !== $user->id) {
                abort(404);
            }

            $ticket = Ticket::query()->with('estado')->lockForUpdate()->findOrFail($lockedRepair->ticket_id);

            if ($lockedRepair->fecha_reparacion !== null || $ticket->estado?->nombre !== 'En reparación') {
                throw ValidationException::withMessages([
                    'reparacion' => 'La reparación ya no se encuentra disponible para finalizar.',
                ]);
            }

            if ($lockedRepair->evidencias()->exists()) {
                throw ValidationException::withMessages([
                    'reparacion' => 'La reparación ya contiene evidencias registradas.',
                ]);
            }

            foreach (['inicial', 'durante', 'final'] as $stage) {
                /** @var UploadedFile $file */
                $file = $data["evidencia_{$stage}"];
                $path = $this->mediaStorage->storeRepairEvidence($ticket, $stage, $file);
                $evidencePaths[] = $path;
                $lockedRepair->evidencias()->create([
                    'imagen' => $path,
                    'tipo_evidencia' => $stage,
                ]);
            }

            $repairedState = $this->requiredState('Reparado');
            $lockedRepair->update([
                'proceso_reparacion' => $data['proceso_reparacion'],
                'estado_final' => $data['estado_final'],
                'fecha_reparacion' => now(),
            ]);
            $ticket->update(['estado_id' => $repairedState->id]);

            $report = $this->reportService->generate($lockedRepair->fresh());
            $reportPath = $report['path'];
            $archive = $this->archiveService->create(
                $lockedRepair->fresh(),
                $reportPath,
                $report['generated_at']
            );

            DB::commit();
            $committed = true;

            try {
                $this->notificationService->notify($archive);
            } catch (Throwable $notificationError) {
                Log::error('No fue posible persistir las notificaciones del cierre.', [
                    'archive_id' => $archive->id,
                    'error' => $notificationError->getMessage(),
                ]);
            }

            return [
                'repair' => $lockedRepair->fresh()->load([
                    'ticket.estado',
                    'ticket.area.sede',
                    'responsable',
                    'evidencias',
                    'bitacora',
                ]),
                'archive' => $archive,
            ];
        } catch (Throwable $exception) {
            if ($committed) {
                throw $exception;
            }

            DB::rollBack();

            foreach ($evidencePaths as $path) {
                $this->mediaStorage->delete($path);
            }

            $this->reportService->delete($reportPath);

            throw $exception;
        }
    }

    private function requiredState(string $name): EstadoTicket
    {
        $state = EstadoTicket::query()->where('nombre', $name)->first();

        if (! $state) {
            throw ValidationException::withMessages([
                'catalogo' => "No existe el estado requerido: {$name}.",
            ]);
        }

        return $state;
    }
}
