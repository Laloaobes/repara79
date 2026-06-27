<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Zona;
use App\Models\User;
use Illuminate\Http\Request;

class ZonaController extends Controller
{
    public function index(Request $request)
    {
        $query = Zona::with('responsable')->orderBy('nombre');
        if ($request->has('estatus')) {
            $query->where('estatus', $request->estatus === 'true');
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'responsable_id' => 'nullable|exists:users,id',
        ]);

        $zona = Zona::create($request->only(['nombre', 'descripcion', 'responsable_id']));
        return response()->json($zona->load('responsable'), 201);
    }

    public function show(Zona $zona)
    {
        return response()->json($zona->load(['responsable', 'tickets' => fn($q) => $q->orderBy('created_at', 'desc')->limit(10)]));
    }

    public function update(Request $request, Zona $zona)
    {
        $request->validate([
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'nullable|string',
            'responsable_id' => 'nullable|exists:users,id',
            'estatus' => 'sometimes|boolean',
        ]);

        $zona->update($request->only(['nombre', 'descripcion', 'responsable_id', 'estatus']));
        return response()->json($zona->fresh('responsable'));
    }

    public function destroy(Zona $zona)
    {
        if ($zona->tickets()->exists()) {
            return response()->json(['message' => 'No se puede eliminar una zona con tickets asociados'], 422);
        }
        $zona->delete();
        return response()->json(null, 204);
    }

    public function encargados()
    {
        $encargados = User::with('tipoUsuario')
            ->whereHas('tipoUsuario', fn($q) => $q->where('nombre', 'Responsable del Lugar'))
            ->where('estatus', true)
            ->get()
            ->map(fn($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]);
        return response()->json($encargados);
    }
}
