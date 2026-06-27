<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 20)->unique();
            $table->unsignedBigInteger('zona_id');
            $table->unsignedBigInteger('creado_por');
            $table->unsignedBigInteger('asignado_a')->nullable();
            $table->string('categoria', 100);
            $table->string('ubicacion_exacta');
            $table->text('descripcion');
            $table->enum('prioridad', ['baja', 'media', 'alta', 'critica'])->default('media');
            $table->enum('estado', ['pendiente', 'valorado', 'autorizado', 'rechazado', 'reparado'])->default('pendiente');
            $table->text('motivo_rechazo')->nullable();
            $table->timestamps();
            $table->foreign('zona_id')->references('id')->on('zonas')->cascadeOnDelete();
            $table->foreign('creado_por')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('asignado_a')->references('id')->on('users')->nullOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('tickets');
    }
};
