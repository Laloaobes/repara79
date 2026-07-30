<?php

namespace Tests\Feature\Valoracion;

use App\Models\Area;
use App\Models\EstadoTicket;
use Laravel\Sanctum\Sanctum;

class ValoracionAuthorizationTest extends ValoracionTestCase
{
    public function test_admin_can_search_filter_sort_and_view_pending_detail(): void
    {
        $admin = $this->userWithRole('Subdirector Administrativo');
        $author = $this->userWithRole('Personal de Mantenimiento');
        $areaA = Area::query()->orderBy('id')->firstOrFail();
        $areaB = Area::query()->where('id', '!=', $areaA->id)->firstOrFail();

        $low = $this->valoracion(
            $author,
            $this->ticket('Valorado', ['area_id' => $areaA->id, 'titulo' => 'Fuga en lavabo']),
            attributes: ['fecha_creacion' => now()->subDay()],
            materials: [['nombre_material' => 'Sello', 'cantidad' => 1, 'costo_unitario' => 5]]
        );
        $high = $this->valoracion(
            $author,
            $this->ticket('Valorado', ['area_id' => $areaB->id, 'titulo' => 'Cableado laboratorio']),
            attributes: ['fecha_creacion' => now()],
            materials: [['nombre_material' => 'Cable', 'cantidad' => 10, 'costo_unitario' => 20]]
        );
        $this->valoracion($author, $this->ticket('Autorizado'), 'Autorizada');

        Sanctum::actingAs($admin);

        $this->getJson('/api/valoraciones/pendientes?sort=costo_desc')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $high->id)
            ->assertJsonPath('data.1.id', $low->id);

        $this->getJson('/api/valoraciones/pendientes?sort=costo_asc')
            ->assertOk()
            ->assertJsonPath('data.0.id', $low->id)
            ->assertJsonPath('data.1.id', $high->id);

        $this->getJson('/api/valoraciones/pendientes?sort=fecha_asc')
            ->assertOk()
            ->assertJsonPath('data.0.id', $low->id)
            ->assertJsonPath('data.1.id', $high->id);

        $this->getJson('/api/valoraciones/pendientes?sort=fecha_desc')
            ->assertOk()
            ->assertJsonPath('data.0.id', $high->id)
            ->assertJsonPath('data.1.id', $low->id);

