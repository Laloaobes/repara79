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
use Tests\TestCase;

abstract class ValoracionTestCase extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CatalogosTicketsSeeder::class);
    }

    protected function userWithRole(string $role): User
    {
        return User::factory()->create([
            'tipo_usuario_id' => TipoUsuario::query()->where('nombre', $role)->value('id'),
            'activo' => true,
        ]);
    }

    protected function ticket(string $state = 'Valorado', array $attributes = []): Ticket
    {
        return Ticket::query()->create([
            'usuario_id' => $attributes['usuario_id'] ?? $this->userWithRole('Usuario Registrado')->id,
            'area_id' => $attributes['area_id'] ?? Area::query()->value('id'),
            'tipo_desperfecto_id' => $attributes['tipo_desperfecto_id'] ?? TipoDesperfecto::query()->value('id'),
            'estado_id' => EstadoTicket::query()->where('nombre', $state)->value('id'),
            'prioridad_id' => $attributes['prioridad_id'] ?? PrioridadTicket::query()->value('id_prioridad'),
            'titulo' => $attributes['titulo'] ?? 'Ticket administrativo',
            'descripcion_desperfecto' => $attributes['descripcion_desperfecto'] ?? 'Descripción del desperfecto',
            'ubicacion' => $attributes['ubicacion'] ?? 'Edificio A',
            'fecha_reporte' => now(),
            'created_at' => $attributes['created_at'] ?? now(),
            'updated_at' => $attributes['updated_at'] ?? now(),
        ]);
    }

    protected function valoracion(
        User $author,
        Ticket $ticket,
        string $state = 'Pendiente de autorización',
        array $attributes = [],
        ?array $materials = null
    ): Valoracion {
        $valoracion = Valoracion::query()->create([
            'ticket_id' => $ticket->id,
            'estado_general' => $state,
            'observaciones' => $attributes['observaciones'] ?? 'Se requiere material y reparación.',
            'motivo_rechazo' => $attributes['motivo_rechazo'] ?? null,
            'veces_revisada' => $attributes['veces_revisada'] ?? 0,
            'valorado_por' => $author->id,
            'validado_por' => $attributes['validado_por'] ?? null,
            'fecha_creacion' => $attributes['fecha_creacion'] ?? now(),
            'fecha_validacion' => $attributes['fecha_validacion'] ?? null,
        ]);

        foreach ($materials ?? [
            ['nombre_material' => 'Cable', 'cantidad' => 2, 'costo_unitario' => 10.25],
        ] as $material) {
            $valoracion->materialesTicket()->create($material);
        }

        return $valoracion;
    }
}
