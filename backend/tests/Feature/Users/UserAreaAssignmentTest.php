<?php

namespace Tests\Feature\Users;

use App\Models\Area;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Valoracion\ValoracionTestCase;

class UserAreaAssignmentTest extends ValoracionTestCase
{
    public function test_administrator_assigns_multiple_available_areas_when_setting_responsible_role(): void
    {
        $administrator = $this->userWithRole('Subdirector Administrativo');
        $candidate = $this->userWithRole('Usuario Registrado');
        $areaIds = Area::query()->orderBy('id')->limit(2)->pluck('id')->all();

        Sanctum::actingAs($administrator);

        $this->putJson("/api/usuarios/{$candidate->id}", [
            'rol' => 'Responsable del Lugar',
            'area_ids' => $areaIds,
        ])
            ->assertOk()
            ->assertJsonPath('data.rol', 'Responsable del Lugar')
            ->assertJsonCount(2, 'data.areas');

        $this->assertSame('Responsable del Lugar', $candidate->fresh()->tipoUsuario->nombre);
        foreach ($areaIds as $areaId) {
            $this->assertDatabaseHas('usuario_area', [
                'usuario_id' => $candidate->id,
                'area_id' => $areaId,
                'activo' => true,
            ]);
        }
    }

    public function test_responsible_role_requires_at_least_one_area_and_does_not_partially_change_user(): void
    {
        $administrator = $this->userWithRole('Subdirector Administrativo');
        $candidate = $this->userWithRole('Usuario Registrado');

        Sanctum::actingAs($administrator);

        $this->putJson("/api/usuarios/{$candidate->id}", [
            'rol' => 'Responsable del Lugar',
            'area_ids' => [],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('area_ids');

        $this->assertSame('Usuario Registrado', $candidate->fresh()->tipoUsuario->nombre);
        $this->assertDatabaseMissing('usuario_area', [
            'usuario_id' => $candidate->id,
            'activo' => true,
        ]);
    }

    public function test_area_with_an_active_responsible_cannot_be_assigned_to_another_user(): void
    {
        $administrator = $this->userWithRole('Subdirector Administrativo');
        $firstResponsible = $this->userWithRole('Responsable del Lugar');
        $candidate = $this->userWithRole('Usuario Registrado');
        $area = Area::query()->firstOrFail();
        $firstResponsible->areas()->attach($area->id, ['activo' => true]);

        Sanctum::actingAs($administrator);

        $this->putJson("/api/usuarios/{$candidate->id}", [
            'rol' => 'Responsable del Lugar',
            'area_ids' => [$area->id],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('area_ids');

        $this->assertSame('Usuario Registrado', $candidate->fresh()->tipoUsuario->nombre);
        $this->assertDatabaseHas('usuario_area', [
            'usuario_id' => $firstResponsible->id,
            'area_id' => $area->id,
            'activo' => true,
        ]);
    }

    public function test_inactive_user_cannot_receive_responsible_role_or_areas(): void
    {
        $administrator = $this->userWithRole('Subdirector Administrativo');
        $candidate = $this->userWithRole('Usuario Registrado');
        $candidate->update(['activo' => false]);
        $area = Area::query()->firstOrFail();

        Sanctum::actingAs($administrator);

        $this->putJson("/api/usuarios/{$candidate->id}", [
            'rol' => 'Responsable del Lugar',
            'area_ids' => [$area->id],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('usuario');

        $this->assertSame('Usuario Registrado', $candidate->fresh()->tipoUsuario->nombre);
        $this->assertDatabaseMissing('usuario_area', [
            'usuario_id' => $candidate->id,
            'activo' => true,
        ]);
    }

    public function test_editing_assignments_deactivates_omitted_areas_and_keeps_new_selection_active(): void
    {
        $administrator = $this->userWithRole('Subdirector Administrativo');
        $responsible = $this->userWithRole('Responsable del Lugar');
        [$firstArea, $secondArea] = Area::query()->orderBy('id')->limit(2)->get();
        $responsible->areas()->attach($firstArea->id, ['activo' => true]);

        Sanctum::actingAs($administrator);

        $this->putJson("/api/usuarios/{$responsible->id}/rol", [
            'rol' => 'Responsable del Lugar',
            'area_ids' => [$secondArea->id],
        ])->assertOk()->assertJsonPath('data.areas.0.id', $secondArea->id);

        $this->assertDatabaseHas('usuario_area', [
            'usuario_id' => $responsible->id,
            'area_id' => $firstArea->id,
            'activo' => false,
        ]);
        $this->assertDatabaseHas('usuario_area', [
            'usuario_id' => $responsible->id,
            'area_id' => $secondArea->id,
            'activo' => true,
        ]);
    }

    public function test_changing_away_from_responsible_role_releases_all_areas(): void
    {
        $administrator = $this->userWithRole('Subdirector Administrativo');
        $responsible = $this->userWithRole('Responsable del Lugar');
        $area = Area::query()->firstOrFail();
        $responsible->areas()->attach($area->id, ['activo' => true]);

        Sanctum::actingAs($administrator);

        $this->putJson("/api/usuarios/{$responsible->id}", [
            'rol' => 'Usuario Registrado',
        ])->assertOk()->assertJsonPath('data.areas', []);

        $this->assertDatabaseHas('usuario_area', [
            'usuario_id' => $responsible->id,
            'area_id' => $area->id,
            'activo' => false,
        ]);
    }

    public function test_area_catalog_reports_occupancy_and_regular_users_cannot_manage_assignments(): void
    {
        $administrator = $this->userWithRole('Subdirector Administrativo');
        $responsible = $this->userWithRole('Responsable del Lugar');
        $regularUser = $this->userWithRole('Usuario Registrado');
        $area = Area::query()->firstOrFail();
        $responsible->areas()->attach($area->id, ['activo' => true]);

        Sanctum::actingAs($administrator);
        $this->getJson('/api/usuarios/areas-disponibles')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $responsible->id,
                'name' => $responsible->name,
            ]);

        Sanctum::actingAs($regularUser);
        $this->putJson("/api/usuarios/{$responsible->id}", [
            'rol' => 'Responsable del Lugar',
            'area_ids' => [$area->id],
        ])->assertForbidden();
    }

    public function test_authenticated_responsible_receives_only_active_areas_in_session_payload(): void
    {
        $responsible = $this->userWithRole('Responsable del Lugar');
        [$activeArea, $inactiveArea] = Area::query()->orderBy('id')->limit(2)->get();
        $responsible->areas()->attach($activeArea->id, ['activo' => true]);
        $responsible->areas()->attach($inactiveArea->id, ['activo' => false]);
        Sanctum::actingAs($responsible);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonCount(1, 'areas')
            ->assertJsonPath('areas.0.id', $activeArea->id)
            ->assertJsonPath('areas.0.nombre', $activeArea->nombre);
    }

    public function test_database_allows_only_one_active_assignment_per_area(): void
    {
        $firstResponsible = $this->userWithRole('Responsable del Lugar');
        $secondResponsible = $this->userWithRole('Responsable del Lugar');
        $area = Area::query()->firstOrFail();
        $timestamp = now();

        DB::table('usuario_area')->insert([
            'usuario_id' => $firstResponsible->id,
            'area_id' => $area->id,
            'activo' => true,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);

        $this->expectException(QueryException::class);
        DB::table('usuario_area')->insert([
            'usuario_id' => $secondResponsible->id,
            'area_id' => $area->id,
            'activo' => true,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ]);
    }
}