        $this->getJson("/api/valoraciones/pendientes?area_id={$areaA->id}&search=TK-".str_pad((string) $low->ticket_id, 3, '0', STR_PAD_LEFT))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $low->id);

        $this->getJson('/api/valoraciones/pendientes?search=Cableado')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $high->id);

        $this->getJson("/api/valoraciones/{$high->id}")
            ->assertOk()
            ->assertJsonPath('data.ticket.titulo', 'Cableado laboratorio')
            ->assertJsonPath('data.ticket.area.id', $areaB->id)
            ->assertJsonPath('data.ticket.usuario.id', $high->ticket->usuario_id)
            ->assertJsonPath('data.tecnico.id', $author->id)
            ->assertJsonPath('data.materiales.0.cantidad', 10)
            ->assertJsonPath('data.materiales.0.subtotal', '200.00')
            ->assertJsonPath('data.costo_estimado', '200.00');

        $this->getJson('/api/valoraciones/pendientes?sort=invalido')
            ->assertUnprocessable();
        $this->getJson('/api/valoraciones/999999')
            ->assertNotFound();
    }

    public function test_non_admin_roles_receive_forbidden_for_administrative_endpoints(): void
    {
        $author = $this->userWithRole('Personal de Mantenimiento');
        $valoracion = $this->valoracion($author, $this->ticket());

        foreach ([
            'Personal de Mantenimiento',
            'Responsable del Lugar',
            'Usuario Registrado',
        ] as $role) {
            Sanctum::actingAs($this->userWithRole($role));
            $this->getJson('/api/valoraciones/pendientes')->assertForbidden();
            $this->getJson("/api/valoraciones/{$valoracion->id}")->assertForbidden();
            $this->postJson("/api/valoraciones/{$valoracion->id}/autorizar")->assertForbidden();
        }
    }

    public function test_authorization_changes_both_states_and_records_reviewer_atomically(): void
    {
        $admin = $this->userWithRole('Subdirector Administrativo');
        $valoracion = $this->valoracion(
            $this->userWithRole('Personal de Mantenimiento'),
            $this->ticket()
        );
        Sanctum::actingAs($admin);

        $this->postJson("/api/valoraciones/{$valoracion->id}/autorizar")
            ->assertOk()
            ->assertJsonPath('data.estado', 'Autorizada')
            ->assertJsonPath('data.validado_por', $admin->id)
            ->assertJsonPath('data.veces_revisada', 1)
            ->assertJsonPath('data.ticket.estado.nombre', 'Autorizado');

        $this->assertDatabaseHas('solicitudes_materiales', [
            'id' => $valoracion->id,
            'estado_general' => 'Autorizada',
            'validado_por' => $admin->id,
            'veces_revisada' => 1,
        ]);
        $this->assertNotNull($valoracion->fresh()->fecha_validacion);
    }

    public function test_rejection_requires_trimmed_reason_and_changes_both_states(): void
    {
        $admin = $this->userWithRole('Subdirector Administrativo');
        $valoracion = $this->valoracion(
            $this->userWithRole('Personal de Mantenimiento'),
            $this->ticket()
        );
        Sanctum::actingAs($admin);

        $this->postJson("/api/valoraciones/{$valoracion->id}/rechazar", [
            'motivo_rechazo' => '   ',
        ])->assertUnprocessable()->assertJsonValidationErrors('motivo_rechazo');

        $this->postJson("/api/valoraciones/{$valoracion->id}/rechazar", [
            'motivo_rechazo' => '  Ajustar cantidades.  ',
        ])
            ->assertOk()
            ->assertJsonPath('data.estado', 'Rechazada')
            ->assertJsonPath('data.motivo_rechazo', 'Ajustar cantidades.')
            ->assertJsonPath('data.ticket.estado.nombre', 'Rechazado')
            ->assertJsonPath('data.veces_revisada', 1);
    }

    public function test_second_or_mismatched_decision_is_rejected_without_changes(): void
    {
        $admin = $this->userWithRole('Subdirector Administrativo');
        $valoracion = $this->valoracion(
            $this->userWithRole('Personal de Mantenimiento'),
            $this->ticket()
        );
        Sanctum::actingAs($admin);

        $this->postJson("/api/valoraciones/{$valoracion->id}/autorizar")->assertOk();
        $reviewedAt = $valoracion->fresh()->fecha_validacion;

        $this->postJson("/api/valoraciones/{$valoracion->id}/rechazar", [
            'motivo_rechazo' => 'Segundo intento',
        ])->assertUnprocessable();

        $valoracion->refresh();
        $this->assertSame('Autorizada', $valoracion->estado_general);
        $this->assertSame(1, $valoracion->veces_revisada);
        $this->assertTrue($reviewedAt->equalTo($valoracion->fecha_validacion));

        $mismatch = $this->valoracion(
            $this->userWithRole('Personal de Mantenimiento'),
            $this->ticket('Rechazado')
        );
        $this->postJson("/api/valoraciones/{$mismatch->id}/autorizar")
            ->assertUnprocessable();
        $this->assertSame('Pendiente de autorización', $mismatch->fresh()->estado_general);
    }

    public function test_missing_material_or_catalog_rolls_back_decision(): void
    {
        $admin = $this->userWithRole('Subdirector Administrativo');
        $withoutMaterials = $this->valoracion(
            $this->userWithRole('Personal de Mantenimiento'),
            $this->ticket(),
            materials: []
        );
        Sanctum::actingAs($admin);

        $this->postJson("/api/valoraciones/{$withoutMaterials->id}/autorizar")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('materiales');
        $this->assertSame('Valorado', $withoutMaterials->ticket->fresh()->estado->nombre);

        $withMaterial = $this->valoracion(
            $this->userWithRole('Personal de Mantenimiento'),
            $this->ticket()
        );
        EstadoTicket::query()->where('nombre', 'Autorizado')->delete();

        $this->postJson("/api/valoraciones/{$withMaterial->id}/autorizar")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('catalogo');
        $this->assertSame('Pendiente de autorización', $withMaterial->fresh()->estado_general);
        $this->assertSame('Valorado', $withMaterial->ticket->fresh()->estado->nombre);
    }
}
