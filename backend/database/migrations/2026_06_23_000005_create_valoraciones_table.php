<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('valoraciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ticket_id')->unique();
            $table->unsignedBigInteger('tecnico_id');
            $table->integer('tiempo_estimado')->comment('horas');
            $table->decimal('costo_total', 10, 2)->default(0);
            $table->text('observaciones')->nullable();
            $table->timestamps();
            $table->foreign('ticket_id')->references('id')->on('tickets')->cascadeOnDelete();
            $table->foreign('tecnico_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('valoraciones');
    }
};
