<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RechazarValoracionRequest;
use App\Http\Requests\StoreValoracionRequest;
use App\Models\EstadoTicket;
use App\Models\MaterialTicket;
use App\Models\Ticket;
use App\Models\Valoracion;
use Illuminate\Support\Facades\DB;

class ValoracionController extends Controller
{
    public function store(StoreValoracionRequest $request)
    {
        $ticket = Ticket::findOrFail($request->validated('ticket_id'));

        if ($ticket->valoracion()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Este ticket ya tiene una valoración registrada.',
            ], 422);
        }

        $materiales = $request->validated('materiales', []) ?? [];

        $valoracion = DB::transaction(function () use ($request, $ticket, $materiales) {
            $valoracion = Valoracion::create([
                'ticket_id' => $ticket->id,
                'estado_general' => 'Pendiente',
                'observaciones' => $request->validated('observaciones'),
                'valorado_por' => auth()->id(),
                'fecha_creacion' => now(),
            ]);

            foreach ($materiales as $material) {
                MaterialTicket::create([
                    'solicitud_id' => $valoracion->id,
                    'nombre_material' => $material['descripcion'],
                    'cantidad' => 1,
                    'costo_unitario' => $material['costo'],
                    'estado_individual' => 'Pendiente',
                ]);
            }

            $estadoValorado = EstadoTicket::firstOrCreate(
                ['nombre' => 'Valorado'],
                [
                    'descripcion' => 'El ticket fue valorado por el personal de mantenimiento.',
                    'orden' => 2,
                ]
            );

            $ticket->update(['estado_id' => $estadoValorado->id]);

            return $valoracion;
        });

        return response()->json([
            'success' => true,
            'message' => 'Valoración registrada correctamente',
            'data' => $valoracion->load(['tecnico', 'materialesTicket']),
        ], 201);
    }

    public function misValoraciones()
    {
        $valoraciones = Valoracion::with(['ticket.estado', 'materialesTicket'])
            ->where('valorado_por', auth()->id())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $valoraciones,
        ]);
    }

    public function destroyMaterial(Valoracion $valoracion, int $materialIndex)
    {
        if ($valoracion->tecnico_id !== auth()->id()) {
            abort(404);
        }

        if ($valoracion->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes eliminar materiales de una valoración pendiente.',
            ], 422);
        }

        $materiales = $valoracion->materiales ?? [];

        if (!array_key_exists($materialIndex, $materiales)) {
            return response()->json([
                'success' => false,
                'message' => 'El material indicado no existe en la valoración.',
            ], 404);
        }

        unset($materiales[$materialIndex]);
        $materiales = array_values($materiales);

        $valoracion->update([
            'materiales' => $materiales,
            'costo_estimado' => Collection::make($materiales)->sum('costo'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Material eliminado correctamente',
            'data' => $valoracion->fresh(['tecnico', 'ticket.estado']),
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

    public function destroyMaterial(Valoracion $valoracion, int $materialIndex)
    {
        if ($valoracion->valorado_por !== auth()->id()) {
            abort(404);
        }

        if ($valoracion->estado_general !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Solo puedes eliminar materiales de una valoración pendiente.',
            ], 422);
        }

        $material = $valoracion->materialesTicket()
            ->orderBy('id')
            ->get()
            ->get($materialIndex);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'El material indicado no existe en la valoración.',
            ], 404);
        }

        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Material eliminado correctamente',
            'data' => $valoracion->fresh(['tecnico', 'ticket.estado', 'materialesTicket']),
        ]);
    }
}
