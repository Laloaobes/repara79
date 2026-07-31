<?php

namespace Tests\Feature\Valoracion;

use Laravel\Sanctum\Sanctum;

class ValoracionResubmissionTest extends ValoracionTestCase
{
    public function test_author_can_sync_materials_and_resubmit_rejected_valoracion(): void
    {
        $author = $this->userWithRole('Personal de Mantenimiento');
        $reviewer = $this->userWithRole('Subdirector Administrativo');
        $valoracion = $this->valoracion(
            $author,
            $this->ticket('Rechazado'),
            'Rechazada',
            [
                'motivo_rechazo' => 'Corregir cantidades.',
                'veces_revisada' => 2,
                'validado_por' => $reviewer->id,
                'fecha_validacion' => now(),
            ],
            [
                ['nombre_material' => 'Cable', 'cantidad' => 2, 'costo_unitario' => 10],
                ['nombre_material' => 'Material a retirar', 'cantidad' => 1, 'costo_unitario' => 5],
            ]
        );
        $materials = $valoracion->materialesTicket()->orderBy('id')->get();
        Sanctum::actingAs($author);

        $this->putJson("/api/valoraciones/{$valoracion->id}/reenviar", [
            'observaciones' => '  Observaciones corregidas.  ',
            'materiales' => [
                [
                    'id' => $materials[0]->id,
                    'descripcion' => 'Cable actualizado',
                    'cantidad' => 3,
                    'costo_unitario' => 12.50,
                ],
                [
                    'descripcion' => 'Interruptor nuevo',
                    'cantidad' => 1,
                    'costo_unitario' => 20,
                ],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.estado', 'Pendiente de autorización')
            ->assertJsonPath('data.observaciones', 'Observaciones corregidas.')
            ->assertJsonPath('data.motivo_rechazo', null)
            ->assertJsonPath('data.validado_por', null)
            ->assertJsonPath('data.fecha_validacion', null)
            ->assertJsonPath('data.veces_revisada', 2)
            ->assertJsonPath('data.ticket.estado.nombre', 'Valorado')
            ->assertJsonPath('data.costo_estimado', '57.50');

        $valoracion->refresh();
        $this->assertSame('Pendiente de autorización', $valoracion->estado_general);
        $this->assertSame(2, $valoracion->veces_revisada);
        $this->assertNull($valoracion->validado_por);
        $this->assertNull($valoracion->fecha_validacion);
        $this->assertDatabaseMissing('materiales_ticket', ['id' => $materials[1]->id]);
        $this->assertDatabaseHas('materiales_ticket', [
            'id' => $materials[0]->id,
            'nombre_material' => 'Cable actualizado',
            'cantidad' => 3,
        ]);
        $this->assertDatabaseHas('materiales_ticket', [
            'solicitud_id' => $valoracion->id,
            'nombre_material' => 'Interruptor nuevo',
        ]);
    }

    public function test_another_maintenance_user_receives_not_found_and_cannot_modify(): void
    {
        $owner = $this->userWithRole('Personal de Mantenimiento');
        $valoracion = $this->valoracion($owner, $this->ticket('Rechazado'), 'Rechazada', [
            'motivo_rechazo' => 'Corregir',
        ]);
        Sanctum::actingAs($this->userWithRole('Personal de Mantenimiento'));

        $this->putJson("/api/valoraciones/{$valoracion->id}/reenviar", [
            'observaciones' => '',
            'materiales' => [],
        ])
            ->assertNotFound();

        $this->assertSame('Rechazada', $valoracion->fresh()->estado_general);
    }

    public function test_non_rejected_valoracion_cannot_be_resubmitted(): void
    {
        $owner = $this->userWithRole('Personal de Mantenimiento');
        $valoracion = $this->valoracion($owner, $this->ticket(), 'Pendiente de autorización');
        Sanctum::actingAs($owner);

        $this->putJson("/api/valoraciones/{$valoracion->id}/reenviar", $this->payload($valoracion))
            ->assertUnprocessable();

        $this->assertSame('Pendiente de autorización', $valoracion->fresh()->estado_general);
        $this->assertSame('Valorado', $valoracion->ticket->fresh()->estado->nombre);
    }

    public function test_material_from_another_valoracion_is_rejected_and_transaction_rolls_back(): void
    {
        $owner = $this->userWithRole('Personal de Mantenimiento');
        $valoracion = $this->valoracion($owner, $this->ticket('Rechazado'), 'Rechazada', [
            'observaciones' => 'Original',
            'motivo_rechazo' => 'Corregir',
        ]);
        $other = $this->valoracion(
            $this->userWithRole('Personal de Mantenimiento'),
            $this->ticket('Rechazado'),
            'Rechazada'
        );
        $foreignMaterial = $other->materialesTicket()->firstOrFail();
        Sanctum::actingAs($owner);

        $this->putJson("/api/valoraciones/{$valoracion->id}/reenviar", [
            'observaciones' => 'Intento inválido',
            'materiales' => [[
                'id' => $foreignMaterial->id,
                'descripcion' => 'Material ajeno',
                'cantidad' => 1,
                'costo_unitario' => 1,
            ]],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('materiales');

        $this->assertSame('Original', $valoracion->fresh()->observaciones);
        $this->assertSame('Rechazada', $valoracion->estado_general);
        $this->assertSame('Rechazado', $valoracion->ticket->fresh()->estado->nombre);
    }

    public function test_other_role_and_invalid_payload_cannot_resubmit(): void
    {
        $owner = $this->userWithRole('Personal de Mantenimiento');
        $valoracion = $this->valoracion($owner, $this->ticket('Rechazado'), 'Rechazada');

        Sanctum::actingAs($this->userWithRole('Subdirector Administrativo'));
        $this->putJson("/api/valoraciones/{$valoracion->id}/reenviar", $this->payload($valoracion))
            ->assertForbidden();

        Sanctum::actingAs($owner);
        $this->putJson("/api/valoraciones/{$valoracion->id}/reenviar", [
            'observaciones' => '',
            'materiales' => [],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['observaciones', 'materiales']);

        $this->assertSame('Rechazada', $valoracion->fresh()->estado_general);
    }

    private function payload($valoracion): array
    {
        $material = $valoracion->materialesTicket()->firstOrFail();

        return [
            'observaciones' => 'Corregida',
            'materiales' => [[
                'id' => $material->id,
                'descripcion' => $material->nombre_material,
                'cantidad' => $material->cantidad,
                'costo_unitario' => $material->costo_unitario,
            ]],
        ];
    }
}
