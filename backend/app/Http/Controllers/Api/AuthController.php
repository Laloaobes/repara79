<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = User::with('tipoUsuario')
            ->where('email', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {

            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'rol' => $user->tipoUsuario->nombre
            ]
        ]);
    }

    public function me()
    {
        $user = auth()->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'rol' => $user->tipoUsuario->nombre
        ]);
    }

    public function logout()
    {
        $user = auth()->user();

        $user->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente'
        ]);
    }
}
