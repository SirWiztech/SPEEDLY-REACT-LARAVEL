<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Services\AIService;

class AIAssistantController extends Controller
{
    public function __construct(private AIService $ai) {}

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'messages' => 'required|array|min:1',
            'messages.*.role' => 'required|string|in:user,assistant',
            'messages.*.content' => 'required|string',
        ]);

        $result = $this->ai->chat($request->messages);

        return response()->json($result);
    }
}
