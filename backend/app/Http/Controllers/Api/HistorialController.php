<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class HistorialController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with(['zona', 'creador', 'tecnico', 'valoracion'])
            ->where('estado', 'reparado')
            ->orderBy('updated_at', 'desc');

        if ($request->has('folio')) {
            $query->where('folio', 'like', '%' . $request->folio . '%');
        }
        if ($request->has('zona_id')) {
            $query->where('zona_id', $request->zona_id);
        }
        if ($request->has('desde')) {
            $query->whereDate('created_at', '>=', $request->desde);
        }
        if ($request->has('hasta')) {
            $query->whereDate('created_at', '<=', $request->hasta);
        }

        return response()->json($query->paginate(15));
    }

    public function show(Ticket $ticket)
    {
        $ticket->load(['zona', 'creador', 'tecnico', 'evidencias', 'valoracion.materiales', 'historial.usuario']);
        return response()->json($ticket);
    }
}
