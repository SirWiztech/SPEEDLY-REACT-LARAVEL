<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\PaymentGatewayTransaction;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\Notification;
use App\Models\SystemSetting;
use App\Models\DriverProfile;
use App\Models\DriverWithdrawal;
use App\Models\DriverBankDetail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class PaymentController extends Controller
{
    private function getKorapayConfig(string $key, string $default = ''): string
    {
        $setting = SystemSetting::where('setting_key', $key)->first();
        return $setting->setting_value ?? env(strtoupper($key), $default);
    }

    private function getKorapaySecretKey(): string
    {
        return env('KORAPAY_SECRET_KEY', '');
    }

    private function getKorapayPublicKey(): string
    {
        return env('KORAPAY_PUBLIC_KEY', '');
    }

    private function getKorapayEnvironment(): string
    {
        return env('KORAPAY_ENVIRONMENT', 'sandbox');
    }

    private function getWalletBalance(string $userId): float
    {
        $creditTypes = ['deposit', 'bonus', 'referral', 'ride_refund', 'credit'];
        $debitTypes = ['withdrawal', 'ride_payment', 'debit'];

        $credit = WalletTransaction::where('user_id', $userId)
            ->whereIn('transaction_type', $creditTypes)
            ->where('status', 'completed')
            ->sum('amount');

        $debit = WalletTransaction::where('user_id', $userId)
            ->whereIn('transaction_type', $debitTypes)
            ->where('status', 'completed')
            ->sum('amount');

        return $credit - $debit;
    }

    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $reference = $validated['reference'] ?? 'SPD-' . strtoupper(Str::random(8)) . '-' . now()->format('YmdHis');
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => null,
            ], 401);
        }

        if ($validated['amount'] < 100) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum deposit amount is ₦100',
                'data' => null,
            ], 400);
        }

        $secretKey = $this->getKorapaySecretKey();
        if (empty($secretKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Payment gateway not configured. Please set KORAPAY_SECRET_KEY.',
                'data' => null,
            ], 502);
        }

        try {
            $korapayResponse = Http::withOptions(['verify' => false])->withToken($secretKey)
                ->post('https://api.korapay.com/merchant/api/v1/charges/initialize', [
                    'amount' => $validated['amount'],
                    'currency' => 'NGN',
                    'reference' => $reference,
                    'redirect_url' => $this->getKorapayConfig('korapay_redirect_url', config('app.url') . '/payment/callback'),
                    'notification_url' => $this->getKorapayConfig('korapay_webhook_url'),
                    'customer' => [
                        'email' => $validated['email'],
                        'name' => $validated['name'],
                    ],
                    'merchant_bears_cost' => true,
                    'metadata' => !empty($validated['metadata']) ? $validated['metadata'] : ['source' => 'Speedly Wallet'],
                ]);

            $korapayData = $korapayResponse->json();

            if (!$korapayResponse->successful() || ($korapayData['status'] ?? false) !== true) {
                $errorMsg = $korapayData['message'] ?? ($korapayData['status'] === false ? $korapayData['message'] : 'Failed to initiate payment');
                return response()->json([
                    'success' => false,
                    'message' => $errorMsg,
                    'data' => $korapayData,
                ], 400);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('KoraPay initiate failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to connect to payment gateway. Please try again.',
                'data' => null,
            ], 502);
        }

        PaymentGatewayTransaction::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'transaction_reference' => $reference,
            'amount' => $validated['amount'],
            'currency' => 'NGN',
            'status' => 'pending',
            'gateway_reference' => $korapayData['data']['reference'] ?? null,
            'gateway_response' => json_encode($korapayData),
            'expires_at' => Carbon::now()->addMinutes(30),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment initiated successfully',
            'data' => [
                'checkout_url' => $korapayData['data']['checkout_url'] ?? null,
                'reference' => $reference,
            ],
        ]);
    }

    public function callback(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            $redirectUrl = config('app.url') . '/clientwallet?payment_status=failed&message=' . urlencode('No reference provided');
            return redirect($redirectUrl);
        }

        $transaction = PaymentGatewayTransaction::where('transaction_reference', $reference)->first();

        if (!$transaction) {
            $redirectUrl = config('app.url') . '/clientwallet?payment_status=failed&message=' . urlencode('Transaction not found');
            return redirect($redirectUrl);
        }

        if ($transaction->status === 'success') {
            $redirectUrl = config('app.url') . '/clientwallet?payment_status=completed&reference=' . $reference;
            return redirect($redirectUrl);
        }

        $secretKey = $this->getKorapaySecretKey();
        if (empty($secretKey)) {
            $redirectUrl = config('app.url') . '/clientwallet?payment_status=failed&message=' . urlencode('Payment gateway not configured');
            return redirect($redirectUrl);
        }

        try {
            $verifyResponse = Http::withOptions(['verify' => false])->withToken($secretKey)
                ->get("https://api.korapay.com/merchant/api/v1/charges/{$reference}");

            $verifyData = $verifyResponse->json();

            if ($verifyResponse->successful() && ($verifyData['status'] ?? false) === true) {
                $txnData = $verifyData['data'] ?? [];
                $txnStatus = $txnData['status'] ?? '';

                if ($txnStatus === 'success') {
                    $this->processSuccessfulPayment($transaction, $txnData, $verifyData);
                } elseif ($txnStatus === 'failed') {
                    $transaction->update([
                        'status' => 'failed',
                        'gateway_response' => json_encode($verifyData),
                    ]);
                }
            }

            $status = $transaction->fresh()->status;
            $frontendStatus = $status === 'success' ? 'completed' : $status;
            $redirectUrl = config('app.url') . '/clientwallet?payment_status=' . $frontendStatus . '&reference=' . $reference;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Payment callback verification failed: ' . $e->getMessage(), [
                'reference' => $reference,
                'trace' => $e->getTraceAsString(),
            ]);
            $redirectUrl = config('app.url') . '/clientwallet?payment_status=pending&reference=' . $reference;
        }

        return redirect($redirectUrl);
    }

    public function verify(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            return response()->json([
                'success' => false,
                'message' => 'Reference is required',
                'data' => null,
            ], 400);
        }

        $transaction = PaymentGatewayTransaction::where('transaction_reference', $reference)->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
                'data' => null,
            ], 404);
        }

        if ($transaction->status !== 'pending') {
            $balance = $this->getWalletBalance($transaction->user_id);
            return response()->json([
                'success' => true,
                'message' => 'Payment status retrieved',
                'amount' => (float) $transaction->amount,
                'new_balance' => $balance,
                'data' => [
                    'status' => $transaction->status,
                    'transaction' => $transaction,
                ],
            ]);
        }

        $secretKey = $this->getKorapaySecretKey();
        if (empty($secretKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Payment gateway not configured',
                'data' => null,
            ], 502);
        }

        try {
            $verifyResponse = Http::withOptions(['verify' => false])->withToken($secretKey)
                ->get("https://api.korapay.com/merchant/api/v1/charges/{$reference}");

            $verifyData = $verifyResponse->json();

            if ($verifyResponse->successful() && ($verifyData['status'] ?? false) === true) {
                $txnData = $verifyData['data'] ?? [];
                $txnStatus = $txnData['status'] ?? '';

                if ($txnStatus === 'success') {
                    $this->processSuccessfulPayment($transaction, $txnData, $verifyData);
                } elseif ($txnStatus === 'failed') {
                    $transaction->update([
                        'status' => 'failed',
                        'gateway_response' => json_encode($verifyData),
                    ]);
                }
            }

            $transaction = $transaction->fresh();
            $balance = $this->getWalletBalance($transaction->user_id);
            return response()->json([
                'success' => true,
                'message' => 'Payment status retrieved',
                'amount' => (float) $transaction->amount,
                'new_balance' => $balance,
                'data' => [
                    'status' => $transaction->status,
                    'transaction' => $transaction,
                ],
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Payment verify API call failed: ' . $e->getMessage(), [
                'reference' => $reference,
            ]);
            $balance = $this->getWalletBalance($transaction->user_id);
            return response()->json([
                'success' => true,
                'message' => 'Could not reach payment gateway, please check back later.',
                'amount' => (float) $transaction->amount,
                'new_balance' => $balance,
                'data' => [
                    'status' => 'pending',
                    'transaction' => $transaction,
                ],
            ]);
        }
    }

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $data = json_decode($payload, true);
        $event = $data['event'] ?? '';
        $txnData = $data['data'] ?? [];
        $reference = $txnData['reference'] ?? null;

        if ($event === 'test.webhook') {
            return response('OK', 200);
        }

        $secretKey = $this->getKorapaySecretKey();
        $signature = $request->header('x-korapay-signature');

        if ($signature && !empty($secretKey)) {
            $expectedSignature = hash_hmac('sha256', $payload, $secretKey);
            if (!hash_equals($expectedSignature, $signature)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid webhook signature',
                ], 401);
            }
        }

        if (!$reference) {
            return response('OK', 200);
        }

        $transaction = PaymentGatewayTransaction::where('transaction_reference', $reference)->first();

        if (!$transaction) {
            return response('OK', 200);
        }

        if ($transaction->status === 'success') {
            return response('OK', 200);
        }

        if (in_array($event, ['charge.success', 'transfer.success'])) {
            $this->processSuccessfulPayment($transaction, $txnData, $data);
        } elseif (in_array($event, ['charge.failed', 'transfer.failed'])) {
            $transaction->update([
                'status' => 'failed',
                'webhook_received' => true,
                'webhook_data' => $payload,
                'gateway_response' => $payload,
            ]);
        }

        return response('OK', 200);
    }

    public function payoutWithdraw(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'password' => 'required|string',
            'bank_code' => 'required|string|max:10',
            'account_number' => 'required|string|max:20',
            'account_name' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:100',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password',
                'data' => null,
            ], 401);
        }

        $driverProfile = DriverProfile::where('user_id', $user->id)->first();
        if (!$driverProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
                'data' => null,
            ], 404);
        }

        $amount = $validated['amount'];
        $balance = $this->getWalletBalance($user->id);

        if ($amount > $balance) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance. Available: ₦' . number_format($balance, 2),
                'data' => null,
            ], 400);
        }

        $secretKey = $this->getKorapaySecretKey();
        if (empty($secretKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Payment gateway not configured',
                'data' => null,
            ], 502);
        }

        $reference = 'WTH-' . strtoupper(Str::random(8)) . '-' . now()->format('YmdHis');

        try {
            $korapayResponse = Http::withOptions(['verify' => false])->withToken($secretKey)
                ->post('https://api.korapay.com/merchant/api/v1/transactions/disburse', [
                    'reference' => $reference,
                    'destination' => [
                        'type' => 'bank_account',
                        'amount' => $amount,
                        'currency' => 'NGN',
                        'narration' => 'Driver withdrawal - ' . $user->full_name,
                        'bank_account' => [
                            'bank' => $validated['bank_code'],
                            'account' => $validated['account_number'],
                        ],
                    ],
                    'customer' => [
                        'name' => $validated['account_name'],
                        'email' => $user->email,
                    ],
                ]);

            $korapayData = $korapayResponse->json();

            if (!$korapayResponse->successful() || ($korapayData['status'] ?? false) !== true) {
                $errorMsg = $korapayData['message'] ?? 'Payout failed';
                return response()->json([
                    'success' => false,
                    'message' => $errorMsg,
                    'data' => $korapayData,
                ], 400);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('KoraPay payout failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to process payout. Please try again.',
                'data' => null,
            ], 502);
        }

        DB::transaction(function () use ($user, $driverProfile, $amount, $reference, $validated, $korapayData) {
            $balanceBefore = $this->getWalletBalance($user->id);
            $balanceAfter = $balanceBefore - $amount;

            DriverWithdrawal::create([
                'id' => Str::random(32),
                'driver_id' => $driverProfile->id,
                'amount' => $amount,
                'status' => 'completed',
                'bank_name' => $validated['bank_name'] ?? '',
                'account_number' => $validated['account_number'],
                'account_name' => $validated['account_name'],
                'processed_at' => now(),
            ]);

            WalletTransaction::create([
                'id' => Str::random(32),
                'user_id' => $user->id,
                'transaction_type' => 'withdrawal',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference' => $reference,
                'status' => 'completed',
                'category' => 'withdrawal',
                'description' => 'Withdrawal to ' . $validated['account_name'] . ' - ' . $validated['account_number'],
            ]);

            try {
                Notification::create([
                    'id' => Str::random(32),
                    'user_id' => $user->id,
                    'type' => 'withdrawal',
                    'title' => 'Withdrawal Successful',
                    'message' => 'Your withdrawal of ₦' . number_format($amount, 2) . ' has been processed. New balance: ₦' . number_format($balanceAfter, 2),
                    'is_read' => false,
                ]);
            } catch (\Exception $e) {
                // Notification is non-critical
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal processed successfully',
            'data' => [
                'reference' => $reference,
                'amount' => $amount,
            ],
        ]);
    }

    private function processSuccessfulPayment($transaction, array $txnData, array $rawData): void
    {
        $amount = $txnData['amount'] ?? $transaction->amount;
        $userId = $transaction->user_id;

        DB::transaction(function () use ($transaction, $txnData, $rawData, $amount, $userId) {
            $transaction->update([
                'status' => 'success',
                'gateway_reference' => $transaction->gateway_reference ?? ($txnData['reference'] ?? null),
                'payment_method' => $txnData['payment_method'] ?? null,
                'gateway_response' => json_encode($rawData),
                'webhook_received' => true,
                'webhook_data' => json_encode($rawData),
            ]);

            $balanceBefore = $this->getWalletBalance($userId);
            $balanceAfter = $balanceBefore + $amount;

            WalletTransaction::create([
                'id' => Str::random(32),
                'user_id' => $userId,
                'transaction_type' => 'deposit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference' => $transaction->transaction_reference,
                'status' => 'completed',
                'category' => 'wallet_funding',
                'description' => 'Wallet deposit via KoraPay - Ref: ' . $transaction->transaction_reference,
            ]);

            try {
                Notification::create([
                    'id' => Str::random(32),
                    'user_id' => $userId,
                    'type' => 'payment',
                    'title' => 'Deposit Successful',
                    'message' => 'Your deposit of ₦' . number_format($amount, 2) . ' has been successful. New balance: ₦' . number_format($balanceAfter, 2),
                    'is_read' => false,
                ]);
            } catch (\Exception $e) {
                // Notification is non-critical
            }
        });
    }
}
