<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class SeoMiddleware
{
    private array $seoMap = [
        '/' => [
            'title' => 'Speedly — Fast Rides in Onitsha',
            'description' => 'Book rides instantly with Speedly. Trusted ride-hailing and booking service in Onitsha, Anambra State.',
        ],
        '/home' => [
            'title' => 'Home — Speedly',
            'description' => 'Welcome to Speedly — your reliable ride-hailing and booking platform in Onitsha, Nigeria.',
        ],
        '/login' => [
            'title' => 'Sign In — Speedly',
            'description' => 'Sign in to your Speedly account to book rides, track drivers, and manage payments.',
        ],
        '/register' => [
            'title' => 'Create Account — Speedly',
            'description' => 'Join Speedly today. Sign up as a rider or driver and start earning or booking rides instantly.',
        ],
        '/clientdashboard' => [
            'title' => 'My Dashboard — Speedly',
            'description' => 'Manage your rides, wallet, and settings from your Speedly client dashboard.',
        ],
        '/clientbookride' => [
            'title' => 'Book a Ride — Speedly',
            'description' => 'Book a ride in Onitsha and Anambra with Speedly. Fast, safe, and affordable ride-hailing.',
        ],
        '/clientridehistory' => [
            'title' => 'Ride History — Speedly',
            'description' => 'View your past and upcoming rides on Speedly. Track receipts and ratings.',
        ],
        '/clientwallet' => [
            'title' => 'Wallet — Speedly',
            'description' => 'Manage your Speedly wallet — add funds, view transactions, and request withdrawals.',
        ],
        '/clientlocation' => [
            'title' => 'Track Ride — Speedly',
            'description' => 'Track your active ride in real-time with GPS on Speedly.',
        ],
        '/clientsettings' => [
            'title' => 'Settings — Speedly',
            'description' => 'Update your profile, security, payment methods, and preferences on Speedly.',
        ],
        '/clientsupport' => [
            'title' => 'Support — Speedly',
            'description' => 'Get help with your Speedly account, rides, payments, and more.',
        ],
        '/client-profile' => [
            'title' => 'My Profile — Speedly',
            'description' => 'View and edit your Speedly client profile information.',
        ],
        '/driverdashboard' => [
            'title' => 'Driver Dashboard — Speedly',
            'description' => 'View ride requests, earnings, and manage your Speedly driver account.',
        ],
        '/driverbookhistory' => [
            'title' => 'Ride History — Speedly Driver',
            'description' => 'View your completed, accepted, and declined ride history.',
        ],
        '/driverwallet' => [
            'title' => 'Driver Wallet — Speedly',
            'description' => 'Manage your Speedly driver wallet, withdrawals, and payout settings.',
        ],
        '/driverlocation' => [
            'title' => 'GPS Tracking — Speedly Driver',
            'description' => 'View your current location and active ride GPS tracking.',
        ],
        '/driveraiassistant' => [
            'title' => 'AI Assistant — Speedly',
            'description' => 'Get instant help and answers from the Speedly AI assistant.',
        ],
        '/driverkyc' => [
            'title' => 'KYC Verification — Speedly',
            'description' => 'Complete your KYC verification to start driving with Speedly.',
        ],
        '/driversettings' => [
            'title' => 'Driver Settings — Speedly',
            'description' => 'Manage your driver profile, vehicle, bank details, and preferences.',
        ],
        '/driversupport' => [
            'title' => 'Driver Support — Speedly',
            'description' => 'Get help with your Speedly driver account, rides, and earnings.',
        ],
        '/driver-profile' => [
            'title' => 'Driver Profile — Speedly',
            'description' => 'View and edit your Speedly driver profile information.',
        ],
        '/generatereceipt' => [
            'title' => 'Ride Receipt — Speedly',
            'description' => 'View your ride receipt, fare breakdown, and QR code for fund release.',
        ],
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->getPathInfo();
        $seo = $this->seoMap[$path] ?? [
            'title' => 'Speedly — Fast Rides in Onitsha',
            'description' => 'Book rides instantly with Speedly. Ride-hailing and delivery in Onitsha, Anambra.',
        ];

        Inertia::share('seo', $seo);

        return $next($request);
    }
}
