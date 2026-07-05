<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('valoraciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->unique()->constrained('tickets')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('tecnico_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->text('diagnostico');
            $table->unsignedInteger('tiempo_estimado_horas')->nullable();
            $table->string('estado', 30)->default('Pendiente');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('valoraciones');
    }
};
