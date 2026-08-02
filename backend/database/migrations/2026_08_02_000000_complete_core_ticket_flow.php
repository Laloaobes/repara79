<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->assertLegacyDataCanBeHardened();

        Schema::table('reparaciones', function (Blueprint $table) {
            $table->timestamp('fecha_inicio')->nullable()->after('estado_inicial');
            $table->text('proceso_reparacion')->nullable()->change();
            $table->text('estado_final')->nullable()->change();
        });

        Schema::table('evidencias_reparacion', function (Blueprint $table) {
            $table->string('tipo_evidencia', 50)->nullable(false)->change();
            $table->unique(['reparacion_id', 'tipo_evidencia'], 'evidencias_reparacion_tipo_unique');
        });

        Schema::table('bitacoras_reparacion', function (Blueprint $table) {
            $table->string('titulo', 255)->nullable(false)->change();
            $table->unsignedBigInteger('ticket_id')->nullable(false)->change();
            $table->unsignedBigInteger('reparacion_id')->nullable(false)->change();
            $table->text('descripcion_final')->nullable(false)->change();
            $table->text('archivo_pdf')->nullable(false)->change();
            $table->unsignedBigInteger('generado_por')->nullable(false)->change();
            $table->timestamp('fecha_generacion')->nullable(false)->change();
            $table->unique('ticket_id');
            $table->unique('reparacion_id');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('data');
            } else {
                $table->json('data');
            }

            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');

        Schema::table('bitacoras_reparacion', function (Blueprint $table) {
            $table->dropUnique(['ticket_id']);
            $table->dropUnique(['reparacion_id']);
            $table->string('titulo', 150)->nullable()->change();
            $table->unsignedBigInteger('ticket_id')->nullable()->change();
            $table->unsignedBigInteger('reparacion_id')->nullable()->change();
            $table->text('descripcion_final')->nullable()->change();
            $table->text('archivo_pdf')->nullable()->change();
            $table->unsignedBigInteger('generado_por')->nullable()->change();
            $table->timestamp('fecha_generacion')->nullable()->change();
        });

        Schema::table('evidencias_reparacion', function (Blueprint $table) {
            $table->dropUnique('evidencias_reparacion_tipo_unique');
            $table->string('tipo_evidencia', 50)->nullable()->change();
        });

        Schema::table('reparaciones', function (Blueprint $table) {
            $table->dropColumn('fecha_inicio');
        });
    }

    private function assertLegacyDataCanBeHardened(): void
    {
        $invalidEvidences = DB::table('evidencias_reparacion')
            ->whereNull('tipo_evidencia')
            ->orWhereNotIn('tipo_evidencia', ['inicial', 'durante', 'final'])
            ->exists();

        $duplicateEvidences = DB::table('evidencias_reparacion')
            ->select('reparacion_id', 'tipo_evidencia')
            ->groupBy('reparacion_id', 'tipo_evidencia')
            ->havingRaw('COUNT(*) > 1')
            ->exists();

        $invalidArchives = DB::table('bitacoras_reparacion')
            ->where(function ($query): void {
                $query->whereNull('ticket_id')
                    ->orWhereNull('reparacion_id')
                    ->orWhereNull('titulo')
                    ->orWhereNull('descripcion_final')
                    ->orWhereNull('archivo_pdf')
                    ->orWhereNull('generado_por')
                    ->orWhereNull('fecha_generacion');
            })
            ->exists();

        $duplicateArchives = DB::table('bitacoras_reparacion')
            ->select('ticket_id')
            ->groupBy('ticket_id')
            ->havingRaw('COUNT(*) > 1')
            ->exists()
            || DB::table('bitacoras_reparacion')
                ->select('reparacion_id')
                ->groupBy('reparacion_id')
                ->havingRaw('COUNT(*) > 1')
                ->exists();

        if ($invalidEvidences || $duplicateEvidences || $invalidArchives || $duplicateArchives) {
            throw new RuntimeException(
                'Existen evidencias o bitácoras heredadas incompatibles; deben auditarse antes de continuar.'
            );
        }
    }
};
