<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexRepairArchivesRequest;
use App\Http\Resources\RepairArchiveResource;
use App\Models\BitacoraReparacion;
use App\Services\ArchiveAccessService;

class RepairArchiveController extends Controller
{
    public function index(IndexRepairArchivesRequest $request)
    {
        $user = $request->user();

        if (! $user->hasRole(
            'Subdirector Administrativo',
            'Personal de Mantenimiento',
            'Responsable del Lugar'
        )) {
            abort(403);
        }

        $query = BitacoraReparacion::query()->with([
            'generadoPor',
            'ticket.area.sede',
            'reparacion.evidencias',
        ]);

        if ($user->hasRole('Personal de Mantenimiento')) {
            $query->where('generado_por', $user->id);
        } elseif ($user->hasRole('Responsable del Lugar')) {
            $areaIds = $user->areas()->wherePivot('activo', true)->pluck('areas.id');
            $query->whereHas('ticket', fn ($ticketQuery) => $ticketQuery
                ->whereIn('area_id', $areaIds));
        }

        $search = trim((string) $request->validated('search', ''));

        if ($search !== '') {
            $folioId = preg_match('/^(?:TK-)?0*(\d+)$/i', $search, $matches)
                ? (int) $matches[1]
                : null;

            $query->where(function ($archiveQuery) use ($search, $folioId): void {
                $archiveQuery->whereLike('titulo', "%{$search}%")
                    ->orWhereHas('ticket', fn ($ticketQuery) => $ticketQuery
                        ->whereLike('titulo', "%{$search}%")
                        ->orWhereLike('ubicacion', "%{$search}%")
                        ->orWhereHas('area', fn ($areaQuery) => $areaQuery
                            ->whereLike('nombre', "%{$search}%")));

                if ($folioId !== null) {
                    $archiveQuery->orWhere('ticket_id', $folioId);
                }
            });
        }

        $paginator = $query
            ->orderByDesc('fecha_generacion')
            ->paginate($request->validated('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => RepairArchiveResource::collection($paginator->items())->resolve(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show(
        BitacoraReparacion $bitacora,
        ArchiveAccessService $access
    ) {
        $bitacora->load([
            'generadoPor',
            'ticket.area.sede',
            'reparacion.evidencias',
        ]);
        $access->ensureCanView(request()->user(), $bitacora);

        return response()->json([
            'success' => true,
            'data' => (new RepairArchiveResource($bitacora))->resolve(),
        ]);
    }
}
