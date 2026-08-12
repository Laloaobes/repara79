<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const INDEX = 'usuario_area_one_active_responsible_per_area';

    public function up(): void
    {
        $duplicates = DB::table('usuario_area')
            ->select('area_id')
            ->where('activo', true)
            ->groupBy('area_id')
            ->havingRaw('COUNT(*) > 1')
            ->exists();

        if ($duplicates) {
            throw new RuntimeException(
                'Existen áreas con más de una asignación activa; deben auditarse antes de continuar.'
            );
        }

        DB::statement(sprintf(
            'CREATE UNIQUE INDEX %s ON usuario_area (area_id) WHERE activo = %s',
            self::INDEX,
            DB::getDriverName() === 'pgsql' ? 'true' : '1'
        ));
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS '.self::INDEX);
    }
};
