<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RechazarValoracionRequest;
use App\Http\Requests\StoreValoracionRequest;
use App\Models\EstadoTicket;
use App\Models\Ticket;
use App\Models\Valoracion;
use Illuminate\Support\Collection;

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

        $valoracion = Valoracion::create([
            ...$request->validated(),
            'materiales' => $materiales,
            'costo_estimado' => Collection::make($materiales)->sum('costo'),
            'tecnico_id' => auth()->id(),
            'estado' => 'Pendiente',
        ]);

        $estadoValorado = EstadoTicket::firstOrCreate(
            ['nombre' => 'Valorado'],
            [
                'descripcion' => 'El ticket fue valorado por el personal de mantenimiento.',
                'orden' => 2,
            ]
        );

        $ticket->update(['estado_id' => $estadoValorado->id]);

        return response()->json([
            'success' => true,
            'message' => 'Valoración registrada correctamente',
            'data' => $valoracion->load('tecnico'),
        ], 201);
    }

    public function misValoraciones()
    {
        $valoraciones = Valoracion::with(['ticket.estado'])
            ->where('tecnico_id', auth()->id())
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
        $valoraciones = Valoracion::with(['tecnico', 'ticket.area.sede', 'ticket.usuario'])
            ->where('estado', 'Pendiente')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $valoraciones,
        ]);
    }

    public function autorizar(Valoracion $valoracion)
    {
        if ($valoracion->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Esta valoración ya fue procesada.',
            ], 422);
        }

        $valoracion->update([
            'estado' => 'Autorizada',
            'revisado_por_id' => auth()->id(),
            'revisado_at' => now(),
        ]);

        $estadoAutorizado = EstadoTicket::firstOrCreate(
            ['nombre' => 'Autorizado'],
            [
                'descripcion' => 'La valoración técnica fue autorizada por la subdirección.',
                'orden' => 3,
            ]
        );

        $valoracion->ticket->update(['estado_id' => $estadoAutorizado->id]);

        return response()->json([
            'success' => true,
            'message' => 'Valoración autorizada correctamente',
            'data' => $valoracion->fresh(['tecnico', 'ticket']),
        ]);
    }

    public function rechazar(RechazarValoracionRequest $request, Valoracion $valoracion)
    {
        if ($valoracion->estado !== 'Pendiente') {
            return response()->json([
                'success' => false,
                'message' => 'Esta valoración ya fue procesada.',
            ], 422);
        }

        $valoracion->update([
            'estado' => 'Rechazada',
            'motivo_rechazo' => $request->validated('motivo_rechazo'),
            'revisado_por_id' => auth()->id(),
            'revisado_at' => now(),
        ]);

        $estadoRechazado = EstadoTicket::firstOrCreate(
            ['nombre' => 'Rechazado'],
            [
                'descripcion' => 'La valoración técnica fue rechazada por la subdirección.',
                'orden' => 3,
            ]
        );

        $valoracion->ticket->update(['estado_id' => $estadoRechazado->id]);

        return response()->json([
            'success' => true,
            'message' => 'Valoración rechazada correctamente',
            'data' => $valoracion->fresh(['tecnico', 'ticket']),
        ]);
    }
}
