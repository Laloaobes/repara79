<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexOwnValoracionesRequest;
use App\Http\Requests\RechazarValoracionRequest;
use App\Http\Requests\StoreValoracionRequest;
use App\Http\Resources\ValoracionResource;
use App\Models\EstadoTicket;
use App\Models\Valoracion;
use App\Services\ValoracionService;
use Illuminate\Support\Facades\DB;

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

    public function pendientes()
    {
        $valoraciones = Valoracion::with(['tecnico', 'ticket.area.sede', 'ticket.usuario', 'materialesTicket'])
            ->where('estado_general', 'Pendiente')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $valoraciones,
        ]);
    }

    public function autorizar(Valoracion $valoracion)
    {
        if ($valoracion->estado_general !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Esta valoración ya fue procesada.',
            ], 422);
        }

        DB::transaction(function () use ($valoracion) {
            $valoracion->update([
                'estado_general' => 'Autorizada',
                'validado_por' => auth()->id(),
                'fecha_validacion' => now(),
                'veces_revisada' => $valoracion->veces_revisada + 1,
            ]);

            $estadoAutorizado = EstadoTicket::firstOrCreate(
                ['nombre' => 'Autorizado'],
                [
                    'descripcion' => 'La valoración técnica fue autorizada por la subdirección.',
                    'orden' => 3,
                ]
            );

            $valoracion->ticket->update(['estado_id' => $estadoAutorizado->id]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Valoración autorizada correctamente',
            'data' => $valoracion->fresh(['tecnico', 'ticket', 'materialesTicket']),
        ]);
    }

    public function rechazar(RechazarValoracionRequest $request, Valoracion $valoracion)
    {
        if ($valoracion->estado_general !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Esta valoración ya fue procesada.',
            ], 422);
        }

        DB::transaction(function () use ($request, $valoracion) {
            $valoracion->update([
                'estado_general' => 'Rechazada',
                'motivo_rechazo' => $request->validated('motivo_rechazo'),
                'validado_por' => auth()->id(),
                'fecha_validacion' => now(),
                'veces_revisada' => $valoracion->veces_revisada + 1,
            ]);

            $estadoRechazado = EstadoTicket::firstOrCreate(
                ['nombre' => 'Rechazado'],
                [
                    'descripcion' => 'La valoración técnica fue rechazada por la subdirección.',
                    'orden' => 5,
                ]
            );

            $valoracion->ticket->update(['estado_id' => $estadoRechazado->id]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Valoración rechazada correctamente',
            'data' => $valoracion->fresh(['tecnico', 'ticket', 'materialesTicket']),
        ]);
    }
}
