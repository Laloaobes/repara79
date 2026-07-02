<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\EstadoTicket;
use App\Models\PrioridadTicket;
use App\Models\Sede;
use App\Models\TipoDesperfecto;
use Illuminate\Database\Seeder;

class CatalogosTicketsSeeder extends Seeder
{
    public function run(): void
    {
        $sedePrincipal = Sede::updateOrCreate(
            ['nombre' => 'CBTA 79'],
            [
                'descripcion' => 'Sede principal del plantel',
                'direccion' => 'Zinacantepec, Estado de México',
            ]
        );

        foreach ([
            ['nombre' => 'Dirección', 'ubicacion' => 'Edificio administrativo'],
            ['nombre' => 'Aulas', 'ubicacion' => 'Edificios académicos'],
            ['nombre' => 'Laboratorios', 'ubicacion' => 'Zona académica'],
            ['nombre' => 'Talleres', 'ubicacion' => 'Zona práctica'],
            ['nombre' => 'Baños', 'ubicacion' => 'Servicios generales'],
            ['nombre' => 'Áreas exteriores', 'ubicacion' => 'Patios y jardines'],
        ] as $area) {
            Area::updateOrCreate(
                [
                    'sede_id' => $sedePrincipal->id,
                    'nombre' => $area['nombre'],
                ],
                [
                    'ubicacion' => $area['ubicacion'],
                ]
            );
        }

        foreach ([
            ['nombre' => 'Baja', 'color' => 'Verde', 'descripcion' => 'Incidencia menor sin impacto operativo'],
            ['nombre' => 'Media', 'color' => 'Amarillo', 'descripcion' => 'Incidencia con impacto moderado'],
            ['nombre' => 'Alta', 'color' => 'Naranja', 'descripcion' => 'Incidencia que requiere atención prioritaria'],
            ['nombre' => 'Crítica', 'color' => 'Rojo', 'descripcion' => 'Incidencia que afecta significativamente la operación'],
        ] as $prioridad) {
            PrioridadTicket::updateOrCreate(
                ['nombre' => $prioridad['nombre']],
                $prioridad
            );
        }

        foreach ([
            ['nombre' => 'Eléctrico', 'descripcion' => 'Problemas relacionados con instalaciones eléctricas, luminarias, contactos o cableado'],
            ['nombre' => 'Hidráulico', 'descripcion' => 'Problemas relacionados con fugas, tuberías, lavabos, sanitarios o suministro de agua'],
            ['nombre' => 'Infraestructura', 'descripcion' => 'Daños en muros, pisos, techos, ventanas, puertas o estructura física'],
            ['nombre' => 'Mobiliario', 'descripcion' => 'Daños en sillas, mesas, escritorios, pizarrones u otro mobiliario'],
            ['nombre' => 'Equipamiento', 'descripcion' => 'Problemas con equipo escolar, tecnológico o de laboratorio'],
            ['nombre' => 'Otro', 'descripcion' => 'Tipo de desperfecto no contemplado en las categorías anteriores'],
        ] as $tipo) {
            TipoDesperfecto::updateOrCreate(
                ['nombre' => $tipo['nombre']],
                $tipo
            );
        }

        foreach ([
            ['nombre' => 'Pendiente', 'orden' => 1, 'descripcion' => 'El ticket fue registrado y queda en espera de inspección.'],
            ['nombre' => 'Valorado', 'orden' => 2, 'descripcion' => 'El desperfecto fue inspeccionado y valorado.'],
            ['nombre' => 'Autorizado', 'orden' => 3, 'descripcion' => 'La propuesta de atención fue autorizada.'],
            ['nombre' => 'En reparación', 'orden' => 4, 'descripcion' => 'El personal se encuentra ejecutando la reparación.'],
            ['nombre' => 'Rechazado', 'orden' => 5, 'descripcion' => 'La propuesta fue rechazada para corrección.'],
            ['nombre' => 'Reparado', 'orden' => 6, 'descripcion' => 'La reparación fue concluida satisfactoriamente.'],
        ] as $estado) {
            EstadoTicket::updateOrCreate(
                ['nombre' => $estado['nombre']],
                $estado
            );
        }
    }
}
