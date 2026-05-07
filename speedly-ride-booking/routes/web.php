<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

Route::inertia('/', 'Splash')->name('splash');

Route::inertia('/home', 'Home', [
    'canRegister' => Features::enabled(Features::registration()),
    'isLoggedIn' => session('logged_in', false),
])->name('home');

Route::inertia('/clientdashboard', 'ClientDashboard')->name('clientdashboard');
Route::inertia('/clientbookride', 'ClientBookRide')->name('clientbookride');
Route::inertia('/clientridehistory', 'ClientRideHistory')->name('clientridehistory');
Route::inertia('/clientwallet', 'ClientWallet')->name('clientwallet');
Route::inertia('/clientlocation ', 'ClientLocation')->name('clientlocation');
Route::inertia('/clientaiassistant', 'ClientAIAssistant')->name('clientaiassistant');
Route::inertia('/clientsettings', 'ClientSettings')->name('clientsettings');

Route::inertia('/driverdashboard', 'DriverDashboard')->name('driverdashboard');
Route::inertia('/driverbookhistory', 'DriverBookHistory')->name('driverbookhistory');
Route::inertia('/driverwallet', 'DriverWallet')->name('driverwallet');
Route::inertia('/driverlocation ', 'DriverLocation')->name('driverlocation');
Route::inertia('/driveraiassistant', 'DriverAIAssistant')->name('driveraiassistant');
Route::inertia('/driverkyc', 'DriverKyc')->name('driverkyc');
Route::inertia('/driversettings', 'DriverSettings')->name('driversettings');

Route::inertia('/verifyotp', 'VerifyOtp')->name('verifyotp');
Route::inertia('/forgotpassword', 'ForgotPassword')->name('passwordrequest');
Route::inertia('/resetpassword', 'ResetPassword')->name('passwordreset');
Route::inertia('/generatereceipt', 'GenerateReceipt')->name('generatereceipt');
Route::inertia('/paymentcallback', 'PaymentCallback')->name('paymentcallback');
Route::inertia('/paymentprocessing', 'PaymentProcessing')->name('paymentprocess');
Route::inertia('/adminlogin', 'Admin-Login')->name('adminlogin');
Route::inertia('/admindashboard', 'AdminDashboard')->name('admindashboard');
Route::inertia('/driversupport', 'DriverSupport')->name('driversupport');
Route::inertia('/clientsupport', 'ClientSupport')->name('clientsupport');
Route::inertia('/forgotadminpassword', 'ForgotAdminPassword')->name('forgotadminpassword');



Route::middleware(['guest'])->group(function () {
    Route::inertia('/login', 'Form')->name('login');
    Route::inertia('/register', 'Form')->name('register');
    Route::inertia('/forgot-password', 'ForgotPassword')->name('password.request');
    Route::inertia('/reset-password', 'ResetPassword')->name('password.reset');
    Route::inertia('/admin-login', 'Admin-Login')->name('admin.login');
    Route::inertia('/forgot-admin-password', 'ForgotAdminPassword')->name('admin.forgot-password');
    Route::inertia('/verify-otp', 'VerifyOtp')->name('verify.otp');
    Route::inertia('/form', 'Form')->name('form');
});

Route::middleware(['auth'])->group(function () {
    Route::inertia('/dashboard', 'dashboard')->name('dashboard');
    Route::inertia('/settings/profile', 'settings/profile')->name('profile.edit');
    Route::inertia('/settings/security', 'settings/security')->name('security.edit');
    Route::inertia('/settings/appearance', 'settings/appearance')->name('appearance.edit');

    // Client Routes (accessible without auth - dashboard moved outside)
    Route::prefix('client')->name('client_')->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('ClientBookRide'))->name('dashboard');
        Route::get('/book-ride', fn() => Inertia::render('ClientBookRide'))->name('book-ride');
        Route::get('/wallet', fn() => Inertia::render('ClientWallet'))->name('wallet');
        Route::get('/profile', fn() => Inertia::render('ClientProfile'))->name('profile');
        Route::get('/kyc', fn() => Inertia::render('ClientKyc'))->name('kyc');
        Route::get('/rideshistory', fn() => Inertia::render('ClientRideHistory'))->name('rides_history');
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
        Route::get('/bookhistory', fn() => Inertia::render('DriverBookHistory'))->name('rides.history');
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
