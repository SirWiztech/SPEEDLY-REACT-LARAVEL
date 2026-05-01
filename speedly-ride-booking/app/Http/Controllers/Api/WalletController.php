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
            ->where('type', 'credit')->sum('amount');
        $debits = WalletTransaction::where('user_id', $user->id)
            ->where('type', 'debit')->sum('amount');
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

        $credits = WalletTransaction::where('user_id', $user->id)
            ->where('type', 'credit')->sum('amount');
        $debits = WalletTransaction::where('user_id', $user->id)
            ->where('type', 'debit')->sum('amount');
        $balance = $credits - $debits;

        $pendingWithdrawals = DriverWithdrawal::where('user_id', $user->id)
            ->where('status', 'pending')->sum('amount');

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
            $query->where('type', $request->type);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate(15, ['id', 'type', 'category', 'amount', 'balance_after', 'description', 'reference', 'created_at']);

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
            $query->where('type', $request->type);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate(15, ['id', 'type', 'category', 'amount', 'balance_after', 'description', 'reference', 'created_at']);

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

        $credits = WalletTransaction::where('user_id', $user->id)->where('type', 'credit')->sum('amount');
        $debits = WalletTransaction::where('user_id', $user->id)->where('type', 'debit')->sum('amount');
        $availableBalance = $credits - $debits;

        if ($amount > $availableBalance) {
            return response()->json(['success' => false, 'message' => 'Insufficient balance', 'data' => null]);
        }

        $bankDetail = DriverBankDetail::where('user_id', $user->id)->first();
        if (!$bankDetail) {
            return response()->json(['success' => false, 'message' => 'Please add bank details first', 'data' => null]);
        }

        DB::beginTransaction();
        try {
            $withdrawal = DriverWithdrawal::create([
                'driver_id' => $driverProfile->id,
                'user_id' => $user->id,
                'amount' => $amount,
                'status' => 'pending',
                'bank_name' => $bankDetail->bank_name,
                'account_number' => $bankDetail->account_number,
                'account_name' => $bankDetail->account_name,
            ]);

            $lastTransaction = WalletTransaction::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')->first();
            $balanceAfter = $lastTransaction ? $lastTransaction->balance_after - $amount : -$amount;

            WalletTransaction::create([
                'user_id' => $user->id,
                'type' => 'debit',
                'category' => 'withdrawal_hold',
                'amount' => $amount,
                'balance_after' => $balanceAfter,
                'description' => 'Withdrawal request',
                'reference' => 'WTH-' . strtoupper(Str::random(8)),
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
