<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Valoracion;
use App\Models\MaterialValoracion;
use App\Models\HistorialEstado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ValoracionController extends Controller
{
    public function show(Ticket $ticket)
    {
        $valoracion = $ticket->valoracion()->with('materiales', 'tecnico')->first();
        if (!$valoracion) return response()->json(null);
        return response()->json($valoracion);
    }

    public function store(Request $request, Ticket $ticket)
    {
        $user = $request->user();
        if ($user->tipoUsuario->nombre !== 'Personal de Mantenimiento' && $user->tipoUsuario->nombre !== 'Administrador') {
            return response()->json(['message' => 'Solo técnicos pueden realizar valoraciones'], 403);
        }

        $request->validate([
            'tiempo_estimado' => 'required|integer|min:1',
            'observaciones' => 'nullable|string',
            'materiales' => 'required|array|min:1',
            'materiales.*.nombre' => 'required|string',
            'materiales.*.cantidad' => 'required|integer|min:1',
            'materiales.*.precio_unitario' => 'required|numeric|min:0',
        ]);

        DB::transaction(function() use ($request, $ticket, $user) {
            $ticket->valoracion()->delete();

            $costoTotal = collect($request->materiales)->sum(fn($m) => $m['cantidad'] * $m['precio_unitario']);

            $valoracion = Valoracion::create([
                'ticket_id' => $ticket->id,
                'tecnico_id' => $user->id,
                'tiempo_estimado' => $request->tiempo_estimado,
                'costo_total' => $costoTotal,
                'observaciones' => $request->observaciones,
            ]);

            foreach ($request->materiales as $material) {
                MaterialValoracion::create([
                    'valoracion_id' => $valoracion->id,
                    'nombre' => $material['nombre'],
                    'cantidad' => $material['cantidad'],
                    'precio_unitario' => $material['precio_unitario'],
                    'subtotal' => $material['cantidad'] * $material['precio_unitario'],
                ]);
            }

            $estadoAnterior = $ticket->estado;
            $ticket->update(['estado' => 'valorado']);

            HistorialEstado::create([
                'ticket_id' => $ticket->id,
                'usuario_id' => $user->id,
                'estado_anterior' => $estadoAnterior,
                'estado_nuevo' => 'valorado',
                'comentario' => 'Valoración registrada por ' . $user->name,
            ]);
        });

        return response()->json($ticket->fresh()->valoracion()->with('materiales', 'tecnico')->first(), 201);
    }
}
