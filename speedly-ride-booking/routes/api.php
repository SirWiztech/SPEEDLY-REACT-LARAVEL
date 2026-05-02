<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DriverBankController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\KYCController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RideController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Auth Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);

Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:web')->group(function () {

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/admin/logout', [AuthController::class, 'adminLogout']);

    // Me / Profile
    Route::get('/me', [AuthController::class, 'me']);

    /*
    |--------------------------------------------------------------------------
    | Ride Booking & Management
    |--------------------------------------------------------------------------
    */
    Route::get('/ride-types', [RideController::class, 'getRideTypes']);
    Route::get('/rides/calculate-fare', [RideController::class, 'calculateFare']);

    Route::post('/rides/book', [RideController::class, 'book']);
    Route::get('/rides/{id}', [RideController::class, 'show']);
    Route::get('/rides/{id}/receipt', [RideController::class, 'receipt']);

    // Driver ride actions
    Route::post('/rides/{id}/accept', [RideController::class, 'accept']);
    Route::post('/rides/{id}/decline', [RideController::class, 'decline']);
    Route::post('/rides/{id}/complete', [RideController::class, 'complete']);
    Route::post('/rides/{id}/cancel', [RideController::class, 'cancel']);
    Route::post('/rides/{id}/rate-driver', [RideController::class, 'rateDriver']);
    Route::post('/rides/{id}/rate-client', [RideController::class, 'rateClient']);

    /*
    |--------------------------------------------------------------------------
    | Client Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('client')->prefix('client')->name('client.')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\ClientController::class, 'stats']);
        Route::get('/rides', [\App\Http\Controllers\Api\ClientController::class, 'rides']);
        Route::get('/rides/history', [\App\Http\Controllers\Api\ClientController::class, 'rideHistory']);
        Route::get('/wallet', [WalletController::class, 'getClientWallet']);
        Route::get('/wallet/transactions', [WalletController::class, 'getClientTransactions']);
        Route::get('/profile', [\App\Http\Controllers\Api\ClientController::class, 'profile']);
        Route::post('/profile/update', [\App\Http\Controllers\Api\ClientController::class, 'updateProfile']);
        Route::get('/locations', [LocationController::class, 'getClientLocations']);
        Route::post('/support', [\App\Http\Controllers\Api\ClientController::class, 'support']);

        // Client KYC
        Route::get('/kyc', [KYCController::class, 'getClientKyc']);
        Route::post('/kyc/upload', [KYCController::class, 'uploadClientKyc']);
    });

    /*
    |--------------------------------------------------------------------------
    | Driver Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('driver')->prefix('driver')->name('driver.')->group(function () {
        Route::get('/stats', [DriverController::class, 'stats']);
        Route::get('/rides', [DriverController::class, 'rides']);
        Route::get('/rides/history', [DriverController::class, 'rideHistory']);
        Route::get('/rides/pending', [DriverController::class, 'pendingRides']);
        Route::get('/wallet', [WalletController::class, 'getDriverWallet']);
        Route::get('/wallet/transactions', [WalletController::class, 'getDriverTransactions']);
        Route::post('/wallet/withdraw', [WalletController::class, 'requestWithdrawal']);
        Route::get('/profile', [DriverController::class, 'profile']);
        Route::post('/profile/update', [DriverController::class, 'updateProfile']);
        Route::get('/locations', [LocationController::class, 'getDriverLocations']);
        Route::post('/toggle-status', [DriverController::class, 'toggleStatus']);
        Route::post('/update-location', [DriverController::class, 'updateLocation']);
        Route::post('/support', [DriverController::class, 'support']);

        // Driver KYC
        Route::get('/kyc', [KYCController::class, 'getDriverKyc']);
        Route::post('/kyc/upload', [KYCController::class, 'uploadDriverKyc']);

        // Nearby drivers (for clients to find nearby drivers)
        Route::get('/nearby', [DriverController::class, 'getNearbyDrivers']);

        // Bank details
        Route::get('/bank', [DriverBankController::class, 'getBankDetails']);
        Route::post('/bank/save', [DriverBankController::class, 'saveBankDetails']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/payments', [AdminController::class, 'payments']);
        Route::get('/wallets', [AdminController::class, 'wallets']);
        Route::get('/reports', [AdminController::class, 'reports']);
        Route::get('/activity-logs', [AdminController::class, 'activityLogs']);
        Route::get('/withdrawals', [AdminController::class, 'withdrawals']);
        Route::post('/withdrawals/{id}/approve', [AdminController::class, 'approveWithdrawal']);
        Route::post('/withdrawals/{id}/reject', [AdminController::class, 'rejectWithdrawal']);
        Route::post('/settings', [AdminController::class, 'saveSettings']);
        Route::get('/settings', [AdminController::class, 'getSettings']);
        Route::get('/users/{id}', [AdminController::class, 'getUser']);
        Route::get('/drivers', [AdminController::class, 'drivers']);
        Route::post('/drivers/{id}/approve', [AdminController::class, 'approveDriver']);
        Route::post('/drivers/{id}/reject', [AdminController::class, 'rejectDriver']);

        // Admin KYC management
        Route::get('/kyc/pending', [KYCController::class, 'getPendingKyc']);
        Route::post('/kyc/{id}/approve', [KYCController::class, 'approveKyc']);
        Route::post('/kyc/{id}/reject', [KYCController::class, 'rejectKyc']);
    });

    /*
    |--------------------------------------------------------------------------
    | Notifications (all authenticated users)
    |--------------------------------------------------------------------------
    */
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/clear', [NotificationController::class, 'clear']);
    Route::post('/notifications/clear-all', [NotificationController::class, 'clearAll']);

    /*
    |--------------------------------------------------------------------------
    | Payment Routes
    |--------------------------------------------------------------------------
    */
    Route::post('/payment/initiate', [PaymentController::class, 'initiate']);
    Route::get('/payment/callback', [PaymentController::class, 'callback']);
    Route::get('/payment/verify', [PaymentController::class, 'verify']);

    /*
    |--------------------------------------------------------------------------
    | Location Services
    |--------------------------------------------------------------------------
    */
    Route::get('/location/suggestions', [LocationController::class, 'getSuggestions']);
    Route::post('/location/details', [LocationController::class, 'getPlaceDetails']);
});

/*
|--------------------------------------------------------------------------
| Payment Webhook (no auth required)
|--------------------------------------------------------------------------
*/
Route::post('/payment/webhook/korapay', [PaymentController::class, 'webhook']);
