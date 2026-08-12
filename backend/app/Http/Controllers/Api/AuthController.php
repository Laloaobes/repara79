<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\TipoUsuario;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        abort_unless(config('deployment.allow_public_registration'), 404);

        $tipoUsuario = TipoUsuario::firstOrCreate([
            'nombre' => 'Usuario Registrado',
        ]);

        $user = User::create([
            'tipo_usuario_id' => $tipoUsuario->id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'activo' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $this->userData($user),
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::with('tipoUsuario')
            ->where('email', $request->email)
            ->first();

        if (! $user || ! $user->activo || ! Hash::check($request->password, $user->password)) {

            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $this->userData($user),
        ]);
    }

    public function me()
    {
        $user = auth()->user();

        return response()->json($this->userData($user));
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = auth()->user();

        $user->update($request->validated());

        return response()->json($this->userData($user->fresh()));
    }

    public function logout()
    {
        $user = auth()->user();

        $user->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    private function userData(User $user): array
    {
        $user->loadMissing(['tipoUsuario', 'areas.sede']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telefono' => $user->telefono,
            'apellido_paterno' => $user->apellido_paterno,
            'apellido_materno' => $user->apellido_materno,
            'rol' => $user->tipoUsuario->nombre,
            'areas' => $user->areas
                ->filter(fn ($area) => (bool) $area->pivot->activo)
                ->values()
                ->map(fn ($area) => [
                    'id' => $area->id,
                    'nombre' => $area->nombre,
                    'ubicacion' => $area->ubicacion,
                    'sede' => $area->sede ? [
                        'id' => $area->sede->id,
                        'nombre' => $area->sede->nombre,
                    ] : null,
                ]),
        ];
    }
}
