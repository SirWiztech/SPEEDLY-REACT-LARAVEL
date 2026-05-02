<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\DriverProfile;
use App\Models\DriverKycDocument;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class KYCController extends Controller
{
    public function getClientKyc(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'message' => 'Client KYC retrieved successfully',
            'data' => [
                'verification_status' => $user->is_verified ? 'approved' : 'pending',
                'documents' => [],
            ]
        ]);
    }

    public function uploadClientKyc(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Client KYC document uploaded successfully',
            'data' => null
        ]);
    }

    public function getDriverKyc(Request $request)
    {
        $user = $request->user();
        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
                'data' => null
            ]);
        }

        $documents = DriverKycDocument::where('driver_id', $driverProfile->id)->get();

        return response()->json([
            'success' => true,
            'message' => 'Driver KYC retrieved successfully',
            'data' => [
                'verification_status' => $driverProfile->verification_status,
                'documents' => $documents,
            ]
        ]);
    }

    public function uploadDriverKyc(Request $request)
    {
        $user = $request->user();
        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
                'data' => null
            ], 404);
        }

        $validated = $request->validate([
            'document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'type' => 'required|in:license,insurance,registration,id_card',
        ]);

        $path = $request->file('document')->store('kyc-documents');

        $document = DriverKycDocument::create([
            'id' => Str::uuid()->toString(),
            'driver_id' => $driverProfile->id,
            'document_type' => $validated['type'],
            'document_url' => $path,
            'verification_status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'KYC document uploaded successfully',
            'data' => $document
        ]);
    }

    public function getPendingKyc(Request $request)
    {
        $documents = DriverKycDocument::where('verification_status', 'pending')
            ->with('driver.user')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Pending KYC documents retrieved successfully',
            'data' => $documents
        ]);
    }

    public function approveKyc(Request $request, string $id)
    {
        $document = DriverKycDocument::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'KYC document not found',
                'data' => null
            ], 404);
        }

        $document->update([
            'verification_status' => 'approved',
            'verified_at' => now(),
        ]);

        $document->driver->update(['verification_status' => 'approved']);

        return response()->json([
            'success' => true,
            'message' => 'KYC document approved successfully',
            'data' => $document
        ]);
    }

    public function rejectKyc(Request $request, string $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $document = DriverKycDocument::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'KYC document not found',
                'data' => null
            ], 404);
        }

        $document->update([
            'verification_status' => 'rejected',
            'rejection_reason' => $validated['reason'],
            'verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'KYC document rejected successfully',
            'data' => $document
        ]);
    }
}
