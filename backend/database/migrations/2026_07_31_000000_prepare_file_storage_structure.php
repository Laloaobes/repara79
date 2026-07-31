<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('profile_uuid')->nullable()->unique()->after('id');
        });

        DB::table('users')
            ->whereNull('profile_uuid')
            ->orderBy('id')
            ->eachById(function ($user): void {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['profile_uuid' => (string) Str::uuid()]);
            });

        Schema::table('tickets', function (Blueprint $table) {
            $table->renameColumn('fotografia_inicial', 'fotografia_referencia');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->renameColumn('fotografia_referencia', 'fotografia_inicial');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['profile_uuid']);
            $table->dropColumn('profile_uuid');
        });
    }
};
