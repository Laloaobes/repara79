<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TipoUsuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['tipoUsuario', 'zona'])->orderBy('created_at', 'desc');

        if ($request->has('buscar')) {
            $buscar = $request->buscar;
            $query->where(function($q) use ($buscar) {
                $q->where('name', 'like', "%$buscar%")
                  ->orWhere('email', 'like', "%$buscar%");
            });
        }
        if ($request->has('tipo_usuario_id')) {
            $query->where('tipo_usuario_id', $request->tipo_usuario_id);
        }
        if ($request->has('estatus')) {
            $query->where('estatus', $request->estatus === 'true');
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'tipo_usuario_id' => 'required|exists:tipos_usuarios,id',
            'zona_id' => 'nullable|exists:zonas,id',
            'telefono' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tipo_usuario_id' => $request->tipo_usuario_id,
            'zona_id' => $request->zona_id,
            'telefono' => $request->telefono,
            'estatus' => true,
        ]);

        return response()->json($user->load(['tipoUsuario', 'zona']), 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load(['tipoUsuario', 'zona']));
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'tipo_usuario_id' => 'sometimes|exists:tipos_usuarios,id',
            'zona_id' => 'nullable|exists:zonas,id',
            'telefono' => 'nullable|string|max:20',
        ]);

        $data = $request->only(['name', 'email', 'tipo_usuario_id', 'zona_id', 'telefono']);
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        return response()->json($user->fresh(['tipoUsuario', 'zona']));
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'No puedes eliminar tu propio usuario'], 422);
        }
        $user->delete();
        return response()->json(null, 204);
    }

    public function toggleEstatus(User $user)
    {
        $user->update(['estatus' => !$user->estatus]);
        return response()->json($user->fresh(['tipoUsuario']));
    }

    public function resetPassword(Request $request, User $user)
    {
        $request->validate(['password' => 'required|string|min:8']);
        $user->update(['password' => Hash::make($request->password)]);
        return response()->json(['message' => 'Contraseña actualizada correctamente']);
    }

    public function tiposUsuario()
    {
        return response()->json(TipoUsuario::all());
    }
}
