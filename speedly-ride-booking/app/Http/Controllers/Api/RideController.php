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
        $totalFare = $rideType['base_fare'] + ($distance * $rideType['per_km']);
        $platformCommission = $totalFare * 0.15;
        $driverPayout = $totalFare - $platformCommission;

        $ride = Ride::create([
            'id' => Str::uuid(),
            'ride_number' => 'RIDE-' . strtoupper(Str::random(8)),
            'client_id' => $clientProfile->id,
            'pickup_address' => $request->pickup_location,
            'destination_address' => $request->dropoff_location,
            'pickup_latitude' => $pickupLat,
            'pickup_longitude' => $pickupLng,
            'destination_latitude' => $dropoffLat,
            'destination_longitude' => $dropoffLng,
            'ride_type' => $request->ride_type,
            'total_fare' => round($totalFare, 2),
            'platform_commission' => round($platformCommission, 2),
            'driver_payout' => round($driverPayout, 2),
            'distance_km' => round($distance, 2),
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'new_ride',
                'title' => 'New Ride Booking',
                'message' => "A new ride has been booked by {$user->full_name}.",
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Ride booked successfully', 'data' => $ride]);
    }

    public function show(Request $request, $id)
    {
        $ride = Ride::with(['client.user', 'driver.user', 'driver.vehicles', 'cancellation'])->find($id);

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $ride]);
    }

    public function receipt(Request $request, $id)
    {
        $ride = Ride::with(['client.user', 'driver.user', 'driver.vehicles'])->find($id);

        if (!$ride) {
            return response()->json(['success' => false, 'message' => 'Ride not found'], 404);
        }

        if ($ride->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Receipt only available for completed rides'], 400);
        }

        $fareBreakdown = [
            'base_fare' => $ride->total_fare * 0.6,
            'distance_fare' => $ride->total_fare * 0.4,
            'service_fee' => $ride->total_fare * 0.05,
            'platform_commission' => $ride->platform_commission ?? $ride->total_fare * 0.2,
            'driver_payout' => $ride->driver_payout ?? $ride->total_fare - $ride->platform_commission,
            'total' => $ride->total_fare,
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

        if ($driverProfile->driver_status !== 'online' || $driverProfile->verification_status !== 'approved') {
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
                'driver_id' => $driverProfile->id,
                'status' => 'accepted',
            ]);

            Notification::create([
                'user_id' => $ride->client->user_id,
                'type' => 'ride_accepted',
                'title' => 'Ride Accepted',
                'message' => 'Your ride has been accepted by a driver. They are on the way to pick you up.',
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

            if ($ride->driver_id !== $driverProfile->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            if (!in_array($ride->status, ['accepted', 'in_progress'])) {
                return response()->json(['success' => false, 'message' => 'Ride cannot be completed'], 400);
            }

            $ride->update([
                'status' => 'completed',
                'completed_at' => Carbon::now(),
                'payment_status' => 'paid',
            ]);

            $clientUser = $ride->client->user;
            $driverUser = $user;

            $lastClientTx = WalletTransaction::where('user_id', $clientUser->id)
                ->orderBy('created_at', 'desc')->first();
            $clientBalanceBefore = $lastClientTx ? $lastClientTx->balance_after : 0;
            $clientBalanceAfter = $clientBalanceBefore - $ride->total_fare;

            WalletTransaction::create([
                'id' => Str::uuid(),
                'user_id' => $clientUser->id,
                'transaction_type' => 'debit',
                'description' => "Payment for ride {$ride->ride_number}",
                'amount' => $ride->total_fare,
                'balance_before' => $clientBalanceBefore,
                'balance_after' => $clientBalanceAfter,
                'status' => 'completed',
                'ride_id' => $ride->id,
            ]);

            $driverEarning = $ride->total_fare * 0.85;

            $lastDriverTx = WalletTransaction::where('user_id', $driverUser->id)
                ->orderBy('created_at', 'desc')->first();
            $driverBalanceBefore = $lastDriverTx ? $lastDriverTx->balance_after : 0;
            $driverBalanceAfter = $driverBalanceBefore + $driverEarning;

            WalletTransaction::create([
                'id' => Str::uuid(),
                'user_id' => $driverUser->id,
                'transaction_type' => 'credit',
                'description' => "Earning from ride {$ride->ride_number}",
                'amount' => $driverEarning,
                'balance_before' => $driverBalanceBefore,
                'balance_after' => $driverBalanceAfter,
                'status' => 'completed',
                'ride_id' => $ride->id,
            ]);

            Notification::create([
                'user_id' => $ride->client->user_id,
                'type' => 'ride_completed',
                'title' => 'Ride Completed',
                'message' => 'Your ride has been completed. Thank you for riding with us!',
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

        $isClient = $clientProfile && $ride->client_id === $clientProfile->id;
        $isDriver = $driverProfile && $ride->driver_id === $driverProfile->id;

        if (!$isClient && !$isDriver) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if (in_array($ride->status, ['completed', 'cancelled'])) {
            return response()->json(['success' => false, 'message' => 'Ride cannot be cancelled'], 400);
        }

        return DB::transaction(function () use ($ride, $request, $user, $isClient, $isDriver) {
            $ride->update([
                'status' => 'cancelled',
            ]);

            RideCancellation::create([
                'id' => Str::uuid(),
                'ride_id' => $ride->id,
                'cancelled_by' => $isClient ? 'client' : 'driver',
                'reason' => $request->reason,
                'cancelled_at' => Carbon::now(),
            ]);

            if ($isClient && $ride->driver_id) {
                Notification::create([
                    'user_id' => $ride->driver->user_id,
                    'type' => 'ride_cancelled',
                    'title' => 'Ride Cancelled',
                    'message' => 'The client has cancelled the ride.',
                ]);
            } elseif ($isDriver) {
                Notification::create([
                    'user_id' => $ride->client->user_id,
                    'type' => 'ride_cancelled',
                    'title' => 'Ride Cancelled',
                    'message' => 'The driver has cancelled the ride.',
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

        if ($ride->client_id !== $clientProfile->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($ride->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Can only rate after ride completion'], 400);
        }

        DriverRating::create([
            'id' => Str::uuid(),
            'ride_id' => $ride->id,
            'user_id' => $user->id,
            'driver_id' => $ride->driver_id,
            'rating' => $request->rating,
            'review' => $request->comment,
        ]);

        $driverProfile = $ride->driver;
        $avgRating = DriverRating::where('driver_id', $driverProfile->id)->avg('rating');
        $driverProfile->update(['average_rating' => round($avgRating, 2)]);

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

        if ($ride->driver_id !== $driverProfile->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($ride->status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Can only rate after ride completion'], 400);
        }

        ClientRating::create([
            'id' => Str::uuid(),
            'ride_id' => $ride->id,
            'user_id' => $user->id,
            'client_id' => $ride->client_id,
            'rating' => $request->rating,
            'review' => $request->comment,
        ]);

        return response()->json(['success' => true, 'message' => 'Client rated successfully']);
    }
}
