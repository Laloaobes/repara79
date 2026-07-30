<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexOwnValoracionesRequest;
use App\Http\Requests\IndexValoracionesPendientesRequest;
use App\Http\Requests\RechazarValoracionRequest;
use App\Http\Requests\ReenviarValoracionRequest;
use App\Http\Requests\StoreValoracionRequest;
use App\Http\Resources\ValoracionResource;
use App\Models\MaterialTicket;
use App\Models\Valoracion;
use App\Services\ValoracionAuthorizationService;
use App\Services\ValoracionResubmissionService;
use App\Services\ValoracionService;

class ValoracionController extends Controller
{
    public function store(StoreValoracionRequest $request, ValoracionService $service)
    {
        $valoracion = $service->create($request->user(), $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Valoración registrada correctamente',
            'data' => (new ValoracionResource($valoracion))->resolve(),
        ], 201);
    }

    public function misValoraciones(IndexOwnValoracionesRequest $request)
    {
        $valoraciones = Valoracion::with(['tecnico', 'ticket.estado', 'materialesTicket'])
            ->where('valorado_por', auth()->id())
            ->orderBy(
                'fecha_creacion',
                $request->validated('sort', 'fecha_desc') === 'fecha_asc' ? 'asc' : 'desc'
            )
            ->get();

        return response()->json([
            'success' => true,
            'data' => ValoracionResource::collection($valoraciones)->resolve(),
        ]);
    }

    public function pendientes(IndexValoracionesPendientesRequest $request)
    {
        $filters = $request->validated();
        $query = Valoracion::query()
            ->with([
                'tecnico',
                'revisadoPor',
                'ticket.estado',
                'ticket.area.sede',
                'ticket.usuario',
                'materialesTicket',
            ])
            ->where('estado_general', 'Pendiente de autorización')
            ->select('solicitudes_materiales.*')
            ->selectSub(
                MaterialTicket::query()
                    ->selectRaw('COALESCE(SUM(cantidad * costo_unitario), 0)')
                    ->whereColumn('solicitud_id', 'solicitudes_materiales.id'),
                'costo_orden'
            );

        if (! empty($filters['search'])) {
            $search = trim($filters['search']);
            $folioId = null;

            if (preg_match('/^(?:TK-)?0*(\d+)$/i', $search, $matches)) {
                $folioId = (int) $matches[1];
            }

            $query->whereHas('ticket', function ($ticketQuery) use ($search, $folioId) {
                $ticketQuery->whereLike('titulo', "%{$search}%");

                if ($folioId !== null) {
                    $ticketQuery->orWhere('id', $folioId);
                }
            });
        }

        if (! empty($filters['area_id'])) {
            $query->whereHas('ticket', fn ($ticketQuery) => $ticketQuery
                ->where('area_id', $filters['area_id']));
        }

        match ($filters['sort'] ?? 'fecha_desc') {
            'fecha_asc' => $query->orderBy('fecha_creacion'),
            'costo_desc' => $query->orderByDesc('costo_orden'),
            'costo_asc' => $query->orderBy('costo_orden'),
            default => $query->orderByDesc('fecha_creacion'),
        };

        $valoraciones = $query->get();

        return response()->json([
            'success' => true,
            'data' => ValoracionResource::collection($valoraciones)->resolve(),
        ]);
    }

    public function show(Valoracion $valoracion)
    {
        return response()->json([
            'success' => true,
            'data' => (new ValoracionResource($valoracion->load([
                'tecnico',
                'revisadoPor',
                'ticket.estado',
                'ticket.area.sede',
                'ticket.usuario',
                'materialesTicket',
            ])))->resolve(),
        ]);
    }

    public function autorizar(
        Valoracion $valoracion,
        ValoracionAuthorizationService $service
    ) {
        $updated = $service->autorizar($valoracion, request()->user());

        return response()->json([
            'success' => true,
            'message' => 'Valoración autorizada correctamente',
            'data' => (new ValoracionResource($updated))->resolve(),
        ]);
    }

    public function rechazar(
        RechazarValoracionRequest $request,
        Valoracion $valoracion,
        ValoracionAuthorizationService $service
    ) {
        $updated = $service->rechazar(
            $valoracion,
            $request->user(),
            $request->validated('motivo_rechazo')
        );

        return response()->json([
            'success' => true,
            'message' => 'Valoración rechazada correctamente',
            'data' => (new ValoracionResource($updated))->resolve(),
        ]);
    }

    public function reenviar(
        ReenviarValoracionRequest $request,
        Valoracion $valoracion,
        ValoracionResubmissionService $service
    ) {
        $updated = $service->reenviar($valoracion, $request->user(), $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Valoración corregida y reenviada correctamente',
            'data' => (new ValoracionResource($updated))->resolve(),
        ]);
    }
}
