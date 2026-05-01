<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\PaymentSession;
use App\Models\PaymentGatewayTransaction;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Carbon;

class PaymentController extends Controller
{
    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $reference = $validated['reference'] ?? 'SPEEDLY-' . now()->timestamp . Str::random(8);
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => null,
            ], 401);
        }

        $korapayResponse = Http::withToken(env('KORAPAY_SECRET_KEY'))
            ->post('https://api.korapay.com/merchant/api/v1/charges/normal', [
                'amount' => $validated['amount'],
                'currency' => 'NGN',
                'customer' => [
                    'email' => $validated['email'],
                    'name' => $validated['name'],
                ],
                'reference' => $reference,
                'redirect_url' => config('app.url') . '/payment/callback',
                'metadata' => $validated['metadata'] ?? [],
            ]);

        $korapayData = $korapayResponse->json();

        if (!$korapayResponse->successful() || ($korapayData['status'] ?? '') !== 'success') {
            return response()->json([
                'success' => false,
                'message' => $korapayData['message'] ?? 'Failed to initiate KoraPay payment',
                'data' => $korapayData,
            ], 400);
        }

        $paymentSession = PaymentSession::create([
            'user_id' => $user->id,
            'gateway' => 'korapay',
            'reference' => $reference,
            'amount' => $validated['amount'],
            'currency' => 'NGN',
            'status' => 'pending',
            'metadata' => isset($validated['metadata']) ? json_encode($validated['metadata']) : null,
            'expires_at' => Carbon::now()->addHours(24),
            'gateway_response' => json_encode($korapayData),
        ]);

        PaymentGatewayTransaction::create([
            'payment_session_id' => $paymentSession->id,
            'user_id' => $user->id,
            'gateway' => 'korapay',
            'gateway_transaction_id' => $korapayData['data']['transaction_id'] ?? null,
            'type' => 'charge',
            'amount' => $validated['amount'],
            'currency' => 'NGN',
            'status' => 'pending',
            'gateway_response' => json_encode($korapayData),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment initiated successfully',
            'data' => [
                'payment_url' => $korapayData['data']['checkout_url'] ?? null,
                'reference' => $reference,
            ],
        ]);
    }

    public function callback(Request $request)
    {
        $paymentId = $request->query('paymentId');
        $payerId = $request->query('PayerID');

        if (!$paymentId) {
            return response()->json([
                'success' => false,
                'message' => 'Payment ID is required',
                'data' => null,
            ], 400);
        }

        $verifyResponse = Http::withToken(env('KORAPAY_SECRET_KEY'))
            ->get("https://api.korapay.com/merchant/api/v1/transactions/{$paymentId}");

        $verifyData = $verifyResponse->json();

        if (!$verifyResponse->successful() || ($verifyData['status'] ?? '') !== 'success') {
            return response()->json([
                'success' => false,
                'message' => $verifyData['message'] ?? 'Failed to verify payment',
                'data' => $verifyData,
            ], 400);
        }

        $transaction = $verifyData['data'] ?? [];
        $reference = $transaction['reference'] ?? $paymentId;

        $paymentSession = PaymentSession::where('reference', $reference)
            ->where('gateway', 'korapay')
            ->first();

        if (!$paymentSession) {
            return response()->json([
                'success' => false,
                'message' => 'Payment session not found',
                'data' => null,
            ], 404);
        }

        if ($paymentSession->status === 'success') {
            return response()->json([
                'success' => true,
                'message' => 'Payment already verified',
                'data' => $paymentSession,
            ]);
        }

        DB::transaction(function () use ($paymentSession, $transaction, $verifyData) {
            $paymentSession->update([
                'status' => 'success',
                'gateway_response' => json_encode($verifyData),
            ]);

            WalletTransaction::create([
                'user_id' => $paymentSession->user_id,
                'type' => 'credit',
                'category' => 'wallet_funding',
                'amount' => $paymentSession->amount,
                'currency' => $paymentSession->currency,
                'status' => 'success',
                'gateway_response' => json_encode($verifyData),
            ]);

            PaymentGatewayTransaction::where('payment_session_id', $paymentSession->id)
                ->update([
                    'gateway_transaction_id' => $transaction['id'] ?? null,
                    'status' => 'success',
                    'gateway_response' => json_encode($verifyData),
                ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Payment verified successfully',
            'data' => [
                'payment_session' => $paymentSession->fresh(),
                'transaction' => $transaction,
            ],
        ]);
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

        $paymentSession = PaymentSession::where('reference', $reference)
            ->where('gateway', 'korapay')
            ->first();

        if (!$paymentSession) {
            return response()->json([
                'success' => false,
                'message' => 'Payment session not found',
                'data' => null,
            ], 404);
        }

        if ($paymentSession->status !== 'pending') {
            return response()->json([
                'success' => true,
                'message' => 'Payment status retrieved',
                'data' => [
                    'status' => $paymentSession->status,
                    'payment_session' => $paymentSession,
                ],
            ]);
        }

        $verifyResponse = Http::withToken(env('KORAPAY_SECRET_KEY'))
            ->get("https://api.korapay.com/merchant/api/v1/transactions/{$reference}");

        $verifyData = $verifyResponse->json();

        if ($verifyResponse->successful() && ($verifyData['status'] ?? '') === 'success') {
            $transaction = $verifyData['data'] ?? [];

            DB::transaction(function () use ($paymentSession, $transaction, $verifyData) {
                $paymentSession->update([
                    'status' => 'success',
                    'gateway_response' => json_encode($verifyData),
                ]);

                WalletTransaction::create([
                    'user_id' => $paymentSession->user_id,
                    'type' => 'credit',
                    'category' => 'wallet_funding',
                    'amount' => $paymentSession->amount,
                    'currency' => $paymentSession->currency,
                    'status' => 'success',
                    'gateway_response' => json_encode($verifyData),
                ]);

                PaymentGatewayTransaction::where('payment_session_id', $paymentSession->id)
                    ->update([
                        'gateway_transaction_id' => $transaction['id'] ?? null,
                        'status' => 'success',
                        'gateway_response' => json_encode($verifyData),
                    ]);
            });

            $message = 'Payment verified successfully';
        } else {
            if (($verifyData['data']['status'] ?? '') === 'failed') {
                $paymentSession->update(['status' => 'failed']);
            }
            $message = 'Payment pending or verification failed';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'status' => $paymentSession->fresh()->status,
                'payment_session' => $paymentSession->fresh(),
            ],
        ]);
    }

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('x-korapay-signature');

        if ($signature) {
            $expectedSignature = hash_hmac('sha256', $payload, env('KORAPAY_SECRET_KEY'));
            if (!hash_equals($expectedSignature, $signature)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid webhook signature',
                    'data' => null,
                ], 401);
            }
        }

        $data = json_decode($payload, true);
        $event = $data['event'] ?? '';
        $transaction = $data['data'] ?? [];
        $reference = $transaction['reference'] ?? null;

        if (!$reference) {
            return response('OK', 200);
        }

        $paymentSession = PaymentSession::where('reference', $reference)
            ->where('gateway', 'korapay')
            ->first();

        if (!$paymentSession) {
            return response('OK', 200);
        }

        if ($event === 'charge.success') {
            DB::transaction(function () use ($paymentSession, $transaction, $data) {
                $paymentSession->update([
                    'status' => 'success',
                    'gateway_response' => json_encode($data),
                ]);

                WalletTransaction::create([
                    'user_id' => $paymentSession->user_id,
                    'type' => 'credit',
                    'category' => 'wallet_funding',
                    'amount' => $paymentSession->amount,
                    'currency' => $paymentSession->currency,
                    'status' => 'success',
                    'gateway_response' => json_encode($data),
                ]);

                PaymentGatewayTransaction::where('payment_session_id', $paymentSession->id)
                    ->update([
                        'gateway_transaction_id' => $transaction['id'] ?? null,
                        'status' => 'success',
                        'gateway_response' => json_encode($data),
                    ]);
            });
        } elseif ($event === 'charge.failed') {
            $paymentSession->update([
                'status' => 'failed',
                'gateway_response' => json_encode($data),
            ]);
        }

        return response('OK', 200);
    }
}
