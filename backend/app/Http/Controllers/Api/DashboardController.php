<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $rol = $user->tipoUsuario->nombre;

        $query = Ticket::query();

        if ($rol === 'Personal de Mantenimiento') {
            $query->where('asignado_a', $user->id);
        } elseif ($rol === 'Responsable del Lugar') {
            $query->where('creado_por', $user->id);
        }
        // Admin y Subdirector ven todos

        $tickets = $query->get();

        $stats = [
            'total' => $tickets->count(),
            'pendientes' => $tickets->where('estado', 'pendiente')->count(),
            'valorados' => $tickets->where('estado', 'valorado')->count(),
            'autorizados' => $tickets->where('estado', 'autorizado')->count(),
            'rechazados' => $tickets->where('estado', 'rechazado')->count(),
            'reparados' => $tickets->where('estado', 'reparado')->count(),
        ];

        if (in_array($rol, ['Administrador', 'Subdirector Administrativo'])) {
            $valoraciones = \App\Models\Valoracion::sum('costo_total');
            $stats['costo_acumulado'] = $valoraciones;
        }

        $recientesQuery = Ticket::with(['zona', 'creador', 'tecnico'])
            ->orderBy('created_at', 'desc')
            ->limit(5);

        if ($rol === 'Personal de Mantenimiento') {
            $recientesQuery->where('asignado_a', $user->id);
        } elseif ($rol === 'Responsable del Lugar') {
            $recientesQuery->where('creado_por', $user->id);
        }

        $recientes = $recientesQuery->get()->map(function ($ticket) {
            return [
                'id' => $ticket->id,
                'folio' => $ticket->folio,
                'titulo' => $ticket->categoria . ' - ' . $ticket->ubicacion_exacta,
                'desc' => $ticket->descripcion,
                'ubicacion' => ($ticket->zona->nombre ?? '') . ' — ' . $ticket->ubicacion_exacta,
                'fecha' => $ticket->created_at->format('d M Y'),
                'estado' => $ticket->estado,
                'prioridad' => $ticket->prioridad,
                'tecnico' => $ticket->tecnico->name ?? 'Sin asignar',
                'zona' => $ticket->zona->nombre ?? '',
            ];
        });

        return response()->json([
            'stats' => $stats,
            'recientes' => $recientes,
        ]);
    }
}
