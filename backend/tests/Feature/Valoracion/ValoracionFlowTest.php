<?php

namespace Tests\Feature\Valoracion;

use App\Models\Area;
use App\Models\EstadoTicket;
use App\Models\PrioridadTicket;
use App\Models\Ticket;
use App\Models\TipoDesperfecto;
use App\Models\TipoUsuario;
use App\Models\User;
use App\Models\Valoracion;
use Database\Seeders\CatalogosTicketsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ValoracionFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(CatalogosTicketsSeeder::class);
    }

    public function test_personal_mantenimiento_can_filter_pending_tickets_on_server(): void
    {
        $maintenance = $this->userWithRole('Personal de Mantenimiento');
        $areaA = Area::query()->orderBy('id')->firstOrFail();
        $areaB = Area::query()->whereKeyNot($areaA->id)->firstOrFail();

        $oldTicket = $this->ticket('Pendiente', [
            'area_id' => $areaA->id,
            'titulo' => 'Fuga antigua',
            'created_at' => now()->subDay(),
        ]);
        $newTicket = $this->ticket('Pendiente', [
            'area_id' => $areaB->id,
            'titulo' => 'Luminaria laboratorio',
            'created_at' => now(),
        ]);
        $this->ticket('Valorado', ['titulo' => 'Ticket ya valorado']);

        Sanctum::actingAs($maintenance);

        $this->getJson('/api/tickets?estado=Pendiente&sort=fecha_asc')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $oldTicket->id)
            ->assertJsonPath('data.1.id', $newTicket->id);

        $this->getJson("/api/tickets?estado=Pendiente&area_id={$areaB->id}&search=TK-".str_pad((string) $newTicket->id, 3, '0', STR_PAD_LEFT))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $newTicket->id);

        $this->getJson('/api/tickets?estado=Pendiente&sort=no_permitido')
            ->assertUnprocessable();
    }

    public function test_non_maintenance_roles_cannot_register_a_valoracion(): void
    {
        $ticket = $this->ticket();

        foreach ([
            'Subdirector Administrativo',
            'Responsable del Lugar',
            'Usuario Registrado',
        ] as $role) {
            Sanctum::actingAs($this->userWithRole($role));

            $this->postJson('/api/valoraciones', $this->validPayload($ticket))
                ->assertForbidden();
        }

        $this->assertDatabaseCount('solicitudes_materiales', 0);
        $this->assertDatabaseCount('materiales_ticket', 0);
    }

    public function test_maintenance_can_inspect_any_ticket_but_regular_user_cannot_infer_another_ticket(): void
    {
        $ticket = $this->ticket();
        Sanctum::actingAs($this->userWithRole('Personal de Mantenimiento'));

        $this->getJson("/api/tickets/{$ticket->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $ticket->id)
            ->assertJsonPath('data.area.id', $ticket->area_id)
            ->assertJsonPath('data.estado.nombre', 'Pendiente');

        Sanctum::actingAs($this->userWithRole('Usuario Registrado'));
        $this->getJson("/api/tickets/{$ticket->id}")
            ->assertNotFound();
    }

    public function test_registers_complete_valoracion_and_returns_decimal_contract(): void
    {
        $maintenance = $this->userWithRole('Personal de Mantenimiento');
        $ticket = $this->ticket();
        Sanctum::actingAs($maintenance);

        $payload = $this->validPayload($ticket, [
            ['descripcion' => 'Cable', 'cantidad' => 3, 'costo_unitario' => 12.50],
            ['descripcion' => 'Interruptor', 'cantidad' => 2, 'costo_unitario' => 20],
            ['descripcion' => 'Material disponible', 'cantidad' => 1, 'costo_unitario' => 0],
        ]);
        $payload['estado'] = 'Autorizada';
        $payload['valorado_por'] = 999999;
        $payload['fecha_creacion'] = '2000-01-01 00:00:00';
        $payload['costo_estimado'] = '0.01';

        $response = $this->postJson('/api/valoraciones', $payload)
            ->assertCreated()
            ->assertJsonPath('data.estado', 'Pendiente de autorización')
            ->assertJsonPath('data.valorado_por', $maintenance->id)
            ->assertJsonPath('data.materiales.0.descripcion', 'Cable')
            ->assertJsonPath('data.materiales.0.cantidad', 3)
            ->assertJsonPath('data.materiales.0.costo_unitario', '12.50')
            ->assertJsonPath('data.materiales.0.subtotal', '37.50')
            ->assertJsonPath('data.materiales.1.subtotal', '40.00')
            ->assertJsonPath('data.costo_estimado', '77.50');

        $valoracionId = $response->json('data.id');

        $this->assertDatabaseHas('solicitudes_materiales', [
            'id' => $valoracionId,
            'ticket_id' => $ticket->id,
            'estado_general' => 'Pendiente de autorización',
            'valorado_por' => $maintenance->id,
        ]);
        $this->assertDatabaseHas('materiales_ticket', [
            'solicitud_id' => $valoracionId,
            'nombre_material' => 'Cable',
            'cantidad' => 3,
            'costo_unitario' => 12.50,
        ]);
        $this->assertSame(
            'Valorado',
            $ticket->fresh()->estado->nombre
        );
    }

    public function test_requires_observations_and_at_least_one_valid_material(): void
    {
        Sanctum::actingAs($this->userWithRole('Personal de Mantenimiento'));

        $this->postJson('/api/valoraciones', [
            'ticket_id' => $this->ticket()->id,
            'observaciones' => ' ',
            'materiales' => [],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['observaciones', 'materiales']);

        $this->postJson('/api/valoraciones', $this->validPayload($this->ticket(), [
            ['descripcion' => 'Cantidad cero', 'cantidad' => 0, 'costo_unitario' => 0],
            ['descripcion' => 'Cantidad negativa', 'cantidad' => -1, 'costo_unitario' => 1],
            ['descripcion' => 'Cantidad decimal', 'cantidad' => 1.5, 'costo_unitario' => 1],
            ['descripcion' => 'Costo negativo', 'cantidad' => 1, 'costo_unitario' => -1],
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'materiales.0.cantidad',
                'materiales.1.cantidad',
                'materiales.2.cantidad',
                'materiales.3.costo_unitario',
            ]);

        $this->assertDatabaseCount('solicitudes_materiales', 0);
    }

    public function test_rejects_non_pending_ticket_without_partial_changes(): void
    {
        $maintenance = $this->userWithRole('Personal de Mantenimiento');
        $ticket = $this->ticket('Autorizado');
        Sanctum::actingAs($maintenance);

        $this->postJson('/api/valoraciones', $this->validPayload($ticket))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ticket_id');

        $this->assertDatabaseCount('solicitudes_materiales', 0);
        $this->assertDatabaseCount('materiales_ticket', 0);
        $this->assertSame('Autorizado', $ticket->fresh()->estado->nombre);
    }

    public function test_a_ticket_can_only_be_valued_once_and_retry_is_controlled(): void
    {
        $ticket = $this->ticket();
        Sanctum::actingAs($this->userWithRole('Personal de Mantenimiento'));

        $this->postJson('/api/valoraciones', $this->validPayload($ticket))
            ->assertCreated();

        $this->postJson('/api/valoraciones', $this->validPayload($ticket))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ticket_id');

        $this->assertDatabaseCount('solicitudes_materiales', 1);
        $this->assertDatabaseCount('materiales_ticket', 1);
    }

    public function test_missing_required_catalog_state_rolls_back_everything(): void
    {
        $ticket = $this->ticket();
        EstadoTicket::query()->where('nombre', 'Valorado')->delete();
        Sanctum::actingAs($this->userWithRole('Personal de Mantenimiento'));

        $this->postJson('/api/valoraciones', $this->validPayload($ticket))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('catalogo');

        $this->assertDatabaseCount('solicitudes_materiales', 0);
        $this->assertDatabaseCount('materiales_ticket', 0);
        $this->assertSame('Pendiente', $ticket->fresh()->estado->nombre);
    }

    public function test_own_valoraciones_returns_only_authenticated_author_and_no_delete_route_exists(): void
    {
        $author = $this->userWithRole('Personal de Mantenimiento');
        $other = $this->userWithRole('Personal de Mantenimiento');
        $own = $this->createValoracion($author, $this->ticket());
        $this->createValoracion($other, $this->ticket());
        Sanctum::actingAs($author);

        $this->getJson('/api/valoraciones/mis-valoraciones')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $own->id)
            ->assertJsonPath('data.0.materiales.0.cantidad', 2)
            ->assertJsonPath('data.0.materiales.0.costo_unitario', '10.25')
            ->assertJsonPath('data.0.materiales.0.subtotal', '20.50')
            ->assertJsonPath('data.0.costo_estimado', '20.50');

        $this->deleteJson("/api/valoraciones/{$own->id}/materiales/0")
            ->assertNotFound();
    }

    private function userWithRole(string $role): User
    {
        return User::factory()->create([
            'tipo_usuario_id' => TipoUsuario::query()->where('nombre', $role)->value('id'),
            'activo' => true,
        ]);
    }

    private function ticket(string $state = 'Pendiente', array $attributes = []): Ticket
    {
        return Ticket::query()->create([
            'usuario_id' => $attributes['usuario_id'] ?? $this->userWithRole('Usuario Registrado')->id,
            'area_id' => $attributes['area_id'] ?? Area::query()->value('id'),
            'tipo_desperfecto_id' => $attributes['tipo_desperfecto_id'] ?? TipoDesperfecto::query()->value('id'),
            'estado_id' => EstadoTicket::query()->where('nombre', $state)->value('id'),
            'prioridad_id' => $attributes['prioridad_id'] ?? PrioridadTicket::query()->value('id_prioridad'),
            'titulo' => $attributes['titulo'] ?? 'Ticket de prueba',
            'descripcion_desperfecto' => $attributes['descripcion_desperfecto'] ?? 'Descripción de prueba',
            'ubicacion' => $attributes['ubicacion'] ?? 'Edificio A',
            'fecha_reporte' => $attributes['fecha_reporte'] ?? now(),
            'created_at' => $attributes['created_at'] ?? now(),
            'updated_at' => $attributes['updated_at'] ?? now(),
        ]);
    }

    private function validPayload(Ticket $ticket, ?array $materials = null): array
    {
        return [
            'ticket_id' => $ticket->id,
            'observaciones' => 'Se requiere reemplazar el componente.',
            'materiales' => $materials ?? [
                ['descripcion' => 'Cable', 'cantidad' => 2, 'costo_unitario' => 10.25],
            ],
        ];
    }

    private function createValoracion(User $author, Ticket $ticket): Valoracion
    {
        $valoracion = Valoracion::query()->create([
            'ticket_id' => $ticket->id,
            'estado_general' => 'Pendiente de autorización',
            'observaciones' => 'Observaciones',
            'valorado_por' => $author->id,
            'fecha_creacion' => now(),
        ]);
        $valoracion->materialesTicket()->create([
            'nombre_material' => 'Cable',
            'cantidad' => 2,
            'costo_unitario' => 10.25,
        ]);

        return $valoracion;
    }
}
