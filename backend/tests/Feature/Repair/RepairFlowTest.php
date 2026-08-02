<?php

namespace Tests\Feature\Repair;

use App\Models\Reparacion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Valoracion\ValoracionTestCase;

class RepairFlowTest extends ValoracionTestCase
{
    public function test_maintenance_completes_the_core_flow_and_authorized_roles_can_read_the_report(): void
    {
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

        foreach ([$maintenance, $admin, $responsible] as $authorized) {
            Sanctum::actingAs($authorized);
            $this->get("/api/tickets/{$ticket->id}/reporte-reparacion")
                ->assertOk()
                ->assertHeader('content-type', 'application/pdf');
        }

        Sanctum::actingAs($registered);
        $this->getJson("/api/tickets/{$ticket->id}/reporte-reparacion")->assertForbidden();
        $this->getJson('/api/bitacoras-reparacion')->assertForbidden();
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
}
