<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('users', function (Blueprint $table) {

        $table->foreignId('tipo_usuario_id')
            ->nullable()
            ->after('id')
            ->constrained('tipos_usuarios')
            ->cascadeOnUpdate()
            ->restrictOnDelete();

    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropForeign(['tipo_usuario_id']);
            $table->dropColumn('tipo_usuario_id');
        });
    }
};
