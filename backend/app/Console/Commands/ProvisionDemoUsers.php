<?php

namespace App\Console\Commands;

use App\Models\Area;
use App\Models\TipoUsuario;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ProvisionDemoUsers extends Command
{
    protected $signature = 'app:provision-demo-users
                            {--rotate : Regenera las contraseñas y revoca los tokens de las cuentas existentes}';

    protected $description = 'Crea cuentas ficticias para probar los cuatro roles sin credenciales institucionales';

    public function handle(): int
    {
        $accounts = [
            'Subdirector Administrativo' => 'subdirector.demo@repara79.test',
            'Personal de Mantenimiento' => 'mantenimiento.demo@repara79.test',
            'Responsable del Lugar' => 'responsable.demo@repara79.test',
            'Usuario Registrado' => 'usuario.demo@repara79.test',
        ];
        $rows = [];

        foreach ($accounts as $roleName => $email) {
            $role = TipoUsuario::query()->where('nombre', $roleName)->first();

            if (! $role) {
                $this->error("Falta el rol {$roleName}. Ejecuta primero: php artisan db:seed --force");

                return self::FAILURE;
            }

            $user = User::withTrashed()->where('email', $email)->first();
            $plainPassword = null;

            if (! $user || $this->option('rotate')) {
                $plainPassword = Str::password(16, symbols: false);
            }

            if (! $user) {
                $user = User::query()->create([
                    'tipo_usuario_id' => $role->id,
                    'name' => $roleName.' Demo',
                    'email' => $email,
                    'password' => $plainPassword,
                    'activo' => true,
                ]);
            } else {
                $user->restore();
                $user->forceFill([
                    'tipo_usuario_id' => $role->id,
                    'name' => $roleName.' Demo',
                    'activo' => true,
                    ...($plainPassword ? ['password' => $plainPassword] : []),
                ])->save();

                if ($plainPassword) {
                    $user->tokens()->delete();
                }
            }

            if ($roleName === 'Responsable del Lugar' && ($area = Area::query()->orderBy('id')->first())) {
                $user->areas()->syncWithoutDetaching([
                    $area->id => ['activo' => true],
                ]);
            }

            $rows[] = [
                $roleName,
                $email,
                $plainPassword ?? '(sin cambios)',
            ];
        }

        $this->table(['Rol', 'Correo', 'Contraseña'], $rows);
        $this->warn('Guarda las contraseñas mostradas ahora; no se vuelven a imprimir sin usar --rotate.');

        return self::SUCCESS;
    }
}
