<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
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

    // Solo "Personal de Mantenimiento" puede registrar valoraciones y cerrar tickets.
    Route::middleware('role:Personal de Mantenimiento')->group(function () {
        Route::post('/valoraciones', [ValoracionController::class, 'store']);
        Route::get('/valoraciones/mis-valoraciones', [ValoracionController::class, 'misValoraciones']);
        Route::delete('/valoraciones/{valoracion}/materiales/{materialIndex}', [ValoracionController::class, 'destroyMaterial']);
        Route::post('/tickets/{ticket}/marcar-reparado', [TicketController::class, 'marcarReparado']);
    });

    // Exclusivo de "Subdirector Administrativo".
    Route::middleware('role:Subdirector Administrativo')->group(function () {
        Route::get('/valoraciones/pendientes', [ValoracionController::class, 'pendientes']);
        Route::post('/valoraciones/{valoracion}/autorizar', [ValoracionController::class, 'autorizar']);
        Route::post('/valoraciones/{valoracion}/rechazar', [ValoracionController::class, 'rechazar']);

        Route::get('/usuarios', [UserController::class, 'index']);
        Route::get('/usuarios/{usuario}', [UserController::class, 'show']);
        Route::put('/usuarios/{usuario}', [UserController::class, 'update']);
        Route::put('/usuarios/{usuario}/rol', [UserController::class, 'updateRole']);
    });

});
