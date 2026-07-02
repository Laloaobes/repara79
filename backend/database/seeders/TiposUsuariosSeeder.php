<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class TiposUsuariosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ([
            'Administrador',
            'Subdirector Administrativo',
            'Personal de Mantenimiento',
            'Responsable del Lugar',
            'Usuario Registrado',
        ] as $nombre) {
            DB::table('tipos_usuarios')->updateOrInsert(
                ['nombre' => $nombre],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
