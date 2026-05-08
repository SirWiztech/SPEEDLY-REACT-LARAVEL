<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DriverProfile;
use App\Models\DriverVehicle;
use App\Models\ClientProfile;
use App\Models\Ride;
use App\Models\WalletTransaction;
use App\Models\DriverWithdrawal;
use App\Models\DriverApprovalQueue;
use App\Models\AdminActivityLog;
use App\Models\SystemSetting;
use App\Models\Notification;
use App\Models\DriverKycDocument;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        $totalClients = User::where('role', 'client')->count();
        $totalDrivers = User::where('role', 'driver')->count();
        
        $totalRides = [
            'pending' => Ride::where('status', 'pending')->count(),
            'accepted' => Ride::where('status', 'accepted')->count(),
            'completed' => Ride::where('status', 'completed')->count(),
            'cancelled' => Ride::where('status', 'cancelled')->count(),
        ];
        
        $totalRevenue = Ride::where('status', 'completed')->sum('platform_commission');
            
        $totalPayouts = DriverWithdrawal::where('status', 'completed')->sum('amount');
        
        $pendingWithdrawals = [
            'count' => DriverWithdrawal::where('status', 'pending')->count(),
            'amount' => DriverWithdrawal::where('status', 'pending')->sum('amount'),
        ];
        
        $pendingKyc = DriverKycDocument::where('verification_status', 'pending')->count();
        
        return response()->json([
            'success' => true,
            'message' => 'Admin stats retrieved successfully',
            'data' => [
                'total_clients' => $totalClients,
                'total_drivers' => $totalDrivers,
                'total_rides' => $totalRides,
                'total_revenue' => $totalRevenue,
                'total_payouts' => $totalPayouts,
                'pending_withdrawals' => $pendingWithdrawals,
                'pending_kyc' => $pendingKyc,
            ]
        ]);
    }

    public function payments(Request $request)
    {
        $query = WalletTransaction::with('user');
            
        if ($request->has('from') && $request->has('to')) {
            $query->whereBetween('created_at', [$request->from, $request->to]);
        }
        
        $payments = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json([
            'success' => true,
            'message' => 'Payments retrieved successfully',
            'data' => $payments
        ]);
    }

    public function wallets(Request $request)
    {
        $users = User::with(['walletTransactions'])->paginate(15);
        
        $users->getCollection()->transform(function ($user) {
            $balance = $user->walletTransactions()
                ->select(DB::raw('SUM(CASE WHEN transaction_type = "credit" THEN amount ELSE -amount END) as balance'))
                ->first()->balance ?? 0;
                
            return [
                'id' => $user->id,
                'name' => $user->full_name ?? $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'balance' => $balance,
            ];
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Wallets retrieved successfully',
            'data' => $users
        ]);
    }

    public function reports(Request $request)
    {
        $type = $request->get('type', 'daily');
        $from = $request->get('from', Carbon::now()->subDays(30)->toDateString());
        $to = $request->get('to', Carbon::now()->toDateString());
        
        $dateFormat = match($type) {
            'weekly' => '%Y-%u',
            'monthly' => '%Y-%m',
            default => '%Y-%m-%d',
        };
        
        $ridesPerDay = DB::table('rides')
            ->select(DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as date"), DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$from, $to])
            ->groupBy(DB::raw("DATE_FORMAT(created_at, '{$dateFormat}')"))
            ->get();
            
        $revenuePerDay = DB::table('rides')
            ->select(DB::raw("DATE_FORMAT(completed_at, '{$dateFormat}') as date"), DB::raw('SUM(platform_commission) as total'))
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to])
            ->groupBy(DB::raw("DATE_FORMAT(completed_at, '{$dateFormat}')"))
            ->get();
            
        $newUsersPerDay = DB::table('users')
            ->select(DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as date"), DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$from, $to])
            ->groupBy(DB::raw("DATE_FORMAT(created_at, '{$dateFormat}')"))
            ->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Reports retrieved successfully',
            'data' => [
                'rides_per_day' => $ridesPerDay,
                'revenue_per_day' => $revenuePerDay,
                'new_users_per_day' => $newUsersPerDay,
            ]
        ]);
    }

    public function activityLogs(Request $request)
    {
        $logs = AdminActivityLog::with('admin')->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json([
            'success' => true,
            'message' => 'Activity logs retrieved successfully',
            'data' => $logs
        ]);
    }

    public function withdrawals(Request $request)
    {
        $query = DriverWithdrawal::with(['driver.user']);
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $withdrawals = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json([
            'success' => true,
            'message' => 'Withdrawals retrieved successfully',
            'data' => $withdrawals
        ]);
    }

    public function approveWithdrawal(Request $request, $id)
    {
        $withdrawal = DriverWithdrawal::findOrFail($id);
        
        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal is not pending',
                'data' => null
            ]);
        }
        
        $withdrawal->update([
            'status' => 'completed',
            'processed_at' => Carbon::now(),
        ]);
        
        Notification::create([
            'user_id' => $withdrawal->driver->user_id,
            'title' => 'Withdrawal Approved',
            'message' => "Your withdrawal of ₦{$withdrawal->amount} has been approved and processed.",
            'type' => 'withdrawal_approved',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Withdrawal approved successfully',
            'data' => $withdrawal
        ]);
    }

    public function rejectWithdrawal(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);
        
        $withdrawal = DriverWithdrawal::findOrFail($id);
        
        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal is not pending',
                'data' => null
            ]);
        }
        
        $withdrawal->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'processed_at' => Carbon::now(),
        ]);

        $user = $withdrawal->driver->user;
        $lastTx = WalletTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')->first();
        $balanceBefore = $lastTx ? $lastTx->balance_after : 0;
        $balanceAfter = $balanceBefore + $withdrawal->amount;
        
        WalletTransaction::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'transaction_type' => 'credit',
            'amount' => $withdrawal->amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
            'description' => 'Withdrawal reversal - ' . $request->reason,
            'status' => 'completed',
        ]);
        
        Notification::create([
            'user_id' => $withdrawal->driver->user_id,
            'title' => 'Withdrawal Rejected',
            'message' => "Your withdrawal of ₦{$withdrawal->amount} has been rejected. Reason: {$request->reason}",
            'type' => 'withdrawal_rejected',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Withdrawal rejected successfully',
            'data' => $withdrawal
        ]);
    }

    public function saveSettings(Request $request)
    {
        $settings = $request->all();
        
        foreach ($settings as $key => $value) {
            SystemSetting::updateOrCreate(
                ['setting_key' => $key],
                ['setting_value' => is_array($value) ? json_encode($value) : $value]
            );
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Settings saved successfully',
            'data' => null
        ]);
    }

    public function getSettings(Request $request)
    {
        $settings = SystemSetting::all();
        
        $formatted = [];
        foreach ($settings as $setting) {
            $formatted[$setting->setting_key] = $setting->setting_value;
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Settings retrieved successfully',
            'data' => $formatted
        ]);
    }

    public function getUser(Request $request, $id)
    {
        $user = User::with(['clientProfile', 'driverProfile.vehicle', 'walletTransactions'])->findOrFail($id);
        
        $balance = $user->walletTransactions()
            ->select(DB::raw('SUM(CASE WHEN transaction_type = "credit" THEN amount ELSE -amount END) as balance'))
            ->first()->balance ?? 0;
            
        $clientProfile = ClientProfile::where('user_id', $user->id)->first();
        $driverProfile = DriverProfile::where('user_id', $user->id)->first();
        $rideCount = 0;
        if ($clientProfile) {
            $rideCount += Ride::where('client_id', $clientProfile->id)->count();
        }
        if ($driverProfile) {
            $rideCount += Ride::where('driver_id', $driverProfile->id)->count();
        }
        
        $data = [
            'id' => $user->id,
            'name' => $user->full_name ?? $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'balance' => $balance,
            'ride_count' => $rideCount,
        ];
        
        if ($user->role === 'client' && $user->clientProfile) {
            $data['client_profile'] = $user->clientProfile;
        }
        
        if ($user->role === 'driver' && $user->driverProfile) {
            $data['driver_profile'] = $user->driverProfile;
            $data['vehicle'] = $user->driverProfile->vehicle;
        }
        
        return response()->json([
            'success' => true,
            'message' => 'User details retrieved successfully',
            'data' => $data
        ]);
    }

    public function drivers(Request $request)
    {
        $query = User::where('role', 'driver')->with(['driverProfile.vehicle']);
        
        if ($request->has('status')) {
            $query->whereHas('driverProfile', function ($q) use ($request) {
                $q->where('driver_status', $request->status);
            });
        }
        
        if ($request->has('verification')) {
            $query->whereHas('driverProfile', function ($q) use ($request) {
                $q->where('verification_status', $request->verification);
            });
        }
        
        $drivers = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json([
            'success' => true,
            'message' => 'Drivers retrieved successfully',
            'data' => $drivers
        ]);
    }

    public function approveDriver(Request $request, $id)
    {
        $driverProfile = DriverProfile::where('user_id', $id)->firstOrFail();
        
        $driverProfile->update([
            'verification_status' => 'approved',
        ]);
        
        DriverApprovalQueue::where('driver_profile_id', $driverProfile->id)->delete();
        
        Notification::create([
            'user_id' => $id,
            'title' => 'Driver Approved',
            'message' => 'Your driver application has been approved. You can now start accepting rides.',
            'type' => 'driver_approved',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Driver approved successfully',
            'data' => $driverProfile
        ]);
    }

    public function rejectDriver(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);
        
        $driverProfile = DriverProfile::where('user_id', $id)->firstOrFail();
        
        $driverProfile->update([
            'verification_status' => 'rejected',
        ]);
        
        DriverApprovalQueue::where('driver_profile_id', $driverProfile->id)->delete();
        
        Notification::create([
            'user_id' => $id,
            'title' => 'Driver Rejected',
            'message' => "Your driver application has been rejected. Reason: {$request->reason}",
            'type' => 'driver_rejected',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Driver rejected successfully',
            'data' => $driverProfile
        ]);
    }
}
