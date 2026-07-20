<?php

namespace Database\Seeders;

use App\Models\TipoUsuario;
use App\Models\User;
use Illuminate\Database\Seeder;

class UsuarioSubdirectorSeeder extends Seeder
{
    public function run(): void
    {
        $tipoAdministrador = TipoUsuario::firstOrCreate([
            'nombre' => 'Administrador',
        ]);

        $user = User::firstOrCreate(
            [
                'email' => 'admin@repara79.com',
            ],
            [
                'tipo_usuario_id' => $tipoSubdirector Administrativo->id,
                'name' => 'Administrador',
                'password' => '12345678',
            ]
        );

        $user->forceFill([
            'tipo_usuario_id' => $tipoSubdirectorAdministrativo->id,
        ])->save();
    }
}
