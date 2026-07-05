<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $officialTypes = [
        'Subdirector Administrativo',
        'Personal de Mantenimiento',
        'Responsable del Lugar',
        'Usuario Registrado',
    ];

    public function up(): void
    {
        $canonicalIds = $this->ensureOfficialTypesExist();

        foreach ($this->officialTypes as $typeName) {
            $this->mergeTypeRows($typeName, $canonicalIds[$typeName]);
        }

        $this->moveUsersFromType('Administrador', $canonicalIds['Subdirector Administrativo']);
        $this->moveUsersFromUnknownTypes($canonicalIds['Usuario Registrado']);

        Schema::table('tipos_usuarios', function (Blueprint $table) {
            $table->unique('nombre');
        });
    }

    public function down(): void
    {
        Schema::table('tipos_usuarios', function (Blueprint $table) {
            $table->dropUnique(['nombre']);
        });
    }

    private function ensureOfficialTypesExist(): array
    {
        $canonicalIds = [];

        foreach ($this->officialTypes as $typeName) {
            $existingId = DB::table('tipos_usuarios')
                ->where('nombre', $typeName)
                ->orderBy('id')
                ->value('id');

            if (!$existingId) {
                $existingId = DB::table('tipos_usuarios')->insertGetId([
                    'nombre' => $typeName,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $canonicalIds[$typeName] = $existingId;
        }

        return $canonicalIds;
    }

    private function mergeTypeRows(string $typeName, int $canonicalId): void
    {
        $duplicateIds = DB::table('tipos_usuarios')
            ->where('nombre', $typeName)
            ->where('id', '!=', $canonicalId)
            ->pluck('id');

        if ($duplicateIds->isEmpty()) {
            return;
        }

        DB::table('users')
            ->whereIn('tipo_usuario_id', $duplicateIds)
            ->update([
                'tipo_usuario_id' => $canonicalId,
                'updated_at' => now(),
            ]);

        DB::table('tipos_usuarios')
            ->whereIn('id', $duplicateIds)
            ->delete();
    }

    private function moveUsersFromType(string $sourceTypeName, int $targetTypeId): void
    {
        $sourceIds = DB::table('tipos_usuarios')
            ->where('nombre', $sourceTypeName)
            ->pluck('id');

        if ($sourceIds->isEmpty()) {
            return;
        }

        DB::table('users')
            ->whereIn('tipo_usuario_id', $sourceIds)
            ->update([
                'tipo_usuario_id' => $targetTypeId,
                'updated_at' => now(),
            ]);

        DB::table('tipos_usuarios')
            ->whereIn('id', $sourceIds)
            ->delete();
    }

    private function moveUsersFromUnknownTypes(int $defaultTypeId): void
    {
        $unknownTypeIds = DB::table('tipos_usuarios')
            ->whereNotIn('nombre', $this->officialTypes)
            ->pluck('id');

        if ($unknownTypeIds->isEmpty()) {
            return;
        }

        DB::table('users')
            ->whereIn('tipo_usuario_id', $unknownTypeIds)
            ->update([
                'tipo_usuario_id' => $defaultTypeId,
                'updated_at' => now(),
            ]);

        DB::table('tipos_usuarios')
            ->whereIn('id', $unknownTypeIds)
            ->delete();
    }
};
