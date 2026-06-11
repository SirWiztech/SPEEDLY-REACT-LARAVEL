<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsDriver
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'driver') {
            return redirect()->route('login');
        }

        return $next($request);
    }
}
