<?php

namespace Database\Seeders;

use App\Models\TipoUsuario;
use App\Models\User;
use Illuminate\Database\Seeder;

class UsuarioSubdirectorSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('INITIAL_ADMIN_EMAIL');
        $password = env('INITIAL_ADMIN_PASSWORD');

        if (! $email || ! $password) {
            $this->command?->warn(
                'UsuarioSubdirectorSeeder omitido: usa app:provision-demo-users o define credenciales explícitas.'
            );

            return;
        }

        $tipoSubdirectorAdministrativo = TipoUsuario::firstOrCreate([
            'nombre' => 'Subdirector Administrativo',
        ]);

        $user = User::firstOrCreate(
            [
                'email' => $email,
            ],
            [
                'tipo_usuario_id' => $tipoSubdirectorAdministrativo->id,
                'name' => 'Subdirector Administrativo',
                'password' => $password,
            ]
        );

        $user->forceFill([
            'tipo_usuario_id' => $tipoSubdirectorAdministrativo->id,
            'name' => 'Subdirector Administrativo',
        ])->save();
    }
}
