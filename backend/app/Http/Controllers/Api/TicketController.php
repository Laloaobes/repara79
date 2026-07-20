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
use Illuminate\Support\Arr;

class TicketController extends Controller
{
    public function index()
    {
        $query = Ticket::with(['area.sede', 'tipoDesperfecto', 'estado', 'prioridad']);

        if (!auth()->user()->hasRole('Personal de Mantenimiento', 'Administrador')) {
            $query->where('usuario_id', auth()->id());
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->get(),
        ]);
    }

    public function store(StoreTicketRequest $request)
    {
        $validated = $request->validated();
        $ticketData = Arr::except($validated, ['fotografia_inicial']);

        if ($request->hasFile('fotografia_inicial')) {
            $ticketData['fotografia_inicial'] = $request
                ->file('fotografia_inicial')
                ->store('tickets/evidencias', 'public');
        }

        $estadoPendiente = EstadoTicket::firstOrCreate(
            ['nombre' => 'Pendiente'],
            [
                'descripcion' => 'El ticket fue registrado y queda en espera de inspección.',
                'orden' => 1,
            ]
        );

        $ticket = Ticket::create([
            ...$ticketData,
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
        $canViewAnyTicket = auth()->user()->hasRole('Personal de Mantenimiento', 'Administrador');

        if (!$canViewAnyTicket && $ticket->usuario_id !== auth()->id()) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket->load(['area.sede', 'tipoDesperfecto', 'estado', 'prioridad', 'usuario', 'valoracion.tecnico']),
        ]);
    }

    public function marcarReparado(Ticket $ticket)
    {
        // Solo Personal de Mantenimiento puede cerrar tickets
        if (!auth()->user()->hasRole('Personal de Mantenimiento')) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para esta acción.',
            ], 403);
        }

        // Máquina de estados: solo tickets autorizados pueden marcarse como reparados
        if ($ticket->estado?->nombre !== 'Autorizado') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden reparar tickets que ya fueron autorizados por la Subdirección.',
            ], 422);
        }

        $estadoReparado = EstadoTicket::firstOrCreate(
            ['nombre' => 'Reparado'],
            ['descripcion' => 'El desperfecto fue reparado por el técnico asignado.', 'orden' => 4]
        );

        $ticket->estado_id = $estadoReparado->id;
        $ticket->save();

        return response()->json([
            'success' => true,
            'message' => 'El ticket ha sido marcado como reparado exitosamente.',
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
