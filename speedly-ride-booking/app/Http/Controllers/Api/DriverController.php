<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DriverProfile;
use App\Models\DriverVehicle;
use App\Models\Ride;
use App\Models\ClientProfile;
use App\Models\WalletTransaction;
use App\Models\Notification;
use App\Models\DriverRating;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class DriverController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $driverProfile = $user->driverProfile;

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found'
            ]);
        }

        $totalRides = Ride::where('driver_id', $driverProfile->id)
            ->whereIn('status', ['accepted', 'completed', 'in_progress'])
            ->count();

        $completedRides = Ride::where('driver_id', $driverProfile->id)
            ->where('status', 'completed')
            ->count();

        $totalEarnings = WalletTransaction::where('user_id', $user->id)
            ->where('type', 'credit')
            ->where('category', 'ride_earning')
            ->sum('amount');

        $averageRating = DriverRating::where('driver_id', $driverProfile->id)
            ->avg('rating');

        return response()->json([
            'success' => true,
            'message' => 'Driver stats retrieved successfully',
            'data' => [
                'total_rides' => $totalRides,
                'completed_rides' => $completedRides,
                'total_earnings' => $totalEarnings,
                'average_rating' => $averageRating ? round($averageRating, 2) : 0,
                'driver_status' => $driverProfile->driver_status,
                'verification_status' => $driverProfile->verification_status
            ]
        ]);
    }

    public function rides(Request $request)
    {
        $user = $request->user();
        $driverProfile = $user->driverProfile;

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found'
            ]);
        }

        $limit = $request->query('limit', 5);

        $rides = Ride::where(function ($query) use ($driverProfile) {
            $query->where('driver_id', $driverProfile->id)
                ->whereIn('status', ['accepted', 'completed', 'in_progress']);
        })->orWhere(function ($query) use ($driverProfile) {
            $query->where('status', 'pending')
                ->where('driver_id', $driverProfile->id);
        })->with('client.user')
            ->orderBy('created_at', 'DESC')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Recent rides retrieved successfully',
            'data' => $rides
        ]);
    }

    public function rideHistory(Request $request)
    {
        $user = $request->user();
        $driverProfile = $user->driverProfile;

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found'
            ]);
        }

        $query = Ride::where('driver_id', $driverProfile->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $rides = $query->with('client.user')
            ->orderBy('created_at', 'DESC')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Ride history retrieved successfully',
            'data' => $rides
        ]);
    }

    public function pendingRides(Request $request)
    {
        $user = $request->user();
        $driverProfile = $user->driverProfile;

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found'
            ]);
        }

        $pendingRides = Ride::where('status', 'pending')
            ->where(function ($query) use ($driverProfile) {
                $query->whereNull('driver_id')
                    ->orWhere('driver_id', $driverProfile->id);
            })
            ->with('client.user')
            ->orderBy('created_at', 'ASC')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Pending rides retrieved successfully',
            'data' => $pendingRides
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        $driverProfile = $user->driverProfile;

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found'
            ]);
        }

        $vehicle = $driverProfile->vehicle;

        $profileData = [
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'profile_picture_url' => $user->profile_picture_url,
            'is_verified' => $user->is_verified,
            'driver_status' => $driverProfile->driver_status,
            'verification_status' => $driverProfile->verification_status,
            'license_number' => $driverProfile->license_number,
            'license_expiry' => $driverProfile->license_expiry,
            'vehicle' => $vehicle ? [
                'id' => $vehicle->id,
                'make' => $vehicle->make,
                'model' => $vehicle->model,
                'year' => $vehicle->year,
                'color' => $vehicle->color,
                'plate_number' => $vehicle->plate_number,
                'vehicle_type' => $vehicle->vehicle_type,
            ] : null
        ];

        return response()->json([
            'success' => true,
            'message' => 'Driver profile retrieved successfully',
            'data' => $profileData
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $driverProfile = $user->driverProfile;

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found'
            ]);
        }

        $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|string|max:20',
            'license_number' => 'sometimes|string|max:50',
            'license_expiry' => 'sometimes|date',
        ]);

        if ($request->has('full_name')) {
            $user->full_name = $request->full_name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('phone_number')) {
            $user->phone_number = $request->phone_number;
        }
        $user->save();

        if ($request->has('license_number')) {
            $driverProfile->license_number = $request->license_number;
        }
        if ($request->has('license_expiry')) {
            $driverProfile->license_expiry = $request->license_expiry;
        }
        $driverProfile->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
    }

    public function toggleStatus(Request $request)
    {
        $user = $request->user();
        $driverProfile = $user->driverProfile;

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found'
            ]);
        }

        $request->validate([
            'status' => 'required|in:online,offline'
        ]);

        $newStatus = $request->status;
        $previousStatus = $driverProfile->driver_status;

        if ($newStatus === 'online' && $driverProfile->verification_status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Driver must be verified before going online'
            ]);
        }

        $driverProfile->driver_status = $newStatus;
        $driverProfile->save();

        if ($newStatus === 'online' && $previousStatus !== 'online') {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'driver_status',
                'title' => 'Status Updated',
                'message' => 'You are now online and can receive ride requests',
                'data' => json_encode(['status' => $newStatus])
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => [
                'status' => $newStatus,
                'previous_status' => $previousStatus
            ]
        ]);
    }

    public function updateLocation(Request $request)
    {
        $user = $request->user();
        $driverProfile = $user->driverProfile;

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found'
            ]);
        }

        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180'
        ]);

        $driverProfile->latitude = $request->lat;
        $driverProfile->longitude = $request->lng;
        $driverProfile->last_location_update = now();
        $driverProfile->save();

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully'
        ]);
    }

    public function getNearbyDrivers(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius_km' => 'sometimes|numeric|min:0.1|max:100'
        ]);

        $lat = $request->lat;
        $lng = $request->lng;
        $radiusKm = $request->radius_km ?? 10;

        $drivers = DriverProfile::where('driver_status', 'online')
            ->where('verification_status', 'approved')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->selectRaw("
                *,
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
            ", [$lat, $lng, $lat])
            ->having('distance', '<=', $radiusKm)
            ->orderBy('distance')
            ->with('user')
            ->with('vehicle')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Nearby drivers retrieved successfully',
            'data' => $drivers
        ]);
    }

    public function support(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:50',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'sometimes|in:low,medium,high'
        ]);

        $ticketNumber = 'TKT-' . Str::random(8);
        $user = $request->user();

        $adminUsers = User::where('role', 'admin')->orWhere('is_admin', true)->get();

        foreach ($adminUsers as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'support_ticket',
                'title' => 'New Support Ticket: ' . $request->subject,
                'message' => 'Ticket ' . $ticketNumber . ' submitted by ' . $user->full_name,
                'data' => json_encode([
                    'ticket_number' => $ticketNumber,
                    'category' => $request->category,
                    'subject' => $request->subject,
                    'message' => $request->message,
                    'priority' => $request->priority ?? 'medium',
                    'user_id' => $user->id
                ])
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Support ticket submitted successfully',
            'data' => [
                'ticket_number' => $ticketNumber
            ]
        ]);
    }
}
