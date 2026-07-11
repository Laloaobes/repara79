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
        $this->ensureOfficialMaintenanceTables();
        $this->migrateLegacyValoraciones();
        $this->normalizeUserTypes();
    }

    public function down(): void
    {
        //
    }

    private function ensureOfficialMaintenanceTables(): void
    {
        if (!Schema::hasTable('solicitudes_materiales')) {
            Schema::create('solicitudes_materiales', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->unique()->constrained('tickets')->cascadeOnUpdate()->cascadeOnDelete();
                $table->string('estado_general', 50)->nullable();
                $table->text('observaciones')->nullable();
                $table->text('motivo_rechazo')->nullable();
                $table->integer('veces_revisada')->default(0);
                $table->foreignId('valorado_por')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
                $table->foreignId('validado_por')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
                $table->timestamp('fecha_creacion')->nullable();
                $table->timestamp('fecha_validacion')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('materiales_ticket')) {
            Schema::create('materiales_ticket', function (Blueprint $table) {
                $table->id();
                $table->foreignId('solicitud_id')->constrained('solicitudes_materiales')->cascadeOnUpdate()->cascadeOnDelete();
                $table->string('nombre_material', 150);
                $table->string('codigo_material', 100)->nullable();
                $table->integer('cantidad');
                $table->decimal('costo_unitario', 10, 2)->default(0);
                $table->string('estado_individual', 50)->nullable();
                $table->text('motivo_rechazo')->nullable();
                $table->string('inventario_ref', 100)->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('reparaciones')) {
            Schema::create('reparaciones', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->unique()->nullable()->constrained('tickets')->cascadeOnUpdate()->cascadeOnDelete();
                $table->foreignId('realizado_por')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
                $table->text('estado_inicial');
                $table->text('proceso_reparacion');
                $table->text('estado_final');
                $table->timestamp('fecha_reparacion')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('evidencias_reparacion')) {
            Schema::create('evidencias_reparacion', function (Blueprint $table) {
                $table->id();
                $table->foreignId('reparacion_id')->constrained('reparaciones')->cascadeOnUpdate()->cascadeOnDelete();
                $table->text('imagen');
                $table->text('descripcion')->nullable();
                $table->string('tipo_evidencia', 50)->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('bitacoras_reparacion')) {
            Schema::create('bitacoras_reparacion', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->nullable()->constrained('tickets')->cascadeOnUpdate()->nullOnDelete();
                $table->foreignId('reparacion_id')->nullable()->constrained('reparaciones')->cascadeOnUpdate()->nullOnDelete();
                $table->string('titulo', 150)->nullable();
                $table->text('descripcion_final')->nullable();
                $table->text('archivo_pdf')->nullable();
                $table->foreignId('generado_por')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
                $table->timestamp('fecha_generacion')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('notificaciones')) {
            Schema::create('notificaciones', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->nullable()->constrained('tickets')->cascadeOnUpdate()->cascadeOnDelete();
                $table->foreignId('enviado_por')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
                $table->foreignId('recibido_por')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
                $table->text('mensaje');
                $table->string('estado', 50)->nullable();
                $table->timestamp('fecha')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('historial_ticket')) {
            Schema::create('historial_ticket', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnUpdate()->cascadeOnDelete();
                $table->foreignId('usuario_id')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
                $table->string('estado_anterior', 50)->nullable();
                $table->string('estado_nuevo', 50)->nullable();
                $table->text('comentario')->nullable();
                $table->timestamp('fecha')->nullable();
                $table->timestamps();
            });
        }
    }

    private function migrateLegacyValoraciones(): void
    {
        if (!Schema::hasTable('valoraciones')) {
            return;
        }

        DB::table('valoraciones')->orderBy('id')->get()->each(function (object $valoracion) {
            $solicitudId = DB::table('solicitudes_materiales')->updateOrInsert(
                ['ticket_id' => $valoracion->ticket_id],
                [
                    'estado_general' => $valoracion->estado ?? 'Pendiente',
                    'observaciones' => $valoracion->diagnostico ?? null,
                    'motivo_rechazo' => $valoracion->motivo_rechazo ?? null,
                    'veces_revisada' => isset($valoracion->revisado_at) && $valoracion->revisado_at ? 1 : 0,
                    'valorado_por' => $valoracion->tecnico_id ?? null,
                    'validado_por' => $valoracion->revisado_por_id ?? null,
                    'fecha_creacion' => $valoracion->created_at ?? now(),
                    'fecha_validacion' => $valoracion->revisado_at ?? null,
                    'created_at' => $valoracion->created_at ?? now(),
                    'updated_at' => $valoracion->updated_at ?? now(),
                ]
            );

            $solicitudId = DB::table('solicitudes_materiales')
                ->where('ticket_id', $valoracion->ticket_id)
                ->value('id');

            DB::table('materiales_ticket')->where('solicitud_id', $solicitudId)->delete();

            foreach ($this->decodeLegacyMaterials($valoracion->materiales ?? null) as $material) {
                DB::table('materiales_ticket')->insert([
                    'solicitud_id' => $solicitudId,
                    'nombre_material' => $material['descripcion'],
                    'cantidad' => 1,
                    'costo_unitario' => $material['costo'],
                    'estado_individual' => 'Pendiente',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        Schema::dropIfExists('valoraciones');
    }

    private function decodeLegacyMaterials(mixed $materials): array
    {
        if (!$materials) {
            return [];
        }

        $decoded = is_string($materials) ? json_decode($materials, true) : $materials;

        if (!is_array($decoded)) {
            return [];
        }

        return collect($decoded)
            ->filter(fn (mixed $material) => is_array($material) && isset($material['descripcion']))
            ->map(fn (array $material) => [
                'descripcion' => (string) $material['descripcion'],
                'costo' => (float) ($material['costo'] ?? 0),
            ])
            ->values()
            ->all();
    }

    private function normalizeUserTypes(): void
    {
        $canonicalIds = [];

        foreach ($this->officialTypes as $typeName) {
            DB::table('tipos_usuarios')->updateOrInsert(
                ['nombre' => $typeName],
                ['created_at' => now(), 'updated_at' => now()]
            );

            $canonicalIds[$typeName] = DB::table('tipos_usuarios')
                ->where('nombre', $typeName)
                ->orderBy('id')
                ->value('id');

            $duplicateIds = DB::table('tipos_usuarios')
                ->where('nombre', $typeName)
                ->where('id', '!=', $canonicalIds[$typeName])
                ->pluck('id');

            if ($duplicateIds->isNotEmpty()) {
                DB::table('users')
                    ->whereIn('tipo_usuario_id', $duplicateIds)
                    ->update([
                        'tipo_usuario_id' => $canonicalIds[$typeName],
                        'updated_at' => now(),
                    ]);

                DB::table('tipos_usuarios')
                    ->whereIn('id', $duplicateIds)
                    ->delete();
            }
        }

        $administratorIds = DB::table('tipos_usuarios')
            ->where('nombre', 'Administrador')
            ->pluck('id');

        if ($administratorIds->isNotEmpty()) {
            DB::table('users')
                ->whereIn('tipo_usuario_id', $administratorIds)
                ->update([
                    'tipo_usuario_id' => $canonicalIds['Subdirector Administrativo'],
                    'updated_at' => now(),
                ]);

            DB::table('tipos_usuarios')
                ->whereIn('id', $administratorIds)
                ->delete();
        }

        $unknownIds = DB::table('tipos_usuarios')
            ->whereNotIn('nombre', $this->officialTypes)
            ->pluck('id');

        if ($unknownIds->isNotEmpty()) {
            DB::table('users')
                ->whereIn('tipo_usuario_id', $unknownIds)
                ->update([
                    'tipo_usuario_id' => $canonicalIds['Usuario Registrado'],
                    'updated_at' => now(),
                ]);

            DB::table('tipos_usuarios')
                ->whereIn('id', $unknownIds)
                ->delete();
        }
    }
};
