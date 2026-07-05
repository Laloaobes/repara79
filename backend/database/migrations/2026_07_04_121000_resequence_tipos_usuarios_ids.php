<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $targetIds = [
        'Responsable del Lugar' => 1,
        'Personal de Mantenimiento' => 2,
        'Subdirector Administrativo' => 3,
        'Administrador' => 4,
    ];

    public function up(): void
    {
        DB::transaction(function () {
            foreach ($this->targetIds as $typeName => $targetId) {
                $exists = DB::table('tipos_usuarios')
                    ->where('nombre', $typeName)
                    ->exists();

                if (!$exists) {
                    DB::table('tipos_usuarios')->insert([
                        'id' => $this->temporaryId($targetId),
                        'nombre' => $typeName,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('tipos_usuarios')
                    ->where('nombre', $typeName)
                    ->update([
                        'id' => $this->temporaryId($targetId),
                        'updated_at' => now(),
                    ]);
            }

            foreach ($this->targetIds as $typeName => $targetId) {
                DB::table('tipos_usuarios')
                    ->where('nombre', $typeName)
                    ->update([
                        'id' => $targetId,
                        'updated_at' => now(),
                    ]);
            }

            $this->resetPrimaryKeySequence();
        });
    }

    public function down(): void
    {
        $this->resetPrimaryKeySequence();
    }

    private function temporaryId(int $targetId): int
    {
        return -1000 - $targetId;
    }

    private function resetPrimaryKeySequence(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('tipos_usuarios', 'id'), 4, true)");
        }

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE tipos_usuarios AUTO_INCREMENT = 5');
        }
    }
};
