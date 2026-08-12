<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('usuario_area')) {
            return;
        }

        Schema::create('usuario_area', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('usuario_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('area_id')
                ->constrained('areas')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->unique(['usuario_id', 'area_id']);
        });
    }

    public function down(): void
    {
        // Esta migración repara una tabla base que otras épicas utilizan. No se
        // elimina automáticamente al revertir para evitar perder asignaciones.
    }
};
