<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Models\Area;
use App\Models\EstadoTicket;
use App\Models\PrioridadTicket;
use App\Models\Sede;
use App\Models\Ticket;
use App\Models\TipoDesperfecto;

class TicketController extends Controller
{
    public function index()
    {
        $query = Ticket::with(['area.sede', 'tipoDesperfecto', 'estado', 'prioridad']);

        if (!auth()->user()->hasRole('Personal de Mantenimiento', 'Subdirector Administrativo')) {
            $query->where('usuario_id', auth()->id());
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->get(),
        ]);
    }

    public function store(StoreTicketRequest $request)
    {
        $estadoPendiente = EstadoTicket::firstOrCreate(
            ['nombre' => 'Pendiente'],
            [
                'descripcion' => 'El ticket fue registrado y queda en espera de inspección.',
                'orden' => 1,
            ]
        );

        $ticket = Ticket::create([
            ...$request->validated(),
            'usuario_id' => auth()->id(),
            'estado_id' => $estadoPendiente->id,
            'fecha_reporte' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ticket creado correctamente',
            'data' => $ticket->load(['area.sede', 'tipoDesperfecto', 'estado', 'prioridad']),
        ], 201);
    }

    public function show(Ticket $ticket)
    {
        $canViewAnyTicket = auth()->user()->hasRole('Personal de Mantenimiento', 'Subdirector Administrativo');

        if (!$canViewAnyTicket && $ticket->usuario_id !== auth()->id()) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket->load(['area.sede', 'tipoDesperfecto', 'estado', 'prioridad', 'usuario', 'valoracion.tecnico']),
        ]);
    }

    public function catalogs()
    {
        return response()->json([
            'sedes' => Sede::orderBy('nombre')->get(),
            'areas' => Area::with('sede')->orderBy('nombre')->get(),
            'tipos_desperfectos' => TipoDesperfecto::orderBy('nombre')->get(),
            'prioridades' => PrioridadTicket::orderBy('id_prioridad')->get(),
        ]);
    }
}
