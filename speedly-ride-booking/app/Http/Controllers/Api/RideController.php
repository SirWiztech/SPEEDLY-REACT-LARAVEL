<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ClientProfile;
use App\Models\DriverProfile;
use App\Models\DriverVehicle;
use App\Models\Ride;
use App\Models\RideCancellation;
use App\Models\WalletTransaction;
use App\Models\Notification;
use App\Models\DriverRating;
use App\Models\ClientRating;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RideController extends Controller
{
    public function getRideTypes(Request $request)
    {
        return response()->json(['success' => true, 'data' => [
            ['id' => 'economy', 'name' => 'Economy', 'base_fare' => 500, 'per_km' => 150, 'icon' => '🚗'],
            ['id' => 'comfort', 'name' => 'Comfort', 'base_fare' => 800, 'per_km' => 250, 'icon' => '🚙'],
            ['id' => 'premium', 'name' => 'Premium', 'base_fare' => 1500, 'per_km' => 400, 'icon' => '🚘'],
        ]]);
    }

    public function calculateFare(Request $request)
    {
        $request->validate([
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'dropoff_lat' => 'required|numeric',
            'dropoff_lng' => 'required|numeric',
            'ride_type' => 'required|in:economy,comfort,premium',
        ]);

        $pickupLat = $request->pickup_lat;
        $pickupLng = $request->pickup_lng;
        $dropoffLat = $request->dropoff_lat;
        $dropoffLng = $request->dropoff_lng;

        $distance = DB::selectOne("
            SELECT (6371 * acos(
                cos(radians(?)) * cos(radians(?)) * cos(radians(?) - radians(?)) +
                sin(radians(?)) * sin(radians(?))
            )) as distance
        ", [$pickupLat, $dropoffLat, $dropoffLng, $pickupLng, $pickupLat, $dropoffLat])->distance;

        $rideTypes = [
            'economy' => ['base_fare' => 500, 'per_km' => 150],
            'comfort' => ['base_fare' => 800, 'per_km' => 250],
            'premium' => ['base_fare' => 1500, 'per_km' => 400],
        ];

        $rideType = $rideTypes[$request->ride_type];
        $estimatedFare = $rideType['base_fare'] + ($distance * $rideType['per_km']);
        $durationMin = $distance * 3;

        return response()->json([
            'success' => true,
            'data' => [
                'distance_km' => round($distance, 2),
                'estimated_fare' => round($estimatedFare, 2),
                'ride_type' => $request->ride_type,
                'duration_min' => round($durationMin, 0),
            ],
        ]);
    }

    public function book(Request $request)
    {
        $request->validate([
            'pickup_location' => 'required|string',
            'dropoff_location' => 'required|string',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'dropoff_lat' => 'required|numeric',
            'dropoff_lng' => 'required|numeric',
            'ride_type' => 'required|in:economy,comfort,premium',
            'scheduled_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $clientProfile = ClientProfile::where('user_id', $user->id)->first();

        if (!$clientProfile) {
            return response()->json(['success' => false, 'message' => 'Client profile not found'], 404);
        }

        $pickupLat = $request->pickup_lat;
        $pickupLng = $request->pickup_lng;
        $dropoffLat = $request->dropoff_lat;
        $dropoffLng = $request->dropoff_lng;

        $distance = DB::selectOne("
            SELECT (6371 * acos(
                cos(radians(?)) * cos(radians(?)) * cos(radians(?) - radians(?)) +
                sin(radians(?)) * sin(radians(?))
            )) as distance
        ", [$pickupLat, $dropoffLat, $dropoffLng, $pickupLng, $pickupLat, $dropoffLat])->distance;

        $rideTypes = [
            'economy' => ['base_fare' => 500, 'per_km' => 150],
            'comfort' => ['base_fare' => 800, 'per_km' => 250],
            'premium' => ['base_fare' => 1500, 'per_km' => 400],
        ];

        $rideType = $rideTypes[$request->ride_type];
        $fareAmount = $rideType['base_fare'] + ($distance * $rideType['per_km']);

        $ride = Ride::create([
            'id' => Str::uuid(),
            'client_profile_id' => $clientProfile->id,
            'pickup_location' => $request->pickup_location,
            'dropoff_location' => $request->dropoff_location,
            'pickup_lat' => $pickupLat,
            'pickup_lng' => $pickupLng,
            'dropoff_lat' => $dropoffLat,
            'dropoff_lng' => $dropoffLng,
            'ride_type' => $request->ride_type,
            'fare_amount' => round($fareAmount, 2),
            'distance_km' => round($distance, 2),
            'status' => 'pending',
            'scheduled_at' => $request->scheduled_at,
            'notes' => $request->notes,
        ]);

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'new_ride',
                'title' => 'New Ride Booking',
                'message' => "A new ride has been booked by {$user->full_name}.",
                'data' => json_encode(['ride_id' => $ride->id]),
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Ride booked successfully', 'data' => $ride]);
    }

    public function show(Request $request, $id)
    {
        $ride = Ride::with(['clientProfile.user', 'driverProfile.user', 'driverProfile.vehicles', 'cancellation'])->find($id);

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $ride]);
    }

    public function receipt(Request $request, $id)
    {
        $ride = Ride::with(['clientProfile.user', 'driverProfile.user', 'driverProfile.vehicles'])->find($id);

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        if ($ride->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Receipt only available for completed rides'], 400);
        }

        $fareBreakdown = [
            'base_fare' => $ride->fare_amount * 0.6,
            'distance_fare' => $ride->fare_amount * 0.4,
            'total' => $ride->fare_amount,
        ];

        return response()->json(['success' => true, 'data' => ['ride' => $ride, 'fare_breakdown' => $fareBreakdown]]);
    }

    public function accept(Request $request, $id)
    {
        $user = $request->user();

        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        if (!$driverProfile) {
            return response()->json(['success' => false, 'message' => 'Driver profile not found'], 404);
        }

        if (!$driverProfile->is_online || !$driverProfile->is_verified) {
            return response()->json(['success' => false, 'message' => 'Driver must be online and verified'], 403);
        }

        return DB::transaction(function () use ($id, $user, $driverProfile) {
            $ride = Ride::lockForUpdate()->find($id);

            if (!$ride) {
                return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
            }

            if ($ride->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'Ride is not available for acceptance'], 400);
            }

            $ride->update([
                'driver_profile_id' => $driverProfile->id,
                'status' => 'accepted',
                'accepted_at' => Carbon::now(),
            ]);

            Notification::create([
                'user_id' => $ride->clientProfile->user_id,
                'type' => 'ride_accepted',
                'title' => 'Ride Accepted',
                'message' => 'Your ride has been accepted by a driver. They are on the way to pick you up.',
                'data' => json_encode(['ride_id' => $ride->id]),
            ]);

            return response()->json(['success' => true, 'message' => 'Ride accepted successfully']);
        });
    }

    public function decline(Request $request, $id)
    {
        $user = $request->user();
        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        if (!$driverProfile) {
            return response()->json(['success' => false, 'message' => 'Driver profile not found'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Ride declined']);
    }

    public function complete(Request $request, $id)
    {
        $user = $request->user();

        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        if (!$driverProfile) {
            return response()->json(['success' => false, 'message' => 'Driver profile not found'], 404);
        }

        return DB::transaction(function () use ($id, $user, $driverProfile) {
            $ride = Ride::lockForUpdate()->find($id);

            if (!$ride) {
                return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
            }

            if ($ride->driver_profile_id !== $driverProfile->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            if (!in_array($ride->status, ['accepted', 'in_progress'])) {
                return response()->json(['success' => false, 'message' => 'Ride cannot be completed'], 400);
            }

            $ride->update([
                'status' => 'completed',
                'completed_at' => Carbon::now(),
            ]);

            $clientProfile = $ride->clientProfile;
            $clientUser = $clientProfile->user;

            WalletTransaction::create([
                'id' => Str::uuid(),
                'user_id' => $clientUser->id,
                'type' => 'debit',
                'category' => 'ride_payment',
                'description' => "Payment for ride {$ride->id}",
                'amount' => $ride->fare_amount,
                'balance_after' => $clientUser->wallet_balance - $ride->fare_amount,
            ]);

            $clientUser->decrement('wallet_balance', $ride->fare_amount);

            $driverUser = $user;
            $driverEarning = $ride->fare_amount * 0.85;

            WalletTransaction::create([
                'id' => Str::uuid(),
                'user_id' => $driverUser->id,
                'type' => 'credit',
                'category' => 'ride_earning',
                'description' => "Earning from ride {$ride->id}",
                'amount' => $driverEarning,
                'balance_after' => $driverUser->wallet_balance + $driverEarning,
            ]);

            $driverUser->increment('wallet_balance', $driverEarning);

            $platformCommission = $ride->fare_amount * 0.15;

            Notification::create([
                'user_id' => $clientProfile->user_id,
                'type' => 'ride_completed',
                'title' => 'Ride Completed',
                'message' => 'Your ride has been completed. Thank you for riding with us!',
                'data' => json_encode(['ride_id' => $ride->id]),
            ]);

            return response()->json(['success' => true, 'message' => 'Ride completed successfully']);
        });
    }

    public function cancel(Request $request, $id)
    {
        $request->validate([
            'reason' => 'nullable|string',
        ]);

        $user = $request->user();

        $ride = Ride::find($id);

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        $clientProfile = ClientProfile::where('user_id', $user->id)->first();
        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        $isClient = $clientProfile && $ride->client_profile_id === $clientProfile->id;
        $isDriver = $driverProfile && $ride->driver_profile_id === $driverProfile->id;

        if (!$isClient && !$isDriver) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if (in_array($ride->status, ['completed', 'cancelled'])) {
            return response()->json(['success' => false, 'message' => 'Ride cannot be cancelled'], 400);
        }

        return DB::transaction(function () use ($ride, $request, $user, $isClient, $isDriver) {
            $ride->update([
                'status' => 'cancelled',
                'cancelled_at' => Carbon::now(),
            ]);

            RideCancellation::create([
                'id' => Str::uuid(),
                'ride_id' => $ride->id,
                'cancelled_by' => $isClient ? 'client' : 'driver',
                'reason' => $request->reason,
            ]);

            if ($isClient && $ride->driver_profile_id) {
                Notification::create([
                    'user_id' => $ride->driverProfile->user_id,
                    'type' => 'ride_cancelled',
                    'title' => 'Ride Cancelled',
                    'message' => 'The client has cancelled the ride.',
                    'data' => json_encode(['ride_id' => $ride->id]),
                ]);
            } elseif ($isDriver) {
                Notification::create([
                    'user_id' => $ride->clientProfile->user_id,
                    'type' => 'ride_cancelled',
                    'title' => 'Ride Cancelled',
                    'message' => 'The driver has cancelled the ride.',
                    'data' => json_encode(['ride_id' => $ride->id]),
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Ride cancelled successfully']);
        });
    }

    public function rateDriver(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $user = $request->user();
        $clientProfile = ClientProfile::where('user_id', $user->id)->first();

        if (!$clientProfile) {
            return response()->json(['success' => false, 'message' => 'Client profile not found'], 404);
        }

        $ride = Ride::find($id);

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        if ($ride->client_profile_id !== $clientProfile->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($ride->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Can only rate after ride completion'], 400);
        }

        DriverRating::create([
            'id' => Str::uuid(),
            'ride_id' => $ride->id,
            'driver_profile_id' => $ride->driver_profile_id,
            'client_profile_id' => $clientProfile->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        $driverProfile = $ride->driverProfile;
        $avgRating = DriverRating::where('driver_profile_id', $driverProfile->id)->avg('rating');
        $driverProfile->update(['rating' => round($avgRating, 2)]);

        return response()->json(['success' => true, 'message' => 'Driver rated successfully']);
    }

    public function rateClient(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $user = $request->user();
        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        if (!$driverProfile) {
            return response()->json(['success' => false, 'message' => 'Driver profile not found'], 404);
        }

        $ride = Ride::find($id);

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        if ($ride->driver_profile_id !== $driverProfile->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($ride->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Can only rate after ride completion'], 400);
        }

        ClientRating::create([
            'id' => Str::uuid(),
            'ride_id' => $ride->id,
            'client_profile_id' => $ride->client_profile_id,
            'driver_profile_id' => $driverProfile->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json(['success' => true, 'message' => 'Client rated successfully']);
    }
}
