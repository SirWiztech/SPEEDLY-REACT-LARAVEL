<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\DriverProfile;
use App\Models\DriverWithdrawal;
use App\Models\DriverBankDetail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class WalletController extends Controller
{
    public function getClientWallet(Request $request)
    {
        $user = $request->user();

        $credits = WalletTransaction::where('user_id', $user->id)
            ->where('transaction_type', 'credit')->sum('amount');
        $debits = WalletTransaction::where('user_id', $user->id)
            ->where('transaction_type', 'debit')->sum('amount');
        $balance = $credits - $debits;

        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')->limit(10)->get();

        return response()->json([
            'success' => true,
            'message' => 'Wallet info retrieved',
            'data' => [
                'balance' => $balance,
                'currency' => 'NGN',
                'recent_transactions' => $recentTransactions
            ]
        ]);
    }

    public function getDriverWallet(Request $request)
    {
        $user = $request->user();
        $driverProfile = DriverProfile::where('user_id', $user->id)->first();

        $credits = WalletTransaction::where('user_id', $user->id)
            ->where('transaction_type', 'credit')->sum('amount');
        $debits = WalletTransaction::where('user_id', $user->id)
            ->where('transaction_type', 'debit')->sum('amount');
        $balance = $credits - $debits;

        $pendingWithdrawals = 0;
        if ($driverProfile) {
            $pendingWithdrawals = DriverWithdrawal::where('driver_id', $driverProfile->id)
                ->where('status', 'pending')->sum('amount');
        }

        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')->limit(10)->get();

        return response()->json([
            'success' => true,
            'message' => 'Driver wallet info retrieved',
            'data' => [
                'balance' => $balance,
                'currency' => 'NGN',
                'pending_withdrawals' => $pendingWithdrawals,
                'recent_transactions' => $recentTransactions
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

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate(15, ['id', 'transaction_type', 'amount', 'balance_before', 'balance_after', 'description', 'reference', 'status', 'created_at']);

        return response()->json([
            'success' => true,
            'message' => 'Transactions retrieved',
            'data' => $transactions
        ]);
    }

    public function getDriverTransactions(Request $request)
    {
        $user = $request->user();

        $query = WalletTransaction::where('user_id', $user->id);

        if ($request->has('type') && in_array($request->type, ['credit', 'debit'])) {
            $query->where('transaction_type', $request->type);
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate(15, ['id', 'transaction_type', 'amount', 'balance_before', 'balance_after', 'description', 'reference', 'status', 'created_at']);

        return response()->json([
            'success' => true,
            'message' => 'Transactions retrieved',
            'data' => $transactions
        ]);
    }

    public function requestWithdrawal(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:0.01']);

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
                'id' => Str::uuid(),
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
