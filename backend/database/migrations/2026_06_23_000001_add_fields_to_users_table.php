<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->string('telefono', 20)->nullable()->after('email');
            $table->boolean('estatus')->default(true)->after('telefono');
            $table->unsignedBigInteger('zona_id')->nullable()->after('estatus');
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telefono', 'estatus', 'zona_id']);
        });
    }
};
