<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Los campos de aprobación ya forman parte de la estructura oficial
        // `solicitudes_materiales` creada en la migración anterior.
    }

    public function down(): void
    {
        //
    }
};
