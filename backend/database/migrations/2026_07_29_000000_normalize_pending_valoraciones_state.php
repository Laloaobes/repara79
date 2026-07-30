<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (
            ! Schema::hasTable('solicitudes_materiales')
            || ! Schema::hasTable('materiales_ticket')
            || ! Schema::hasTable('tickets')
            || ! Schema::hasTable('estados_ticket')
        ) {
            return;
        }

        $estadoValoradoId = DB::table('estados_ticket')
            ->where('nombre', 'Valorado')
            ->value('id');

        if (! $estadoValoradoId) {
            return;
        }

        $idsNormalizables = DB::table('solicitudes_materiales as solicitud')
            ->join('tickets as ticket', 'ticket.id', '=', 'solicitud.ticket_id')
            ->where('solicitud.estado_general', 'Pendiente')
            ->where('ticket.estado_id', $estadoValoradoId)
            ->whereNotNull('solicitud.observaciones')
            ->where('solicitud.observaciones', '<>', '')
            ->whereNotNull('solicitud.valorado_por')
            ->whereNotNull('solicitud.fecha_creacion')
            ->whereExists(function ($query) {
                $query->selectRaw('1')
                    ->from('materiales_ticket as material')
                    ->whereColumn('material.solicitud_id', 'solicitud.id');
            })
            ->whereNotExists(function ($query) {
                $query->selectRaw('1')
                    ->from('materiales_ticket as material_invalido')
                    ->whereColumn('material_invalido.solicitud_id', 'solicitud.id')
                    ->where(function ($invalid) {
                        $invalid
                            ->where('material_invalido.cantidad', '<', 1)
                            ->orWhere('material_invalido.costo_unitario', '<', 0);
                    });
            })
            ->pluck('solicitud.id');

        if ($idsNormalizables->isNotEmpty()) {
            DB::table('solicitudes_materiales')
                ->whereIn('id', $idsNormalizables)
                ->update([
                    'estado_general' => 'Pendiente de autorización',
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // No se revierte automáticamente: hacerlo también degradaría valoraciones
        // legítimas creadas después de esta migración con el contrato definitivo.
    }
};
