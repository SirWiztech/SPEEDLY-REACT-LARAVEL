<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Route;

class SitemapController extends Controller
{
    public function index()
    {
        $pages = [
            // Public pages
            ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'weekly'],
            ['loc' => '/home', 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['loc' => '/login', 'priority' => '0.3', 'changefreq' => 'monthly'],
            ['loc' => '/register', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => '/form', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => '/forgot-password', 'priority' => '0.2', 'changefreq' => 'monthly'],
            ['loc' => '/verify-otp', 'priority' => '0.2', 'changefreq' => 'monthly'],
            ['loc' => '/admin-login', 'priority' => '0.2', 'changefreq' => 'monthly'],

            // Client pages
            ['loc' => '/clientdashboard', 'priority' => '0.7', 'changefreq' => 'daily'],
            ['loc' => '/clientbookride', 'priority' => '0.8', 'changefreq' => 'daily'],
            ['loc' => '/clientridehistory', 'priority' => '0.6', 'changefreq' => 'daily'],
            ['loc' => '/clientwallet', 'priority' => '0.6', 'changefreq' => 'daily'],
            ['loc' => '/clientlocation', 'priority' => '0.5', 'changefreq' => 'weekly'],
            ['loc' => '/clientaiassistant', 'priority' => '0.5', 'changefreq' => 'weekly'],
            ['loc' => '/clientsettings', 'priority' => '0.5', 'changefreq' => 'weekly'],
            ['loc' => '/clientsupport', 'priority' => '0.5', 'changefreq' => 'weekly'],
            ['loc' => '/client-profile', 'priority' => '0.5', 'changefreq' => 'weekly'],

            // Driver pages
            ['loc' => '/driverdashboard', 'priority' => '0.7', 'changefreq' => 'daily'],
            ['loc' => '/driverbookhistory', 'priority' => '0.6', 'changefreq' => 'daily'],
            ['loc' => '/driverwallet', 'priority' => '0.6', 'changefreq' => 'daily'],
            ['loc' => '/driverlocation', 'priority' => '0.5', 'changefreq' => 'weekly'],
            ['loc' => '/driveraiassistant', 'priority' => '0.5', 'changefreq' => 'weekly'],
            ['loc' => '/driverkyc', 'priority' => '0.5', 'changefreq' => 'weekly'],
            ['loc' => '/driversettings', 'priority' => '0.5', 'changefreq' => 'weekly'],
            ['loc' => '/driversupport', 'priority' => '0.5', 'changefreq' => 'weekly'],
            ['loc' => '/driver-profile', 'priority' => '0.5', 'changefreq' => 'weekly'],
        ];

        $content = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $content .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($pages as $page) {
            $content .= '  <url>' . "\n";
            $content .= '    <loc>' . url($page['loc']) . '</loc>' . "\n";
            $content .= '    <priority>' . $page['priority'] . '</priority>' . "\n";
            $content .= '    <changefreq>' . $page['changefreq'] . '</changefreq>' . "\n";
            $content .= '  </url>' . "\n";
        }

        $content .= '</urlset>';

        return response($content, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
