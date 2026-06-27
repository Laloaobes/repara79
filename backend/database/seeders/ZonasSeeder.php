<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ZonasSeeder extends Seeder
{
    public function run(): void
    {
        $zonas = [
            ['nombre' => 'Edificio A', 'descripcion' => 'Edificio principal de aulas', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Edificio B', 'descripcion' => 'Edificio de laboratorios', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Laboratorio de Cómputo', 'descripcion' => 'Laboratorio de informática', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Área Administrativa', 'descripcion' => 'Oficinas administrativas', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Áreas Comunes', 'descripcion' => 'Pasillos, patios y canchas', 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('zonas')->insertOrIgnore($zonas);
    }
}
