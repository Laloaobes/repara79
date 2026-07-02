<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TipoUsuario;
use Illuminate\Database\Seeder;

class UsuarioAdministradorSeeder extends Seeder
{
    public function run(): void
    {
        $tipoAdministrador = TipoUsuario::where('nombre', 'Administrador')->first();

        User::firstOrCreate(
            [
                'email' => 'admin@repara79.com'
            ],
            [
                'tipo_usuario_id' => $tipoAdministrador?->id,
                'name' => 'Administrador',
                'password' => '12345678'
            ]
        );
    }
}
