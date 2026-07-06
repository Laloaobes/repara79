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
            ->map(fn (User $user) => $this->formatUser($user));

        return response()->json([
            'success' => true,
            'data' => $usuarios,
        ]);
    }

    public function show(User $usuario)
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatUser($usuario->load('tipoUsuario')),
        ]);
    }

    public function update(UpdateUserRoleRequest $request, User $usuario)
    {
        return $this->updateRole($request, $usuario);
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
            'data' => $this->formatUser($usuario->fresh('tipoUsuario')),
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'rol' => $user->tipoUsuario?->nombre,
            'activo' => $user->activo,
        ];
    }
}
