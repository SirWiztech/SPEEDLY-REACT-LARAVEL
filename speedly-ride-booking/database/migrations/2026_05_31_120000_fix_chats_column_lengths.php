<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Keep columns at 32 to match rides.id — PostgreSQL requires FK types to match
    }

    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->string('sender_id', 32)->change();
            $table->string('ride_id', 32)->change();
        });
    }
};
