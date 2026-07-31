<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexPendingValuationTicketsRequest;
use App\Http\Requests\StoreTicketRequest;
use App\Models\Area;
use App\Models\EstadoTicket;
use App\Models\PrioridadTicket;
use App\Models\Sede;
use App\Models\Ticket;
use App\Models\TipoDesperfecto;
use App\Services\MediaStorageService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Throwable;

class TicketController extends Controller
{
    public function index(IndexPendingValuationTicketsRequest $request)
    {
        $query = Ticket::with(['area.sede', 'tipoDesperfecto', 'estado', 'prioridad']);

        if (! auth()->user()->hasRole('Personal de Mantenimiento', 'Subdirector Administrativo')) {
            $query->where('usuario_id', auth()->id());
        }

        $filters = $request->validated();

        if (! empty($filters['estado'])) {
            $query->whereHas('estado', fn ($stateQuery) => $stateQuery
                ->where('nombre', $filters['estado']));
        }

        if (! empty($filters['area_id'])) {
            $query->where('area_id', $filters['area_id']);
        }

        if (! empty($filters['search'])) {
            $search = trim($filters['search']);
            $folioId = null;

            if (preg_match('/^(?:TK-)?0*(\d+)$/i', $search, $matches)) {
                $folioId = (int) $matches[1];
            }

            $query->where(function ($ticketQuery) use ($search, $folioId) {
                $ticketQuery->whereLike('titulo', "%{$search}%");

                if ($folioId !== null) {
                    $ticketQuery->orWhere('id', $folioId);
                }
            });
        }

        $query->orderBy(
            'created_at',
            ($filters['sort'] ?? 'fecha_desc') === 'fecha_asc' ? 'asc' : 'desc'
        );

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(StoreTicketRequest $request, MediaStorageService $storage)
    {
        $validated = $request->validated();
        $ticketData = Arr::except($validated, ['fotografia_referencia']);

        $estadoPendiente = EstadoTicket::firstOrCreate(
            ['nombre' => 'Pendiente'],
            [
                'descripcion' => 'El ticket fue registrado y queda en espera de inspección.',
                'orden' => 1,
            ]
        );

        $referencePath = null;

        DB::beginTransaction();

        try {
            $ticket = Ticket::create([
                ...$ticketData,
                'usuario_id' => auth()->id(),
                'estado_id' => $estadoPendiente->id,
                'fecha_reporte' => now(),
            ]);

            if ($request->hasFile('fotografia_referencia')) {
                $referencePath = $storage->storeTicketReference(
                    $ticket,
                    $request->file('fotografia_referencia')
                );
                $ticket->update(['fotografia_referencia' => $referencePath]);
            }

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            $storage->delete($referencePath);

            throw $exception;
        }

        return response()->json([
            'success' => true,
            'message' => 'Ticket creado correctamente',
            'data' => $ticket->load(['area.sede', 'tipoDesperfecto', 'estado', 'prioridad']),
        ], 201);
    }

    public function show(Ticket $ticket)
    {
        $canViewAnyTicket = auth()->user()->hasRole('Personal de Mantenimiento', 'Subdirector Administrativo');

        if (! $canViewAnyTicket && $ticket->usuario_id !== auth()->id()) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'data' => $ticket->load([
                'area.sede',
                'tipoDesperfecto',
                'estado',
                'prioridad',
                'usuario',
                'valoracion.tecnico',
            ]),
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
