<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TiposUsuariosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
public function run(): void
{
    DB::table('tipos_usuarios')->insert([
        [
            'nombre' => 'Administrador',
            'created_at' => now(),
            'updated_at' => now()
        ],
        [
            'nombre' => 'Subdirector Administrativo',
            'created_at' => now(),
            'updated_at' => now()
        ],
        [
            'nombre' => 'Personal de Mantenimiento',
            'created_at' => now(),
            'updated_at' => now()
        ],
        [
            'nombre' => 'Responsable del Lugar',
            'created_at' => now(),
            'updated_at' => now()
        ]
    ]);
}
}
