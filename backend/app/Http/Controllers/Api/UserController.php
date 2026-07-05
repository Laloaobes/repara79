<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\TipoUsuario;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        $usuarios = User::with('tipoUsuario')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->tipoUsuario?->nombre,
                'activo' => $user->activo,
            ]);

        return response()->json([
            'success' => true,
            'data' => $usuarios,
        ]);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $usuario)
    {
        if ($usuario->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'No puedes cambiar tu propio rol.',
            ], 422);
        }

        $tipoUsuario = TipoUsuario::where('nombre', $request->validated('rol'))->firstOrFail();

        $usuario->update(['tipo_usuario_id' => $tipoUsuario->id]);

        return response()->json([
            'success' => true,
            'message' => 'Rol actualizado correctamente',
            'data' => [
                'id' => $usuario->id,
                'name' => $usuario->name,
                'email' => $usuario->email,
                'rol' => $tipoUsuario->nombre,
                'activo' => $usuario->activo,
            ],
        ]);
    }
}
