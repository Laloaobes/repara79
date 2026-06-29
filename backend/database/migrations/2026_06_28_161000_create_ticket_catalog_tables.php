<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sedes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->text('direccion')->nullable();
            $table->timestamps();
        });

        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sede_id')->nullable()->constrained('sedes')->cascadeOnUpdate()->nullOnDelete();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->text('ubicacion')->nullable();
            $table->timestamps();
        });

        Schema::create('tipos_desperfectos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        Schema::create('estados_ticket', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50)->unique();
            $table->text('descripcion')->nullable();
            $table->integer('orden')->nullable();
            $table->timestamps();
        });

        Schema::create('prioridades_ticket', function (Blueprint $table) {
            $table->id('id_prioridad');
            $table->string('nombre', 20)->unique();
            $table->string('color', 20);
            $table->string('descripcion', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prioridades_ticket');
        Schema::dropIfExists('estados_ticket');
        Schema::dropIfExists('tipos_desperfectos');
        Schema::dropIfExists('areas');
        Schema::dropIfExists('sedes');
    }
};
