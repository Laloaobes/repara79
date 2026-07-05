<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('valoraciones', function (Blueprint $table) {
            $table->json('materiales')->nullable()->after('diagnostico');
            $table->decimal('costo_estimado', 10, 2)->default(0)->after('materiales');
            $table->text('motivo_rechazo')->nullable()->after('observaciones');
            $table->foreignId('revisado_por_id')->nullable()->after('motivo_rechazo')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('revisado_at')->nullable()->after('revisado_por_id');
        });
    }

    public function down(): void
    {
        Schema::table('valoraciones', function (Blueprint $table) {
            $table->dropForeign(['revisado_por_id']);
            $table->dropColumn(['materiales', 'costo_estimado', 'motivo_rechazo', 'revisado_por_id', 'revisado_at']);
        });
    }
};
