<?php

namespace Tests\Feature\Repair;

use App\Events\UserNotificationCreated;
use App\Models\Reparacion;
use App\Services\RepairArchiveService;
use App\Services\RepairFinishedNotificationService;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Valoracion\ValoracionTestCase;

class RepairFlowTest extends ValoracionTestCase
{
    public function test_maintenance_completes_the_core_flow_and_authorized_roles_can_read_the_report(): void
    {
        Event::fake([UserNotificationCreated::class]);
        Storage::fake('public');
        Storage::fake('protected_reports');

        $maintenance = $this->userWithRole('Personal de Mantenimiento');
        $admin = $this->userWithRole('Subdirector Administrativo');
        $responsible = $this->userWithRole('Responsable del Lugar');
        $registered = $this->userWithRole('Usuario Registrado');
        $ticket = $this->ticket('Autorizado');
        $this->valoracion($maintenance, $ticket, 'Autorizada');
        $responsible->areas()->attach($ticket->area_id, ['activo' => true]);

        Sanctum::actingAs($maintenance);
        $this->getJson('/api/reparaciones')
            ->assertOk()
            ->assertJsonPath('data.disponibles.0.id', $ticket->id);

        $started = $this->postJson("/api/tickets/{$ticket->id}/reparacion", [
            'estado_inicial' => '  Fuga activa y llave deteriorada.  ',
        ])
            ->assertCreated()
            ->assertJsonPath('data.estado_inicial', 'Fuga activa y llave deteriorada.')
            ->assertJsonPath('data.ticket.estado', 'En reparación');

        $repairId = $started->json('data.id');
        $this->assertSame('En reparación', $ticket->fresh()->estado->nombre);

        $this->post("/api/reparaciones/{$repairId}/finalizar", [
            'proceso_reparacion' => 'Se cambió la llave y se sellaron las conexiones.',
            'estado_final' => 'Sin fuga y con suministro restablecido.',
            'evidencia_inicial' => UploadedFile::fake()->image('inicial.jpg'),
            'evidencia_durante' => UploadedFile::fake()->image('durante.png'),
            'evidencia_final' => UploadedFile::fake()->image('final.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.ticket.estado', 'Reparado')
            ->assertJsonCount(3, 'data.evidencias')
            ->assertJsonPath('data.archived', true)
            ->assertJsonPath('data.report_available', true);

        $repair = Reparacion::query()->with(['evidencias', 'bitacora'])->findOrFail($repairId);
        $this->assertCount(3, $repair->evidencias);
        $this->assertNotNull($repair->fecha_reparacion);
        $this->assertSame('Reparado', $ticket->fresh()->estado->nombre);
        Storage::disk('protected_reports')->assertExists($repair->bitacora->archivo_pdf);
        $this->assertStringStartsWith(
            '%PDF-',
            Storage::disk('protected_reports')->get($repair->bitacora->archivo_pdf)
        );

        $this->assertDatabaseHas('notifications', ['notifiable_id' => $admin->id]);
        $this->assertDatabaseHas('notifications', ['notifiable_id' => $responsible->id]);
        $this->assertDatabaseMissing('notifications', ['notifiable_id' => $maintenance->id]);
        Event::assertDispatchedTimes(UserNotificationCreated::class, 2);

        Sanctum::actingAs($admin);
        $notifications = $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.title', 'Reparación finalizada');
        $this->patchJson('/api/notifications/'.$notifications->json('data.0.id').'/read')
            ->assertOk();
        $this->getJson('/api/notifications')->assertJsonPath('unread_count', 0);

        $this->getJson('/api/bitacoras-reparacion')
            ->assertOk()
            ->assertJsonPath('data.0.ticket.id', $ticket->id)
            ->assertJsonPath('data.0.reparacion.evidencias.2.tipo', 'final');
        $this->getJson('/api/bitacoras-reparacion/'.$repair->bitacora->id)
            ->assertOk()
            ->assertJsonPath('data.ticket.id', $ticket->id)
            ->assertJsonPath('data.generado_por.id', $maintenance->id);

        foreach ([$maintenance, $admin, $responsible] as $authorized) {
            Sanctum::actingAs($authorized);
            $this->get("/api/tickets/{$ticket->id}/reporte-reparacion")
                ->assertOk()
                ->assertHeader('content-type', 'application/pdf');
        }

        Sanctum::actingAs($registered);
        $this->getJson("/api/tickets/{$ticket->id}/reporte-reparacion")->assertForbidden();
        $this->getJson('/api/bitacoras-reparacion')->assertForbidden();
        $this->getJson('/api/bitacoras-reparacion/'.$repair->bitacora->id)->assertForbidden();
    }

    public function test_claiming_is_exclusive_and_finishing_requires_owner_and_three_valid_images(): void
    {
        Storage::fake('public');
        Storage::fake('protected_reports');

        $owner = $this->userWithRole('Personal de Mantenimiento');
        $other = $this->userWithRole('Personal de Mantenimiento');
        $ticket = $this->ticket('Autorizado');
        $this->valoracion($owner, $ticket, 'Autorizada');

        Sanctum::actingAs($owner);
        $repairId = $this->postJson("/api/tickets/{$ticket->id}/reparacion", [
            'estado_inicial' => 'Daño visible.',
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs($other);
        $this->postJson("/api/tickets/{$ticket->id}/reparacion", [
            'estado_inicial' => 'Segundo intento.',
        ])->assertUnprocessable();
        $this->post("/api/reparaciones/{$repairId}/finalizar", [
            'proceso_reparacion' => 'Intento ajeno.',
            'estado_final' => 'No aplica.',
            'evidencia_inicial' => UploadedFile::fake()->image('inicial.jpg'),
            'evidencia_durante' => UploadedFile::fake()->image('durante.jpg'),
            'evidencia_final' => UploadedFile::fake()->image('final.jpg'),
        ], ['Accept' => 'application/json'])->assertNotFound();

        Sanctum::actingAs($owner);
        $this->post("/api/reparaciones/{$repairId}/finalizar", [
            'proceso_reparacion' => 'Proceso válido.',
            'estado_final' => 'Estado válido.',
            'evidencia_inicial' => UploadedFile::fake()->create('archivo.pdf', 10, 'application/pdf'),
            'evidencia_durante' => UploadedFile::fake()->image('durante.jpg'),
            'evidencia_final' => UploadedFile::fake()->image('final.jpg'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('evidencia_inicial');

        $this->assertNull(Reparacion::query()->findOrFail($repairId)->fecha_reparacion);
        $this->assertSame('En reparación', $ticket->fresh()->estado->nombre);
        $this->assertDatabaseCount('evidencias_reparacion', 0);
        $this->assertDatabaseCount('bitacoras_reparacion', 0);
    }

    public function test_unstarted_or_unarchived_resources_are_not_exposed(): void
    {
        $maintenance = $this->userWithRole('Personal de Mantenimiento');
        $ticket = $this->ticket('Autorizado');
        $this->valoracion($maintenance, $ticket, 'Autorizada');
        Sanctum::actingAs($maintenance);

        $this->getJson("/api/tickets/{$ticket->id}/reporte-reparacion")
            ->assertStatus(409);

        $this->postJson("/api/tickets/{$ticket->id}/reparacion", [
            'estado_inicial' => ' ',
        ])->assertUnprocessable()->assertJsonValidationErrors('estado_inicial');
    }

    public function test_repair_tray_searches_available_and_owned_repairs_without_exposing_other_rows(): void
    {
        $maintenance = $this->userWithRole('Personal de Mantenimiento');
        $other = $this->userWithRole('Personal de Mantenimiento');
        $electrical = $this->ticket('Autorizado', [
            'titulo' => 'Falla eléctrica en laboratorio',
            'descripcion_desperfecto' => 'No encienden las lámparas.',
        ]);
        $plumbing = $this->ticket('Autorizado', ['titulo' => 'Fuga de agua']);
        $this->valoracion($maintenance, $electrical, 'Autorizada');
        $this->valoracion($maintenance, $plumbing, 'Autorizada');

        Sanctum::actingAs($maintenance);
        $this->getJson('/api/reparaciones?search=eléctrica')
            ->assertOk()
            ->assertJsonCount(1, 'data.disponibles')
            ->assertJsonPath('data.disponibles.0.id', $electrical->id);

        $repairId = $this->postJson("/api/tickets/{$electrical->id}/reparacion", [
            'estado_inicial' => $electrical->descripcion_desperfecto,
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs($other);
        $this->getJson('/api/reparaciones?search=eléctrica')
            ->assertOk()
            ->assertJsonCount(0, 'data.disponibles')
            ->assertJsonCount(0, 'data.en_curso');

        Sanctum::actingAs($maintenance);
        $this->getJson('/api/reparaciones?search=TK-'.$electrical->id)
            ->assertOk()
            ->assertJsonCount(0, 'data.disponibles')
            ->assertJsonCount(1, 'data.en_curso')
            ->assertJsonPath('data.en_curso.0.id', $repairId);
    }

    public function test_private_broadcast_channel_only_authorizes_the_authenticated_owner(): void
    {
        $owner = $this->userWithRole('Subdirector Administrativo');
        $other = $this->userWithRole('Responsable del Lugar');

        Sanctum::actingAs($owner);
        $this->postJson('/api/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => "private-App.Models.User.{$owner->id}",
        ])->assertOk()->assertJsonStructure(['auth']);

        Sanctum::actingAs($other);
        $this->postJson('/api/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => "private-App.Models.User.{$owner->id}",
        ])->assertForbidden();
    }

    public function test_notification_rows_survive_when_reverb_is_unavailable(): void
    {
        Event::listen(UserNotificationCreated::class, function (): void {
            throw new BroadcastException('Reverb no disponible en prueba.');
        });

        $maintenance = $this->userWithRole('Personal de Mantenimiento');
        $admin = $this->userWithRole('Subdirector Administrativo');
        $responsible = $this->userWithRole('Responsable del Lugar');
        $ticket = $this->ticket('Autorizado');
        $this->valoracion($maintenance, $ticket, 'Autorizada');
        $responsible->areas()->attach($ticket->area_id, ['activo' => true]);

        $archive = app(RepairArchiveService::class);
        $repair = Reparacion::query()->create([
            'ticket_id' => $ticket->id,
            'realizado_por' => $maintenance->id,
            'estado_inicial' => 'Estado inicial',
            'proceso_reparacion' => 'Proceso',
            'estado_final' => 'Resultado',
            'fecha_inicio' => now(),
            'fecha_reparacion' => now(),
        ]);
        Storage::fake('protected_reports');
        Storage::disk('protected_reports')->put('reportes/prueba.pdf', '%PDF-prueba');
        $bitacora = $archive->create($repair, 'reportes/prueba.pdf', now());

        app(RepairFinishedNotificationService::class)->notify($bitacora);

        $this->assertDatabaseHas('notifications', ['notifiable_id' => $admin->id]);
        $this->assertDatabaseHas('notifications', ['notifiable_id' => $responsible->id]);
    }

    public function test_administrator_is_not_skipped_if_area_assignments_table_is_unavailable(): void
    {
        Event::fake([UserNotificationCreated::class]);
        $maintenance = $this->userWithRole('Personal de Mantenimiento');
        $admin = $this->userWithRole('Subdirector Administrativo');
        $ticket = $this->ticket('Autorizado');
        $this->valoracion($maintenance, $ticket, 'Autorizada');
        $repair = Reparacion::query()->create([
            'ticket_id' => $ticket->id,
            'realizado_por' => $maintenance->id,
            'estado_inicial' => 'Estado inicial',
            'proceso_reparacion' => 'Proceso',
            'estado_final' => 'Resultado',
            'fecha_inicio' => now(),
            'fecha_reparacion' => now(),
        ]);
        Storage::fake('protected_reports');
        Storage::disk('protected_reports')->put('reportes/prueba.pdf', '%PDF-prueba');
        $bitacora = app(RepairArchiveService::class)
            ->create($repair, 'reportes/prueba.pdf', now());

        Schema::shouldReceive('hasTable')
            ->once()
            ->with('usuario_area')
            ->andReturnFalse();

        app(RepairFinishedNotificationService::class)->notify($bitacora);

        $this->assertDatabaseHas('notifications', ['notifiable_id' => $admin->id]);
    }
}
