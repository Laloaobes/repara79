<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\Area;
use App\Models\TipoUsuario;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index()
    {
        $usuarios = User::query()
            ->with(['tipoUsuario', 'areas.sede'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => $this->formatUser($user));

        return response()->json([
            'success' => true,
            'data' => $usuarios,
        ]);
    }

    public function areas()
    {
        $areas = Area::query()
            ->with([
                'sede',
                'responsables' => fn ($query) => $query
                    ->wherePivot('activo', true)
                    ->with('tipoUsuario'),
            ])
            ->orderBy('nombre')
            ->get()
            ->map(fn (Area $area) => [
                'id' => $area->id,
                'nombre' => $area->nombre,
                'ubicacion' => $area->ubicacion,
                'sede' => $area->sede ? [
                    'id' => $area->sede->id,
                    'nombre' => $area->sede->nombre,
                ] : null,
                'responsable' => $area->responsables->first()
                    ? [
                        'id' => $area->responsables->first()->id,
                        'name' => $area->responsables->first()->name,
                    ]
                    : null,
            ]);

        return response()->json(['success' => true, 'data' => $areas]);
    }

    public function show(User $usuario)
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatUser($usuario->load(['tipoUsuario', 'areas.sede'])),
        ]);
    }

    public function update(UpdateUserRoleRequest $request, User $usuario)
    {
        return $this->updateRole($request, $usuario);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $usuario)
    {
        if ($usuario->id === $request->user()->id) {
            throw ValidationException::withMessages([
                'usuario' => 'No puedes cambiar tu propio rol o asignaciones.',
            ]);
        }

        try {
            $updated = DB::transaction(function () use ($request, $usuario): User {
                $managedUser = User::query()
                    ->with('tipoUsuario')
                    ->lockForUpdate()
                    ->findOrFail($usuario->id);
                $newRole = $request->validated('rol');
                $role = TipoUsuario::query()->where('nombre', $newRole)->firstOrFail();

                if ($managedUser->tipoUsuario?->nombre === 'Subdirector Administrativo'
                    && $newRole !== 'Subdirector Administrativo') {
                    $otherActiveAdministrators = User::query()
                        ->whereKeyNot($managedUser->id)
                        ->where('activo', true)
                        ->whereHas('tipoUsuario', fn ($query) => $query
                            ->where('nombre', 'Subdirector Administrativo'))
                        ->lockForUpdate()
                        ->exists();

                    if (! $otherActiveAdministrators) {
                        throw ValidationException::withMessages([
                            'rol' => 'Debe permanecer al menos un Subdirector Administrativo activo.',
                        ]);
                    }
                }

                $areaIds = collect($request->validated('area_ids', []))
                    ->map(fn ($id) => (int) $id)
                    ->unique()
                    ->values();

                if ($newRole === 'Responsable del Lugar') {
                    if (! $managedUser->activo) {
                        throw ValidationException::withMessages([
                            'usuario' => 'Debes reactivar la cuenta antes de asignarle áreas.',
                        ]);
                    }

                    Area::query()->whereKey($areaIds)->lockForUpdate()->get();

                    $conflictingAreaIds = DB::table('usuario_area')
                        ->whereIn('area_id', $areaIds)
                        ->where('activo', true)
                        ->where('usuario_id', '!=', $managedUser->id)
                        ->lockForUpdate()
                        ->pluck('area_id');

                    if ($conflictingAreaIds->isNotEmpty()) {
                        $names = Area::query()->whereKey($conflictingAreaIds)->pluck('nombre')->join(', ');
                        throw ValidationException::withMessages([
                            'area_ids' => "Las siguientes áreas ya tienen responsable: {$names}.",
                        ]);
                    }
                }

                $managedUser->update(['tipo_usuario_id' => $role->id]);
                DB::table('usuario_area')
                    ->where('usuario_id', $managedUser->id)
                    ->update(['activo' => false, 'updated_at' => now()]);

                if ($newRole === 'Responsable del Lugar') {
                    foreach ($areaIds as $areaId) {
                        DB::table('usuario_area')->upsert([
                            [
                                'usuario_id' => $managedUser->id,
                                'area_id' => $areaId,
                                'activo' => true,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ],
                        ], ['usuario_id', 'area_id'], ['activo', 'updated_at']);
                    }
                }

                return $managedUser->fresh(['tipoUsuario', 'areas.sede']);
            }, 3);
        } catch (QueryException) {
            throw ValidationException::withMessages([
                'area_ids' => 'Una de las áreas acaba de ser asignada a otro responsable. Actualiza la lista.',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Rol y áreas actualizados correctamente.',
            'data' => $this->formatUser($updated),
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
            'areas' => $user->relationLoaded('areas')
                ? $user->areas
                    ->filter(fn (Area $area) => (bool) $area->pivot->activo)
                    ->values()
                    ->map(fn (Area $area) => [
                        'id' => $area->id,
                        'nombre' => $area->nombre,
                        'ubicacion' => $area->ubicacion,
                        'sede' => $area->sede ? [
                            'id' => $area->sede->id,
                            'nombre' => $area->sede->nombre,
                        ] : null,
                    ])
                : [],
        ];
    }
}
