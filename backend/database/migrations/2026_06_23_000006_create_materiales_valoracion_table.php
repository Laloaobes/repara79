<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('materiales_valoracion', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('valoracion_id');
            $table->string('nombre');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
            $table->foreign('valoracion_id')->references('id')->on('valoraciones')->cascadeOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('materiales_valoracion');
    }
};
