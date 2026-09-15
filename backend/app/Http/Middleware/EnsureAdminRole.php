<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    private const ADMIN_ROLES = [
        'super_admin',
        'admin',
        'manager',
        'warehouse',
        'support',
        'finance',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('sanctum')->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $adminEmail = config('app.admin_email', env('ADMIN_EMAIL', 'admin@indiuna.com'));
        $hasRole = $user->roles()->whereIn('name', self::ADMIN_ROLES)->exists();

        if (!$hasRole && strtolower($user->email) !== strtolower($adminEmail)) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        return $next($request);
    }
}
