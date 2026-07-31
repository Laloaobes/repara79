<?php

namespace Tests\Feature\Storage;

use App\Models\Area;
use App\Models\EstadoTicket;
use App\Models\PrioridadTicket;
use App\Models\Ticket;
use App\Models\TipoDesperfecto;
use App\Models\TipoUsuario;
use App\Models\User;
use App\Support\StoragePath;
use Database\Seeders\CatalogosTicketsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StorageInfrastructureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CatalogosTicketsSeeder::class);
    }

    public function test_ticket_reference_is_stored_on_demand_with_relative_organized_path(): void
    {
        Storage::fake('public');
        $user = $this->userWithRole('Usuario Registrado');
        Sanctum::actingAs($user);

        $response = $this->post('/api/tickets', [
            ...$this->validTicketPayload(),
            'fotografia_referencia' => UploadedFile::fake()->image('reporte.jpeg', 1200, 900)->size(500),
        ])->assertCreated();

        $ticket = Ticket::query()->findOrFail($response->json('data.id'));

        $this->assertMatchesRegularExpression(
            "#^evidencias/ticket-{$ticket->id}/referencia/[0-9a-f-]{36}\\.jpg$#",
            $ticket->fotografia_referencia
        );
        Storage::disk('public')->assertExists($ticket->fotografia_referencia);
        $response->assertJsonPath(
            'data.fotografia_referencia_url',
            url('/storage/'.$ticket->fotografia_referencia)
        );
        $response->assertJsonMissingPath('data.fotografia_referencia');
    }

    public function test_ticket_without_reference_does_not_create_a_directory(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->userWithRole('Usuario Registrado'));

        $this->postJson('/api/tickets', $this->validTicketPayload())
            ->assertCreated()
            ->assertJsonPath('data.fotografia_referencia_url', null);

        $this->assertSame([], Storage::disk('public')->allFiles('evidencias'));
    }

    public function test_only_jpeg_png_and_webp_images_are_accepted(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->userWithRole('Usuario Registrado'));

        $this->withHeader('Accept', 'application/json')->post('/api/tickets', [
            ...$this->validTicketPayload(),
            'fotografia_referencia' => UploadedFile::fake()->createWithContent('archivo.jpg', 'no es una imagen'),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('fotografia_referencia');

        $this->withHeader('Accept', 'application/json')->post('/api/tickets', [
            ...$this->validTicketPayload(),
            'fotografia_referencia' => UploadedFile::fake()->image('archivo.gif'),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('fotografia_referencia');

        $this->assertDatabaseCount('tickets', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_each_supported_image_format_keeps_its_real_normalized_extension(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->userWithRole('Usuario Registrado'));

        foreach (['jpeg' => 'jpg', 'png' => 'png', 'webp' => 'webp'] as $input => $stored) {
            $response = $this->post('/api/tickets', [
                ...$this->validTicketPayload(),
                'fotografia_referencia' => UploadedFile::fake()->image("referencia.{$input}"),
            ])->assertCreated();

            $path = Ticket::query()->findOrFail($response->json('data.id'))->fotografia_referencia;
            $this->assertStringEndsWith(".{$stored}", $path);
            Storage::disk('public')->assertExists($path);
        }
    }

    public function test_users_receive_a_stable_unique_profile_uuid_without_creating_avatar_files(): void
    {
        Storage::fake('public');
        $first = User::factory()->create();
        $second = User::factory()->create();

        $this->assertNotNull($first->profile_uuid);
        $this->assertNotSame($first->profile_uuid, $second->profile_uuid);
        $this->assertSame($first->profile_uuid, $first->fresh()->profile_uuid);
        $this->assertSame([], Storage::disk('public')->allFiles('perfiles'));
    }

    public function test_legacy_reference_command_moves_file_and_is_idempotent(): void
    {
        Storage::fake('public');
        $ticket = $this->ticket([
            'fotografia_referencia' => 'tickets/evidencias/archivo-anterior.jpg',
        ]);
        Storage::disk('public')->put($ticket->fotografia_referencia, 'contenido-jpeg');

        // Storage::fake no puede inferir el MIME de contenido arbitrario; usamos una imagen real de prueba.
        $image = UploadedFile::fake()->image('original.jpg', 10, 10);
        Storage::disk('public')->put(
            $ticket->fotografia_referencia,
            file_get_contents($image->getPathname())
        );

        $this->artisan('storage:migrate-ticket-references')->assertSuccessful();

        $newPath = $ticket->fresh()->fotografia_referencia;
        $this->assertMatchesRegularExpression(
            "#^evidencias/ticket-{$ticket->id}/referencia/[0-9a-f-]{36}\\.jpg$#",
            $newPath
        );
        Storage::disk('public')->assertExists($newPath);
        Storage::disk('public')->assertMissing('tickets/evidencias/archivo-anterior.jpg');

        $this->artisan('storage:migrate-ticket-references')->assertSuccessful();
        $this->assertSame($newPath, $ticket->fresh()->fotografia_referencia);
    }

    public function test_storage_paths_cover_future_evidences_and_private_reports(): void
    {
        $this->assertSame(
            'evidencias/ticket-25/inicial/file-id.png',
            StoragePath::repairEvidence(25, 'inicial', 'file-id', 'png')
        );
        $this->assertSame(
            'reportes/ticket-25/reporte-reparacion-ticket-25.pdf',
            StoragePath::repairReport(25)
        );
        $this->assertSame(
            storage_path('app/private'),
            config('filesystems.disks.protected_reports.root')
        );
    }

    private function validTicketPayload(): array
    {
        return [
            'area_id' => Area::query()->value('id'),
            'tipo_desperfecto_id' => TipoDesperfecto::query()->value('id'),
            'prioridad_id' => PrioridadTicket::query()->value('id_prioridad'),
            'titulo' => 'Fuga en laboratorio',
            'descripcion_desperfecto' => 'Se detectó una fuga de agua.',
            'ubicacion' => 'Laboratorio 1',
        ];
    }

    private function userWithRole(string $role): User
    {
        return User::factory()->create([
            'tipo_usuario_id' => TipoUsuario::query()->where('nombre', $role)->value('id'),
            'activo' => true,
        ]);
    }

    private function ticket(array $attributes = []): Ticket
    {
        return Ticket::query()->create([
            'usuario_id' => $attributes['usuario_id'] ?? $this->userWithRole('Usuario Registrado')->id,
            'area_id' => Area::query()->value('id'),
            'tipo_desperfecto_id' => TipoDesperfecto::query()->value('id'),
            'estado_id' => EstadoTicket::query()->where('nombre', 'Pendiente')->value('id'),
            'prioridad_id' => PrioridadTicket::query()->value('id_prioridad'),
            'titulo' => 'Ticket histórico',
            'descripcion_desperfecto' => 'Descripción',
            'ubicacion' => 'Edificio A',
            'fotografia_referencia' => $attributes['fotografia_referencia'] ?? null,
            'fecha_reporte' => now(),
        ]);
    }
}
