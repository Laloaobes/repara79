<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'apellido_paterno')) {
                $table->string('apellido_paterno', 100)->nullable()->after('name');
            }

            if (!Schema::hasColumn('users', 'apellido_materno')) {
                $table->string('apellido_materno', 100)->nullable()->after('apellido_paterno');
            }

            if (!Schema::hasColumn('users', 'telefono')) {
                $table->string('telefono', 20)->nullable()->after('apellido_materno');
            }

            if (!Schema::hasColumn('users', 'nombre_usuario')) {
                $table->string('nombre_usuario', 100)->nullable()->unique()->after('telefono');
            }

            if (!Schema::hasColumn('users', 'imagen_perfil')) {
                $table->text('imagen_perfil')->nullable()->after('nombre_usuario');
            }

            if (!Schema::hasColumn('users', 'activo')) {
                $table->boolean('activo')->default(true)->after('imagen_perfil');
            }

            if (!Schema::hasColumn('users', 'ultimo_acceso')) {
                $table->timestamp('ultimo_acceso')->nullable()->after('activo');
            }

            if (!Schema::hasColumn('users', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach ([
                'apellido_paterno',
                'apellido_materno',
                'telefono',
                'nombre_usuario',
                'imagen_perfil',
                'activo',
                'ultimo_acceso',
                'deleted_at',
            ] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
