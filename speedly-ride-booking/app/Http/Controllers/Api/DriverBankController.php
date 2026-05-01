<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\DriverProfile;
use App\Models\DriverBankDetail;
use Illuminate\Support\Facades\DB;

class DriverBankController extends Controller
{
    public function getBankDetails(Request $request)
    {
        $driverProfile = DriverProfile::where('user_id', $request->user()->id)->first();

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
                'data' => null
            ]);
        }

        $bankDetails = DriverBankDetail::where('driver_id', $driverProfile->id)->first();

        return response()->json([
            'success' => true,
            'message' => 'Bank details retrieved successfully',
            'data' => $bankDetails ? [
                'bank_name' => $bankDetails->bank_name,
                'account_number' => $bankDetails->account_number,
                'account_name' => $bankDetails->account_name
            ] : null
        ]);
    }

    public function saveBankDetails(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_name' => 'required|string'
        ]);

        $driverProfile = DriverProfile::where('user_id', $request->user()->id)->first();

        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
                'data' => null
            ]);
        }

        DriverBankDetail::updateOrCreate(
            ['driver_id' => $driverProfile->id],
            [
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Bank details saved successfully',
            'data' => null
        ]);
    }
}
