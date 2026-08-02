<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FinishRepairRequest;
use App\Http\Requests\StartRepairRequest;
use App\Http\Resources\RepairResource;
use App\Models\Reparacion;
use App\Models\Ticket;
use App\Services\RepairService;

class RepairController extends Controller
{
    public function index(RepairService $service)
    {
        $tray = $service->tray(request()->user());

        return response()->json([
            'success' => true,
            'data' => [
                'disponibles' => $tray['disponibles'],
                'en_curso' => RepairResource::collection($tray['en_curso'])->resolve(),
            ],
        ]);
    }

    public function store(StartRepairRequest $request, Ticket $ticket, RepairService $service)
    {
        $repair = $service->start(
            $ticket,
            $request->user(),
            $request->validated('estado_inicial')
        );

        return response()->json([
            'success' => true,
            'message' => 'Reparación iniciada correctamente.',
            'data' => (new RepairResource($repair))->resolve(),
        ], 201);
    }

    public function finish(
        FinishRepairRequest $request,
        Reparacion $reparacion,
        RepairService $service
    ) {
        $result = $service->finish($reparacion, $request->user(), $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Reparación finalizada, reportada y archivada correctamente.',
            'data' => (new RepairResource($result['repair']))->resolve(),
        ]);
    }
}
