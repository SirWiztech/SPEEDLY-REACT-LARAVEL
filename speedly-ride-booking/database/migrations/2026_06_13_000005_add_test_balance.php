<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $user = DB::table('users')->where('email', 'edgematrix2026@gmail.com')->first();

        if (!$user) return;

        DB::table('wallet_transactions')->insert([
            'id' => Str::random(32),
            'user_id' => $user->id,
            'transaction_type' => 'deposit',
            'amount' => 100000,
            'balance_before' => 0,
            'balance_after' => 100000,
            'reference' => 'TEST-BALANCE-' . strtoupper(Str::random(8)),
            'status' => 'completed',
            'category' => 'deposit',
            'description' => 'Test balance credit for development',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void {}
};
