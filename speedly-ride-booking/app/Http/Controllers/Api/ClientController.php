<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClientProfile;
use App\Models\Ride;
use App\Models\DriverProfile;
use App\Models\DriverVehicle;
use App\Models\Notification;
use App\Models\WalletTransaction;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ClientController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $clientProfile = ClientProfile::where('user_id', $user->id)->first();

        if (!$clientProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Client profile not found',
                'data' => null
            ]);
        }

        $totalRides = Ride::where('client_id', $clientProfile->id)->count();
        $completedRides = Ride::where('client_id', $clientProfile->id)->where('status', 'completed')->count();
        $cancelledRides = Ride::where('client_id', $clientProfile->id)->where('status', 'cancelled')->count();
        $totalSpent = WalletTransaction::where('user_id', $user->id)->where('type', 'debit')->sum('fare_amount');

        return response()->json([
            'success' => true,
            'message' => 'Dashboard stats retrieved successfully',
            'data' => [
                'total_rides' => $totalRides,
                'completed_rides' => $completedRides,
                'cancelled_rides' => $cancelledRides,
                'total_spent' => (float) $totalSpent,
            ]
        ]);
    }

    public function rides(Request $request)
    {
        $user = $request->user();
        $clientProfile = ClientProfile::where('user_id', $user->id)->first();

        if (!$clientProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Client profile not found',
                'data' => null
            ]);
        }

        $limit = $request->query('limit', 5);

        $rides = Ride::where('client_id', $clientProfile->id)
            ->leftJoin('driver_profiles', 'rides.driver_id', '=', 'driver_profiles.id')
            ->leftJoin('driver_vehicles', 'driver_profiles.id', '=', 'driver_vehicles.driver_id')
            ->select(
                'rides.id',
                'rides.pickup_location',
                'rides.dropoff_location',
                'rides.status',
                'rides.fare_amount',
                'rides.ride_type',
                'rides.created_at',
                'driver_profiles.full_name as driver_name',
                'driver_profiles.phone_number as driver_phone',
                'driver_vehicles.vehicle_type',
                'driver_vehicles.license_plate'
            )
            ->orderBy('rides.created_at', 'DESC')
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
        $clientProfile = ClientProfile::where('user_id', $user->id)->first();

        if (!$clientProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Client profile not found',
                'data' => null
            ]);
        }

        $status = $request->query('status');

        $rides = Ride::where('client_id', $clientProfile->id)
            ->when($status, function ($query) use ($status) {
                return $query->where('status', $status);
            })
            ->leftJoin('driver_profiles', 'rides.driver_id', '=', 'driver_profiles.id')
            ->leftJoin('driver_vehicles', 'driver_profiles.id', '=', 'driver_vehicles.driver_id')
            ->select(
                'rides.id',
                'rides.pickup_location',
                'rides.dropoff_location',
                'rides.status',
                'rides.fare_amount',
                'rides.ride_type',
                'rides.created_at',
                'driver_profiles.full_name as driver_name',
                'driver_profiles.phone_number as driver_phone',
                'driver_vehicles.vehicle_type',
                'driver_vehicles.license_plate'
            )
            ->orderBy('rides.created_at', 'DESC')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Ride history retrieved successfully',
            'data' => $rides
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        $clientProfile = ClientProfile::where('user_id', $user->id)->first();

        $data = [
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'profile_picture_url' => $user->profile_picture_url,
            'is_verified' => $user->is_verified,
            'created_at' => $user->created_at,
        ];

        if ($clientProfile) {
            $data = array_merge($data, $clientProfile->toArray());
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile retrieved successfully',
            'data' => $data
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20',
            'profile_picture_url' => 'nullable|url',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => null
        ]);
    }

    public function support(Request $request)
    {
        $user = $request->user();
        $clientProfile = ClientProfile::where('user_id', $user->id)->first();

        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'required|in:low,medium,high',
        ]);

        $ticketNumber = 'TKT-' . Str::random(8);

        Notification::create([
            'type' => 'support_ticket',
            'data' => json_encode([
                'category' => $validated['category'],
                'subject' => $validated['subject'],
                'message' => $validated['message'],
                'priority' => $validated['priority'],
                'ticket_number' => $ticketNumber,
                'client_id' => $clientProfile?->id,
                'user_id' => $user->id,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Support ticket submitted successfully',
            'data' => ['ticket_number' => $ticketNumber]
        ]);
    }
}
