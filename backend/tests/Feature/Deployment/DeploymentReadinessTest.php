<?php

namespace Tests\Feature\Deployment;

use App\Models\TipoUsuario;
use App\Models\User;
use Database\Seeders\CatalogosTicketsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DeploymentReadinessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CatalogosTicketsSeeder::class);
    }

    public function test_local_registration_remains_available_and_can_be_disabled_by_environment(): void
    {
        config(['deployment.allow_public_registration' => true]);

        $this->postJson('/api/register', [
            'name' => 'Usuario local',
            'email' => 'local@example.test',
            'password' => 'password-seguro',
            'password_confirmation' => 'password-seguro',
        ])->assertCreated();

        config(['deployment.allow_public_registration' => false]);

        $this->postJson('/api/register', [
            'name' => 'Usuario externo',
            'email' => 'externo@example.test',
            'password' => 'password-seguro',
            'password_confirmation' => 'password-seguro',
        ])->assertNotFound();
    }

    public function test_inactive_accounts_cannot_log_in_or_keep_using_existing_tokens(): void
    {
        $roleId = TipoUsuario::query()->where('nombre', 'Usuario Registrado')->value('id');
        $inactive = User::factory()->create([
            'tipo_usuario_id' => $roleId,
            'activo' => false,
            'email' => 'inactivo@example.test',
            'password' => 'password-seguro',
        ]);

        $this->postJson('/api/login', [
            'email' => $inactive->email,
            'password' => 'password-seguro',
        ])->assertUnauthorized();

        Sanctum::actingAs($inactive);
        $this->getJson('/api/me')
            ->assertForbidden()
            ->assertJsonPath('message', 'La cuenta se encuentra inactiva.');
    }

    public function test_login_is_rate_limited_by_identity_and_ip(): void
    {
        $email = 'limitado@example.test';

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->postJson('/api/login', [
                'email' => $email,
                'password' => 'incorrecta',
            ])->assertUnauthorized();
        }

        $this->postJson('/api/login', [
            'email' => $email,
            'password' => 'incorrecta',
        ])->assertTooManyRequests();
    }

    public function test_health_endpoint_checks_database_and_both_storage_disks(): void
    {
        Storage::fake('public');
        Storage::fake('protected_reports');

        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('checks.database', true)
            ->assertJsonPath('checks.public_storage', true)
            ->assertJsonPath('checks.private_reports', true);
    }

    public function test_default_seed_is_safe_and_demo_accounts_are_provisioned_explicitly(): void
    {
        $this->seed();
        $this->assertDatabaseMissing('users', ['email' => 'admin@repara79.com']);

        $this->artisan('app:provision-demo-users')->assertSuccessful();

        foreach ([
            'subdirector.demo@repara79.test',
            'mantenimiento.demo@repara79.test',
            'responsable.demo@repara79.test',
            'usuario.demo@repara79.test',
        ] as $email) {
            $this->assertDatabaseHas('users', [
                'email' => $email,
                'activo' => true,
            ]);
        }

        $responsible = User::query()->where('email', 'responsable.demo@repara79.test')->firstOrFail();
        $this->assertTrue($responsible->areas()->wherePivot('activo', true)->exists());
    }
}
