<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\ValoracionController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/ticket-catalogs', [TicketController::class, 'catalogs']);
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);

    // Solo "Personal de Mantenimiento" puede registrar una valoración técnica.
    Route::middleware('role:Personal de Mantenimiento')->group(function () {
        Route::post('/valoraciones', [ValoracionController::class, 'store']);
    });

});
