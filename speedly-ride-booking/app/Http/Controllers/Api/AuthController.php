<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClientProfile;
use App\Models\DriverProfile;
use App\Models\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\OtpMail;
use App\Mail\PasswordResetMail;
use Laravel\Sanctum\NewAccessToken;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:client,driver',
            'phone' => 'required|string|max:20',
        ]);

        $phone = $data['phone'];
        if (preg_match('/^0[7-9][0-1]\d{8}$/', $phone)) {
            $phone = '+234' . substr($phone, 1);
        }

        $otp = '';
        $user = DB::transaction(function () use ($data, $phone, &$otp) {
            $user = User::create([
                'full_name' => $data['full_name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'role' => $data['role'],
                'phone_number' => $phone,
                'is_active' => true,
                'is_verified' => false,
            ]);

            if ($data['role'] === 'client') {
                ClientProfile::create([
                    'user_id' => $user->id,
                ]);
            } elseif ($data['role'] === 'driver') {
                DriverProfile::create([
                    'user_id' => $user->id,
                    'driver_status' => 'offline',
                    'verification_status' => 'pending',
                    'license_number' => '',
                    'license_expiry' => null,
                    'is_available' => false,
                    'completed_rides' => 0,
                    'average_rating' => 0,
                    'total_reviews' => 0,
                    'total_earnings' => 0,
                ]);
            }

            $otp = sprintf("%06d", mt_rand(1, 999999));
            PasswordReset::create([
                'user_id' => $user->id,
                'token' => $otp,
                'expires_at' => Carbon::now()->addMinutes(10),
            ]);

            return $user;
        });

        // Send OTP outside DB transaction so failure doesn't roll back user creation
        try {
            Mail::to($user->email)->send(new OtpMail($otp, $user->full_name ?? $user->name));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OTP email failed to ' . $user->email . ': ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Account created but we failed to send the verification email. Please use the Resend OTP option, or contact support.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please verify OTP.',
            'data' => [
                'redirect' => 'verify-otp',
                'email' => $user->email,
                'otp' => app()->isLocal() ? $otp : null, // Only expose OTP in local/dev
            ]
        ]);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['login'])
            ->orWhere('username', $data['login'])
            ->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'data' => null
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is deactivated',
                'data' => null
            ], 403);
        }

        $user->update(['last_login' => Carbon::now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        Auth::guard('web')->login($user);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone_number' => $user->phone_number,
                ]
            ]
        ]);
    }

    public function adminLogin(Request $request)
    {
        $data = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['login'])
            ->orWhere('username', $data['login'])
            ->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'data' => null
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is deactivated',
                'data' => null
            ], 403);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Admin only.',
                'data' => null
            ], 403);
        }

        $user->update(['last_login' => Carbon::now()]);

        Auth::guard('web')->login($user);

        $token = $user->createToken('admin_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Admin login successful',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone_number' => $user->phone_number,
                ]
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
            'data' => null
        ]);
    }

    public function adminLogout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Admin logged out successfully',
            'data' => null
        ]);
    }

    public function resendOtp(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $data['email'])->first();

        PasswordReset::where('user_id', $user->id)->whereNull('used_at')->update(['used_at' => Carbon::now()]);

        $otp = sprintf("%06d", mt_rand(1, 999999));
        PasswordReset::create([
            'user_id' => $user->id,
            'token' => $otp,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new OtpMail($otp, $user->full_name ?? $user->name));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OTP resend failed to ' . $user->email . ': ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend OTP. Please try again later or contact support.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP resent successfully',
            'data' => null
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $data['email'])->first();

        // OTP brute-force protection: track failed attempts via cache
        $cacheKey = 'otp_attempts:' . $user->id;
        $failedAttempts = (int) cache()->get($cacheKey, 0);

        if ($failedAttempts >= 10) {
            return response()->json([
                'success' => false,
                'message' => 'Too many failed OTP attempts. Please request a new code in 15 minutes.',
                'data' => null,
            ], 429);
        }

        $reset = PasswordReset::where('user_id', $user->id)
            ->where('token', $data['otp'])
            ->whereNull('used_at')
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$reset) {
            cache()->put($cacheKey, $failedAttempts + 1, now()->addMinutes(15));
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
                'data' => null
            ], 400);
        }

        // Clear failed attempts on success
        cache()->forget($cacheKey);

        $user->update(['is_verified' => true]);
        $reset->update(['used_at' => Carbon::now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        Auth::guard('web')->login($user);

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone_number' => $user->phone_number,
                ]
            ]
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $data['email'])->first();

        PasswordReset::where('user_id', $user->id)->whereNull('used_at')->update(['used_at' => Carbon::now()]);

        $token = Str::random(60);
        PasswordReset::create([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => Carbon::now()->addMinutes(60),
        ]);

        $resetUrl = config('app.url') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        try {
            Mail::to($user->email)->send(new PasswordResetMail($token, $user->full_name ?? $user->name, $resetUrl));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Password reset email failed to ' . $user->email . ': ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send password reset email. Please try again later.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email',
            'data' => ['token' => $token]
        ]);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
        ]);

        $user = User::where('email', $data['email'])->first();

        $reset = PasswordReset::where('user_id', $user->id)
            ->where('token', $data['token'])
            ->whereNull('used_at')
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$reset) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired token',
                'data' => null
            ], 400);
        }

        $user->update(['password' => bcrypt($data['password'])]);
        $reset->update(['used_at' => Carbon::now()]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully',
            'data' => null
        ]);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
        ]);

        $user = $request->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
                'data' => null
            ], 400);
        }

        $user->update(['password' => bcrypt($data['new_password'])]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
            'data' => null
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $profile = null;

        if ($user->role === 'client') {
            $profile = $user->clientProfile;
        } elseif ($user->role === 'driver') {
            $profile = $user->driverProfile;
        }

        return response()->json([
            'success' => true,
            'message' => 'User data retrieved',
            'data' => [
                'user' => $user,
                'profile' => $profile
            ]
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();

        if ($user->clientProfile) {
            $user->clientProfile->delete();
        }
        if ($user->driverProfile) {
            $user->driverProfile->delete();
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully',
        ]);
    }
}
