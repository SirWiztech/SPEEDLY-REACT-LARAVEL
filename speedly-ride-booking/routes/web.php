<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

Route::inertia('/', 'Splash')->name('splash');

Route::inertia('/home', 'Home', [
    'canRegister' => Features::enabled(Features::registration()),
    'isLoggedIn' => session('logged_in', false),
])->name('home');

Route::inertia('/client_dashboard', 'ClientDashboard')->name('client_dashboard');
Route::inertia('/client_book_ride', 'ClientBookRide')->name('client_book_ride');
Route::inertia('/client_ride_history', 'ClientRideHistory')->name('client_ride_history');

Route::middleware(['guest'])->group(function () {
    Route::inertia('/auth/login', 'auth/login')->name('login');
    Route::inertia('/auth/register', 'auth/register')->name('register');
    Route::inertia('/auth/forgot-password', 'auth/forgot-password')->name('password.request');
    Route::inertia('/auth/reset-password', 'auth/reset-password')->name('password.reset');
    Route::inertia('/auth/confirm-password', 'auth/confirm-password')->name('password.confirm');
    Route::inertia('/auth/verify-email', 'auth/verify-email')->name('verification.notice');
    Route::inertia('/auth/two-factor-challenge', 'auth/two-factor-challenge')->name('two-factor.login');
    Route::inertia('/forgot-password', 'ForgotPassword')->name('client.forgot-password');
    Route::inertia('/reset-password', 'ResetPassword')->name('client.reset-password');
    Route::inertia('/admin-login', 'Admin-Login')->name('admin.login');
    Route::inertia('/forgot-admin-password', 'ForgotAdminPassword')->name('admin.forgot-password');
    Route::inertia('/verify-otp', 'VerifyOtp')->name('verify.otp');
    Route::inertia('/form', 'Form')->name('form');
});

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::inertia('/settings/profile', 'settings/profile')->name('profile.edit');
    Route::inertia('/settings/security', 'settings/security')->name('security.edit');
    Route::inertia('/settings/appearance', 'settings/appearance')->name('appearance.edit');

    // Client Routes (accessible without auth - dashboard moved outside)
    Route::prefix('client')->name('client_')->group(function () {
        Route::get('/book-ride', fn() => Inertia::render('ClientBookRide'))->name('book-ride');
        Route::get('/wallet', fn() => Inertia::render('ClientWallet'))->name('wallet');
        Route::get('/profile', fn() => Inertia::render('ClientProfile'))->name('profile');
        Route::get('/kyc', fn() => Inertia::render('ClientKyc'))->name('kyc');
        Route::get('/rides/history', fn() => Inertia::render('ClientRideHistory'))->name('rides.history');
        Route::get('/location', fn() => Inertia::render('ClientLocation'))->name('location');
        Route::get('/support', fn() => Inertia::render('ClientSupport'))->name('support');
        Route::get('/settings', fn() => Inertia::render('ClientSettings'))->name('settings');
        Route::get('/ai-assistant', fn() => Inertia::render('ClientAIAssistant'))->name('ai-assistant');
    });

    // Driver Routes
    Route::prefix('driver')->name('driver.')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('DriverDashboard'))->name('dashboard');
        Route::get('/wallet', fn() => Inertia::render('DriverWallet'))->name('wallet');
        Route::get('/profile', fn() => Inertia::render('DriverProfile'))->name('profile');
        Route::get('/kyc', fn() => Inertia::render('DriverKyc'))->name('kyc');
        Route::get('/rides/history', fn() => Inertia::render('DriverBookHistory'))->name('rides.history');
        Route::get('/location', fn() => Inertia::render('DriverLocation'))->name('location');
        Route::get('/support', fn() => Inertia::render('DriverSupport'))->name('support');
        Route::get('/settings', fn() => Inertia::render('DriverSettings'))->name('settings');
        Route::get('/ai-assistant', fn() => Inertia::render('DriverAIAssistant'))->name('ai-assistant');
    });

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('AdminDashboard'))->name('dashboard');
    });

    // Payment Routes
    Route::get('/payment/callback', fn() => Inertia::render('PaymentCallback'))->name('payment.callback');
    Route::get('/payment/processing', fn() => Inertia::render('PaymentProcessing'))->name('payment.processing');
    Route::get('/receipt/generate', fn() => Inertia::render('GenerateReceipt'))->name('receipt.generate');
});

require __DIR__.'/settings.php';
