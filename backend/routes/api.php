<?php

use App\Http\Controllers\Api\ApplicationHealthController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MaintenanceReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RepairArchiveController;
use App\Http\Controllers\Api\RepairController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ValoracionController;
use Illuminate\Support\Facades\Route;

Route::get('/health', ApplicationHealthController::class);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/register', [AuthController::class, 'register']);

Route::middleware(['auth:sanctum', 'active'])->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/ticket-catalogs', [TicketController::class, 'catalogs']);
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::get('/tickets/{ticket}/reporte-reparacion', MaintenanceReportController::class);

    Route::get('/bitacoras-reparacion', [RepairArchiveController::class, 'index']);
    Route::get('/bitacoras-reparacion/{bitacora}', [RepairArchiveController::class, 'show']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'read']);

    // Solo "Personal de Mantenimiento" puede registrar valoraciones y ver las suyas.
    Route::middleware('role:Personal de Mantenimiento')->group(function () {
        Route::post('/valoraciones', [ValoracionController::class, 'store']);
        Route::get('/valoraciones/mis-valoraciones', [ValoracionController::class, 'misValoraciones']);
        Route::put('/valoraciones/{valoracion}/reenviar', [ValoracionController::class, 'reenviar']);
        Route::get('/reparaciones', [RepairController::class, 'index']);
        Route::post('/tickets/{ticket}/reparacion', [RepairController::class, 'store']);
        Route::post('/reparaciones/{reparacion}/finalizar', [RepairController::class, 'finish']);
    });

    // Exclusivo de "Subdirector Administrativo".
    Route::middleware('role:Subdirector Administrativo')->group(function () {
        Route::get('/valoraciones/pendientes', [ValoracionController::class, 'pendientes']);
        Route::get('/valoraciones/{valoracion}', [ValoracionController::class, 'show']);
        Route::post('/valoraciones/{valoracion}/autorizar', [ValoracionController::class, 'autorizar']);
        Route::post('/valoraciones/{valoracion}/rechazar', [ValoracionController::class, 'rechazar']);

        Route::get('/usuarios', [UserController::class, 'index']);
        Route::get('/usuarios/{usuario}', [UserController::class, 'show']);
        Route::put('/usuarios/{usuario}', [UserController::class, 'update']);
        Route::put('/usuarios/{usuario}/rol', [UserController::class, 'updateRole']);
    });

});
