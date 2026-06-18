<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsuarioAdministradorSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            [
                'email' => 'admin@repara79.com'
            ],
            [
                'tipo_usuario_id' => 1,
                'name' => 'Administrador',
                'password' => '12345678'
            ]
        );
    }
}
