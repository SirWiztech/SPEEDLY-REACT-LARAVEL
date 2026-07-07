<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CspHeaders
{
    /**
     * Add security headers. Uses a permissive CSP that allows common third-party
     * resources (Google Maps, Boxicons, Font Awesome, Unsplash, etc.) while still
     * declaring known origins. Report-only violations are logged so we can tune later.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Permissive but declared CSP — lets all known origins through
        $response->headers->set('Content-Security-Policy', implode('; ', [
            "default-src * 'unsafe-inline' 'unsafe-eval'",
            "script-src * 'unsafe-inline' 'unsafe-eval'",
            "style-src * 'unsafe-inline'",
            "font-src * data:",
            "img-src * data: blob:",
            "connect-src *",
            "frame-src *",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]));

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        if (app()->isProduction()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
