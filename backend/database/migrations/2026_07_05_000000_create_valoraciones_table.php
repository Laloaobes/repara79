<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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

        Schema::create('evidencias_reparacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reparacion_id')->constrained('reparaciones')->cascadeOnUpdate()->cascadeOnDelete();
            $table->text('imagen');
            $table->text('descripcion')->nullable();
            $table->string('tipo_evidencia', 50)->nullable();
            $table->timestamps();
        });

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

    public function down(): void
    {
        Schema::dropIfExists('historial_ticket');
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('bitacoras_reparacion');
        Schema::dropIfExists('evidencias_reparacion');
        Schema::dropIfExists('reparaciones');
        Schema::dropIfExists('materiales_ticket');
        Schema::dropIfExists('solicitudes_materiales');
    }
};
