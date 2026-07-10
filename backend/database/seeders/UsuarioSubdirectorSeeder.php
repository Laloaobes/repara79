<?php

namespace Database\Seeders;

use App\Models\TipoUsuario;
use App\Models\User;
use Illuminate\Database\Seeder;

class UsuarioSubdirectorSeeder extends Seeder
{
    public function run(): void
    {
        $tipoSubdirector = TipoUsuario::firstOrCreate([
            'nombre' => 'Subdirector Administrativo',
        ]);

        $user = User::firstOrCreate(
            [
                'email' => 'admin@repara79.com',
            ],
            [
                'tipo_usuario_id' => $tipoSubdirector->id,
                'name' => 'Subdirector Administrativo',
                'password' => '12345678',
            ]
        );

        $user->forceFill([
            'tipo_usuario_id' => $tipoSubdirector->id,
        ])->save();
    }
}
