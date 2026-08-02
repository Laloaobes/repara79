<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->activo) {
            return response()->json([
                'success' => false,
                'message' => 'La cuenta se encuentra inactiva.',
            ], 403);
        }

        return $next($request);
    }
}
