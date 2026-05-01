<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\DriverProfile;
use App\Models\Ride;
use App\Models\ClientProfile;
use Illuminate\Support\Facades\Http;

class LocationController extends Controller
{
    public function getClientLocations(Request $request)
    {
        $userId = $request->user()->id;

        $rides = Ride::where('client_id', $userId)
            ->orderBy('created_at', 'DESC')
            ->get(['pickup_address', 'pickup_latitude', 'pickup_longitude', 'dropoff_address', 'dropoff_latitude', 'dropoff_longitude']);

        $locations = [];
        $seen = [];

        foreach ($rides as $ride) {
            if (!in_array($ride->pickup_address, $seen)) {
                $locations[] = [
                    'address' => $ride->pickup_address,
                    'lat' => $ride->pickup_latitude,
                    'lng' => $ride->pickup_longitude,
                    'type' => 'pickup',
                    'last_used' => $ride->created_at
                ];
                $seen[] = $ride->pickup_address;
            }

            if (!in_array($ride->dropoff_address, $seen)) {
                $locations[] = [
                    'address' => $ride->dropoff_address,
                    'lat' => $ride->dropoff_latitude,
                    'lng' => $ride->dropoff_longitude,
                    'type' => 'dropoff',
                    'last_used' => $ride->created_at
                ];
                $seen[] = $ride->dropoff_address;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Saved locations retrieved successfully',
            'data' => ['saved_locations' => $locations]
        ]);
    }

    public function getDriverLocations(Request $request)
    {
        $driverProfile = DriverProfile::where('user_id', $request->user()->id)->first();

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
                'data' => null
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Driver location retrieved successfully',
            'data' => [
                'latitude' => $driverProfile->current_latitude,
                'longitude' => $driverProfile->current_longitude,
                'last_location_update' => $driverProfile->last_location_update,
                'status' => $driverProfile->status
            ]
        ]);
    }

    public function getSuggestions(Request $request)
    {
        $request->validate(['query' => 'required|string']);

        $query = $request->query;
        $apiKey = config('services.google.maps_api_key') ?: env('GOOGLE_MAPS_API_KEY');

        if ($apiKey) {
            $response = Http::get('https://maps.googleapis.com/maps/api/place/autocomplete/json', [
                'input' => $query,
                'key' => $apiKey
            ]);

            if ($response->successful() && $response->json('status') === 'OK') {
                $suggestions = collect($response->json('predictions'))->map(function ($prediction) {
                    return [
                        'description' => $prediction['description'],
                        'place_id' => $prediction['place_id'],
                        'lat' => null,
                        'lng' => null
                    ];
                })->toArray();

                return response()->json([
                    'success' => true,
                    'message' => 'Suggestions retrieved successfully',
                    'data' => ['suggestions' => $suggestions]
                ]);
            }
        }

        $response = Http::get('https://nominatim.openstreetmap.org/search', [
            'q' => $query,
            'format' => 'json',
            'limit' => 5
        ]);

        $suggestions = collect($response->json())->map(function ($place) {
            return [
                'description' => $place['display_name'],
                'place_id' => $place['place_id'],
                'lat' => $place['lat'],
                'lng' => $place['lon']
            ];
        })->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Suggestions retrieved successfully',
            'data' => ['suggestions' => $suggestions]
        ]);
    }

    public function getPlaceDetails(Request $request)
    {
        $request->validate([
            'place_id' => 'sometimes|string',
            'query' => 'sometimes|string'
        ]);

        if ($request->has('place_id')) {
            $apiKey = config('services.google.maps_api_key') ?: env('GOOGLE_MAPS_API_KEY');

            if ($apiKey) {
                $response = Http::get('https://maps.googleapis.com/maps/api/place/details/json', [
                    'place_id' => $request->place_id,
                    'key' => $apiKey
                ]);

                if ($response->successful() && $response->json('status') === 'OK') {
                    $result = $response->json('result');
                    return response()->json([
                        'success' => true,
                        'message' => 'Place details retrieved successfully',
                        'data' => [
                            'name' => $result['name'],
                            'address' => $result['formatted_address'],
                            'lat' => $result['geometry']['location']['lat'],
                            'lng' => $result['geometry']['location']['lng']
                        ]
                    ]);
                }
            }
        }

        if ($request->has('query')) {
            $response = Http::get('https://nominatim.openstreetmap.org/search', [
                'q' => $request->query,
                'format' => 'json',
                'limit' => 1
            ]);

            $places = $response->json();
            if (!empty($places)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Place details retrieved successfully',
                    'data' => [
                        'name' => $places[0]['name'] ?? $places[0]['display_name'],
                        'address' => $places[0]['display_name'],
                        'lat' => $places[0]['lat'],
                        'lng' => $places[0]['lon']
                    ]
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Place not found',
            'data' => null
        ]);
    }
}
