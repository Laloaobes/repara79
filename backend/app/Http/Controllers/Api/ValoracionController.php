<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreValoracionRequest;
use App\Models\EstadoTicket;
use App\Models\Ticket;
use App\Models\Valoracion;

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

        $valoracion = Valoracion::create([
            ...$request->validated(),
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
}
