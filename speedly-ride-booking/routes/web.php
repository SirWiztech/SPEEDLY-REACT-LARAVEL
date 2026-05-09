<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes (No Auth)
|--------------------------------------------------------------------------
*/
Route::inertia('/', 'Splash')->name('splash');

Route::inertia('/home', 'Home', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::inertia('/login', 'Form')->name('login');
Route::inertia('/register', 'Form')->name('register');
Route::inertia('/form', 'Form')->name('form');

Route::middleware(['guest'])->group(function () {
    Route::inertia('/forgot-password', 'ForgotPassword')->name('password.request');
    Route::inertia('/reset-password', 'ResetPassword')->name('password.reset');
    Route::inertia('/verify-otp', 'VerifyOtp')->name('verify.otp');
    Route::inertia('/admin-login', 'Admin-Login')->name('admin.login');
    Route::inertia('/forgot-admin-password', 'ForgotAdminPassword')->name('admin.forgot-password');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // Shared auth pages
    Route::inertia('/verifyotp', 'VerifyOtp')->name('verifyotp');
    Route::inertia('/generatereceipt', 'GenerateReceipt')->name('generatereceipt');
    Route::inertia('/paymentcallback', 'PaymentCallback')->name('paymentcallback');
    Route::inertia('/paymentprocessing', 'PaymentProcessing')->name('paymentprocess');

    /*
    |--------------------------------------------------------------------------
    | Client Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('client')->group(function () {
        Route::inertia('/clientdashboard', 'ClientDashboard')->name('clientdashboard');
        Route::inertia('/clientbookride', 'ClientBookRide')->name('clientbookride');
        Route::inertia('/clientridehistory', 'ClientRideHistory')->name('clientridehistory');
        Route::inertia('/clientwallet', 'ClientWallet')->name('clientwallet');
        Route::inertia('/clientlocation', 'ClientLocation')->name('clientlocation');
        Route::inertia('/clientaiassistant', 'ClientAIAssistant')->name('clientaiassistant');
        Route::inertia('/clientsettings', 'ClientSettings')->name('clientsettings');
        Route::inertia('/clientsupport', 'ClientSupport')->name('clientsupport');
        Route::inertia('/client-profile', 'ClientProfile')->name('clientprofile');
    });

    /*
    |--------------------------------------------------------------------------
    | Driver Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('driver')->group(function () {
        Route::inertia('/driverdashboard', 'DriverDashboard')->name('driverdashboard');
        Route::inertia('/driverbookhistory', 'DriverBookHistory')->name('driverbookhistory');
        Route::inertia('/driverwallet', 'DriverWallet')->name('driverwallet');
        Route::inertia('/driverlocation', 'DriverLocation')->name('driverlocation');
        Route::inertia('/driveraiassistant', 'DriverAIAssistant')->name('driveraiassistant');
        Route::inertia('/driverkyc', 'DriverKyc')->name('driverkyc');
        Route::inertia('/driversettings', 'DriverSettings')->name('driversettings');
        Route::inertia('/driversupport', 'DriverSupport')->name('driversupport');
        Route::inertia('/driver-profile', 'DriverProfile')->name('driverprofile');
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->group(function () {
        Route::inertia('/admindashboard', 'AdminDashboard')->name('admindashboard');
    });
});

require __DIR__.'/settings.php';
