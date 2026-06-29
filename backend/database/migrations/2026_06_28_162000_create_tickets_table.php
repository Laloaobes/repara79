<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('area_id')->nullable()->constrained('areas')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('tipo_desperfecto_id')->nullable()->constrained('tipos_desperfectos')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('estado_id')->nullable()->constrained('estados_ticket')->cascadeOnUpdate()->nullOnDelete();
            $table->unsignedBigInteger('prioridad_id');
            $table->string('otro_desperfecto', 150)->nullable();
            $table->string('titulo', 150);
            $table->text('descripcion_desperfecto');
            $table->text('ubicacion');
            $table->text('fotografia_inicial')->nullable();
            $table->timestamp('fecha_reporte')->nullable();
            $table->timestamps();

            $table->foreign('prioridad_id')
                ->references('id_prioridad')
                ->on('prioridades_ticket')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
