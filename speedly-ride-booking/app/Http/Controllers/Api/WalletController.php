<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\DriverProfile;
use App\Models\DriverWithdrawal;
use App\Models\DriverBankDetail;
use App\Models\Notification;
use App\Models\Ride;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class WalletController extends Controller
{
    public function getClientWallet(Request $request)
    {
        $user = $request->user();

        $creditTypes = ['deposit', 'bonus', 'referral', 'ride_refund', 'credit'];
        $debitTypes = ['withdrawal', 'ride_payment', 'debit'];

        $credits = WalletTransaction::where('user_id', $user->id)
            ->whereIn('transaction_type', $creditTypes)
            ->where('status', 'completed')->sum('amount');
        $debits = WalletTransaction::where('user_id', $user->id)
            ->whereIn('transaction_type', $debitTypes)
            ->where('status', 'completed')->sum('amount');
        $balance = $credits - $debits;

        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')->limit(10)->get()
            ->map(function ($t) {
                return $this->formatTransaction($t);
            });

        $rideCount = Ride::where('client_id', function ($q) use ($user) {
            $q->select('id')->from('client_profiles')->where('user_id', $user->id);
        })->count();

        $notifCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'message' => 'Wallet info retrieved',
            'data' => [
                'balance' => (float) $balance,
                'currency' => 'NGN',
                'ride_count' => $rideCount,
                'recent_transactions' => $recentTransactions,
                'user' => [
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'phone_number' => $user->phone_number,
                    'profile_picture_url' => $user->profile_picture_url,
                ],
                'notification_count' => $notifCount,
                'payment_methods' => [],
            ]
        ]);
    }

    private function formatTransaction($t)
    {
        $creditTypes = ['deposit', 'bonus', 'referral', 'ride_refund', 'credit'];
        return [
            'id' => $t->id,
            'transaction_type' => $t->transaction_type,
            'amount' => (float) $t->amount,
            'formatted_amount' => number_format((float) $t->amount, 2),
            'status' => $t->status ?? 'completed',
            'created_at' => $t->created_at,
            'date' => $t->created_at ? Carbon::parse($t->created_at)->format('M d, Y h:i A') : '',
            'reference' => $t->reference,
            'description' => $t->description,
            'balance_before' => (float) ($t->balance_before ?? 0),
            'balance_after' => (float) ($t->balance_after ?? 0),
            'ride_number' => null,
            'display_id' => substr($t->id, 0, 8) . '...',
            'is_credit' => in_array($t->transaction_type, $creditTypes),
            'type_display' => $t->category ? ucfirst(str_replace('_', ' ', $t->category)) : (in_array($t->transaction_type, $creditTypes) ? 'Deposit' : 'Withdrawal'),
        ];
    }

    public function getDriverWallet(Request $request)
    {
        $user = $request->user();
        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $startOfMonth = Carbon::now()->startOfMonth();

        $creditTypes = ['deposit', 'bonus', 'referral', 'ride_refund', 'credit'];
        $debitTypes = ['withdrawal', 'ride_payment', 'debit'];

        $credits = WalletTransaction::where('user_id', $user->id)
            ->whereIn('transaction_type', $creditTypes)
            ->where('status', 'completed')->sum('amount');
        $debits = WalletTransaction::where('user_id', $user->id)
            ->whereIn('transaction_type', $debitTypes)
            ->where('status', 'completed')->sum('amount');
        $balance = $credits - $debits;

        $totalEarnings = WalletTransaction::where('user_id', $user->id)
            ->where('transaction_type', 'credit')
            ->where('category', 'ride_earning')
            ->sum('amount');

        $todayEarnings = WalletTransaction::where('user_id', $user->id)
            ->where('transaction_type', 'credit')
            ->where('category', 'ride_earning')
            ->where('created_at', '>=', $today)
            ->sum('amount');

        $weekEarnings = WalletTransaction::where('user_id', $user->id)
            ->where('transaction_type', 'credit')
            ->where('category', 'ride_earning')
            ->where('created_at', '>=', $startOfWeek)
            ->sum('amount');

        $monthEarnings = WalletTransaction::where('user_id', $user->id)
            ->where('transaction_type', 'credit')
            ->where('category', 'ride_earning')
            ->where('created_at', '>=', $startOfMonth)
            ->sum('amount');

        $totalWithdrawn = 0;
        $pendingWithdrawals = 0;
        if ($driverProfile) {
            $totalWithdrawn = DriverWithdrawal::where('driver_id', $driverProfile->id)
                ->whereIn('status', ['approved', 'paid'])->sum('amount');
            $pendingWithdrawals = DriverWithdrawal::where('driver_id', $driverProfile->id)
                ->where('status', 'pending')->sum('amount');
        }

        $notificationCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        $userData = [
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'profile_picture_url' => $user->profile_picture_url,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Driver wallet info retrieved',
            'data' => [
                'stats' => [
                    'wallet_balance' => (float) $balance,
                    'total_earnings' => (float) $totalEarnings,
                    'total_withdrawn' => (float) $totalWithdrawn,
                    'today_earnings' => (float) $todayEarnings,
                    'week_earnings' => (float) $weekEarnings,
                    'month_earnings' => (float) $monthEarnings,
                    'pending_withdrawals' => (float) $pendingWithdrawals,
                ],
                'user' => $userData,
                'notification_count' => $notificationCount,
            ]
        ]);
    }

    public function getClientTransactions(Request $request)
    {
        $user = $request->user();

        $query = WalletTransaction::where('user_id', $user->id);

        if ($request->has('type') && in_array($request->type, ['credit', 'debit'])) {
            $query->where('transaction_type', $request->type);
        }

        $paginated = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        $transactions = collect($paginated->items())->map(function ($t) {
            return $this->formatTransaction($t);
        });

        return response()->json([
            'success' => true,
            'message' => 'Transactions retrieved',
            'data' => [
                'transactions' => $transactions,
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    public function getDriverTransactions(Request $request)
    {
        $user = $request->user();
        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        $recentRides = [];
        $withdrawals = [];

        if ($driverProfile) {
            $rides = Ride::where('driver_id', $driverProfile->id)
                ->where('status', 'completed')
                ->with('client.user')
                ->orderBy('created_at', 'DESC')
                ->limit(15)
                ->get();

            $recentRides = $rides->map(function ($ride) {
                return [
                    'id' => $ride->id,
                    'ride_number' => $ride->ride_number,
                    'total_fare' => (float) $ride->total_fare,
                    'driver_payout' => (float) $ride->driver_payout,
                    'created_at' => $ride->created_at,
                    'formatted_date' => $ride->created_at ? $ride->created_at->format('M d, Y') : '',
                    'formatted_time' => $ride->created_at ? $ride->created_at->format('h:i A') : '',
                    'pickup_address' => $ride->pickup_address,
                    'destination_address' => $ride->destination_address,
                    'client_name' => $ride->client?->user?->full_name ?? 'Unknown',
                ];
            });

            $withdrawals = DriverWithdrawal::where('driver_id', $driverProfile->id)
                ->orderBy('created_at', 'DESC')
                ->limit(20)
                ->get()
                ->map(function ($w) {
                    return [
                        'id' => $w->id,
                        'amount' => (float) $w->amount,
                        'bank_name' => $w->bank_name,
                        'account_number' => $w->account_number,
                        'account_name' => $w->account_name,
                        'status' => $w->status,
                        'created_at' => $w->created_at,
                        'formatted_date' => $w->created_at ? $w->created_at->format('M d, Y') : '',
                    ];
                });
        }

        return response()->json([
            'success' => true,
            'message' => 'Transactions retrieved',
            'data' => [
                'recent_rides' => $recentRides,
                'withdrawals' => $withdrawals,
            ]
        ]);
    }

    public function requestWithdrawal(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'bank_name' => 'sometimes|string|max:100',
            'account_number' => 'sometimes|string|max:20',
            'account_name' => 'sometimes|string|max:255',
        ]);

        $user = $request->user();
        $amount = $request->amount;

        $driverProfile = DriverProfile::where('user_id', $user->id)->first();
        if (!$driverProfile) {
            return response()->json(['success' => false, 'message' => 'Driver profile not found', 'data' => null]);
        }

        $credits = WalletTransaction::where('user_id', $user->id)->where('transaction_type', 'credit')->sum('amount');
        $debits = WalletTransaction::where('user_id', $user->id)->where('transaction_type', 'debit')->sum('amount');
        $availableBalance = $credits - $debits;

        if ($amount > $availableBalance) {
            return response()->json(['success' => false, 'message' => 'Insufficient balance', 'data' => null]);
        }

        $bankDetail = DriverBankDetail::where('driver_id', $driverProfile->id)->first();

        if (!$bankDetail && $request->bank_name && $request->account_number && $request->account_name) {
            $bankDetail = DriverBankDetail::create([
                'driver_id' => $driverProfile->id,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
            ]);
        }

        if (!$bankDetail) {
            return response()->json(['success' => false, 'message' => 'Please add bank details first', 'data' => null]);
        }

        DB::beginTransaction();
        try {
            $withdrawal = DriverWithdrawal::create([
                'driver_id' => $driverProfile->id,
                'amount' => $amount,
                'status' => 'pending',
                'bank_name' => $bankDetail->bank_name,
                'account_number' => $bankDetail->account_number,
                'account_name' => $bankDetail->account_name,
            ]);

            $lastTransaction = WalletTransaction::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')->first();
            $balanceBefore = $lastTransaction ? $lastTransaction->balance_after : 0;
            $balanceAfter = $balanceBefore - $amount;

            WalletTransaction::create([
                'id' => Str::random(32),
                'user_id' => $user->id,
                'transaction_type' => 'debit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'description' => 'Withdrawal request',
                'reference' => 'WTH-' . strtoupper(Str::random(8)),
                'status' => 'completed',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal requested successfully',
                'data' => [
                    'withdrawal_id' => $withdrawal->id,
                    'amount' => $amount
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to request withdrawal', 'data' => null]);
        }
    }
}
