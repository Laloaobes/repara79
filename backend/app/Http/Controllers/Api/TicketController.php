<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\HistorialEstado;
use App\Models\Evidencia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $rol = $user->tipoUsuario->nombre;

        $query = Ticket::with(['zona', 'creador', 'tecnico', 'valoracion'])
            ->orderBy('created_at', 'desc');

        if ($rol === 'Personal de Mantenimiento') {
            $query->where('asignado_a', $user->id);
        } elseif ($rol === 'Responsable del Lugar') {
            $query->where('creado_por', $user->id);
        } elseif ($rol === 'Subdirector Administrativo') {
            $query->whereIn('estado', ['valorado', 'autorizado', 'rechazado', 'reparado']);
        }

        if ($request->has('estado') && $request->estado !== 'todos') {
            $query->where('estado', $request->estado);
        }
        if ($request->has('prioridad')) {
            $query->where('prioridad', $request->prioridad);
        }
        if ($request->has('zona_id')) {
            $query->where('zona_id', $request->zona_id);
        }
        if ($request->has('buscar')) {
            $buscar = $request->buscar;
            $query->where(function($q) use ($buscar) {
                $q->where('folio', 'like', "%$buscar%")
                  ->orWhere('descripcion', 'like', "%$buscar%")
                  ->orWhere('categoria', 'like', "%$buscar%")
                  ->orWhere('ubicacion_exacta', 'like', "%$buscar%");
            });
        }

        $tickets = $query->paginate(15);
        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'zona_id' => 'required|exists:zonas,id',
            'categoria' => 'required|string|max:100',
            'ubicacion_exacta' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'prioridad' => 'required|in:baja,media,alta,critica',
            'evidencias.*' => 'nullable|image|max:5120',
        ]);

        $ticket = Ticket::create([
            'zona_id' => $request->zona_id,
            'creado_por' => $request->user()->id,
            'categoria' => $request->categoria,
            'ubicacion_exacta' => $request->ubicacion_exacta,
            'descripcion' => $request->descripcion,
            'prioridad' => $request->prioridad,
            'estado' => 'pendiente',
        ]);

        if ($request->hasFile('evidencias')) {
            foreach ($request->file('evidencias') as $file) {
                $path = $file->store('evidencias', 'public');
                Evidencia::create([
                    'ticket_id' => $ticket->id,
                    'ruta_archivo' => $path,
                    'nombre_archivo' => $file->getClientOriginalName(),
                    'tipo_archivo' => $file->getMimeType(),
                ]);
            }
        }

        HistorialEstado::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'estado_anterior' => null,
            'estado_nuevo' => 'pendiente',
            'comentario' => 'Ticket creado',
        ]);

        return response()->json($ticket->load(['zona', 'creador', 'evidencias']), 201);
    }

    public function show(Request $request, Ticket $ticket)
    {
        $ticket->load(['zona', 'creador', 'tecnico', 'evidencias', 'valoracion.materiales', 'valoracion.tecnico', 'historial.usuario']);
        return response()->json($ticket);
    }

    public function asignar(Request $request, Ticket $ticket)
    {
        $this->requireRole($request, ['Administrador']);
        $request->validate(['tecnico_id' => 'required|exists:users,id']);

        $tecnico = User::with('tipoUsuario')->find($request->tecnico_id);
        if ($tecnico->tipoUsuario->nombre !== 'Personal de Mantenimiento') {
            return response()->json(['message' => 'El usuario seleccionado no es técnico'], 422);
        }

        $estadoAnterior = $ticket->asignado_a;
        $ticket->update(['asignado_a' => $request->tecnico_id]);

        return response()->json($ticket->fresh(['tecnico']));
    }

    public function autorizar(Request $request, Ticket $ticket)
    {
        $this->requireRole($request, ['Administrador', 'Subdirector Administrativo']);
        if ($ticket->estado !== 'valorado') {
            return response()->json(['message' => 'Solo se puede autorizar un ticket valorado'], 422);
        }

        $ticket->update(['estado' => 'autorizado']);
        HistorialEstado::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'estado_anterior' => 'valorado',
            'estado_nuevo' => 'autorizado',
            'comentario' => $request->comentario ?? 'Valoración autorizada',
        ]);

        return response()->json($ticket->fresh());
    }

    public function rechazar(Request $request, Ticket $ticket)
    {
        $this->requireRole($request, ['Administrador', 'Subdirector Administrativo']);
        $request->validate(['motivo' => 'required|string|min:10']);
        if ($ticket->estado !== 'valorado') {
            return response()->json(['message' => 'Solo se puede rechazar un ticket valorado'], 422);
        }

        $ticket->update(['estado' => 'rechazado', 'motivo_rechazo' => $request->motivo]);
        HistorialEstado::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'estado_anterior' => 'valorado',
            'estado_nuevo' => 'rechazado',
            'comentario' => $request->motivo,
        ]);

        return response()->json($ticket->fresh());
    }

    public function marcarReparado(Request $request, Ticket $ticket)
    {
        $this->requireRole($request, ['Personal de Mantenimiento', 'Administrador']);
        if ($ticket->estado !== 'autorizado') {
            return response()->json(['message' => 'Solo se puede marcar como reparado un ticket autorizado'], 422);
        }

        $ticket->update(['estado' => 'reparado']);
        HistorialEstado::create([
            'ticket_id' => $ticket->id,
            'usuario_id' => $request->user()->id,
            'estado_anterior' => 'autorizado',
            'estado_nuevo' => 'reparado',
            'comentario' => $request->comentario ?? 'Reparación completada',
        ]);

        return response()->json($ticket->fresh());
    }

    public function subirEvidencias(Request $request, Ticket $ticket)
    {
        $request->validate(['evidencias.*' => 'required|image|max:5120']);
        $evidencias = [];
        foreach ($request->file('evidencias') as $file) {
            $path = $file->store('evidencias', 'public');
            $evidencias[] = Evidencia::create([
                'ticket_id' => $ticket->id,
                'ruta_archivo' => $path,
                'nombre_archivo' => $file->getClientOriginalName(),
                'tipo_archivo' => $file->getMimeType(),
            ]);
        }
        return response()->json($evidencias, 201);
    }

    public function tecnicos()
    {
        $tecnicos = User::with('tipoUsuario')
            ->whereHas('tipoUsuario', fn($q) => $q->where('nombre', 'Personal de Mantenimiento'))
            ->where('estatus', true)
            ->get()
            ->map(fn($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]);
        return response()->json($tecnicos);
    }

    private function requireRole(Request $request, array $roles): void
    {
        $userRole = $request->user()->tipoUsuario->nombre ?? '';
        if (!in_array($userRole, $roles)) {
            abort(403, 'Acceso denegado');
        }
    }
}
