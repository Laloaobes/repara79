<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }
        $userRole = $user->tipoUsuario->nombre ?? '';
        if (!in_array($userRole, $roles)) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }
        return $next($request);
    }
}
