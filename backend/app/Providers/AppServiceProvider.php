<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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
        RateLimiter::for('login', function (Request $request): array {
            $email = Str::lower(trim((string) $request->input('email')));
            $response = fn () => response()->json([
                'success' => false,
                'message' => 'Demasiados intentos. Espera un minuto antes de volver a intentar.',
            ], 429);

            return [
                Limit::perMinute(config('deployment.login_attempts_per_minute', 5))
                    ->by('login:email:'.$email)
                    ->response($response),
                Limit::perMinute(30)
                    ->by('login:ip:'.$request->ip())
                    ->response($response),
            ];
        });
    }
}
