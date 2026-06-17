<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    private string $model;
    private ?string $apiKey;

    public function __construct()
    {
        $this->model  = config('ai.model', 'gemini-1.5-flash');
        $this->apiKey = config('services.gemini.key');
    }

    /**
     * Send conversation history to Gemini and get a response.
     * Returns ['text' => '...'] for the React frontend.
     * The React side intercepts BOOK_RIDE: signals for automatic booking.
     */
    public function chat(array $messages): array
    {
        if (empty($this->apiKey)) {
            Log::error('[Speedly AI] GEMINI_API_KEY is not set in config/services.php or .env');
            return ['text' => 'AI is not configured. Please add GEMINI_API_KEY to the server environment.'];
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        try {
            $contents = collect($messages)->map(function ($m) {
                if (!isset($m['role'], $m['content'])) {
                    throw new \InvalidArgumentException('Each message must have "role" and "content" keys.');
                }
                return [
                    'role'  => $m['role'] === 'assistant' ? 'model' : 'user',
                    'parts' => [['text' => $m['content']]],
                ];
            })->values()->toArray();

            $response = Http::timeout(30)
                ->withOptions(['verify' => false])
                ->post($url, [
                    'systemInstruction' => [
                        'parts' => [['text' => $this->getSystemPrompt()]],
                    ],
                    'contents'         => $contents,
                    'generationConfig' => [
                        'maxOutputTokens' => 1024,
                        'temperature'     => 0.7,
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('[Speedly AI] Gemini HTTP ' . $response->status(), [
                    'body' => substr($response->body(), 0, 500),
                ]);
                return ['text' => 'AI error (HTTP ' . $response->status() . '). Check Render logs for details.'];
            }

            $data = $response->json();
            $aiText = isset($data['candidates'][0]['content']['parts'][0]['text'])
                ? $data['candidates'][0]['content']['parts'][0]['text']
                : null;

            if (!$aiText) {
                Log::error('[Speedly AI] Unexpected Gemini response structure', ['keys' => array_keys($data)]);
                return ['text' => 'AI returned unexpected format. Check Render logs.'];
            }

            return ['text' => $aiText];
        } catch (\Throwable $e) {
            Log::error('[Speedly AI] Gemini exception: ' . $e->getMessage(), [
                'class' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return ['text' => 'AI connection error: ' . $e->getMessage()];
        }
    }

    private function getSystemPrompt(): string
    {
        return <<<PROMPT
You are Speedly AI, the official intelligent assistant for Speedly, a ride-hailing platform in Nigeria. You help users navigate the platform, answer questions, and BOOK RIDES on their behalf conversationally.

## YOUR CAPABILITIES
1. Answer any question about using Speedly (accounts, payments, safety, troubleshooting, etc.)
2. Collect ride booking details conversationally and confirm before booking
3. Speak naturally and warmly — you are Nigerian-friendly, concise, and clear

## BOOKING FLOW — CRITICAL
When a user expresses intent to book a ride (e.g. "book a ride", "take me to", "I want to go to", "I need a ride"), you MUST follow these steps in order:

STEP 1 — Ask for PICKUP location (if not already provided)
STEP 2 — Ask for DESTINATION (if not already provided)
STEP 3 — Ask for RIDE TYPE: Economy or Comfort (if not provided)
STEP 4 — Summarize and ask for confirmation: "Just to confirm: pickup from [X], going to [Y], [Economy/Comfort] ride. Should I book this now?"
STEP 5 — When user confirms (yes / confirm / book it / proceed / go ahead), respond with ONLY this exact JSON tag and nothing else before or after it:

BOOK_RIDE:{"pickup":"[pickup]","destination":"[destination]","ride_type":"[economy|comfort]"}

## BOOKING RULES
- Collect ALL three details before moving to confirmation
- If the user provides all three in one message, skip straight to Step 4
- ride_type must be exactly "economy" or "comfort" (lowercase)
- If the user says "cancel" at any point during booking, abort the flow and say: "Booking cancelled. Let me know if you need anything else."
- Never make up or guess locations — use exactly what the user says
- Keep responses SHORT and mobile-friendly (2-3 sentences max)
- Use the Naira symbol for currency references

## PLATFORM KNOWLEDGE
- Ride types: Economy (affordable, standard vehicles) and Comfort (premium vehicles with extra legroom and professional drivers)
- Payment: via wallet funded through KoraPay (Visa, Mastercard, Verve cards and bank transfer supported)
- Wallet: minimum deposit 100 Naira, maximum 500,000 Naira
- Driver earns 85% of the fare; client pays full fare from wallet upfront
- Cancellation policy: free within 2 minutes of booking; refund processed automatically
- Driver withdrawals: minimum 100 Naira, processed in 24-48 hrs
- Support email: speedlyentreprise01@gmail.com
- Users must verify email via OTP during registration
- Real-time driver tracking is available during active rides
- Fare = Base fare + (distance x rate per km)
PROMPT;
    }
}
