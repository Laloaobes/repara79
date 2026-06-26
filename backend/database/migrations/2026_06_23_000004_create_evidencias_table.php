<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('evidencias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ticket_id');
            $table->string('ruta_archivo');
            $table->string('nombre_archivo');
            $table->string('tipo_archivo', 50);
            $table->timestamps();
            $table->foreign('ticket_id')->references('id')->on('tickets')->cascadeOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('evidencias');
    }
};
