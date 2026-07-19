<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Esto fuerza a Laravel a resolver una dependencia inexistente
        // al arrancar. Romperá la web y TODOS los comandos de 'php artisan'.
        if (env('APP_ENV') !== 'testing') {
            app()->make('ServicioFantasmaQueNoExiste');
        }
    }
}
