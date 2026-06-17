<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Revert ride_id columns mistakenly converted to BIGINT — rides.id is still string(32)
        $rideIdTables = [
            'wallet_transactions',
            'ride_declines',
            'ride_cancellations',
            'chats',
        ];

        foreach ($rideIdTables as $table) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'ride_id')) continue;

            DB::statement("ALTER TABLE {$table} ALTER COLUMN ride_id TYPE VARCHAR(32) USING (ride_id::VARCHAR)");
        }

        // Re-add foreign keys dropped by earlier migrations
        Schema::table('wallet_transactions', function (Blueprint $table) {
            if (!$this->fkExists('wallet_transactions', 'wallet_transactions_ride_id_foreign')) {
                $table->foreign('ride_id')->references('id')->on('rides')->onDelete('set null');
            }
        });

        Schema::table('ride_declines', function (Blueprint $table) {
            if (!$this->fkExists('ride_declines', 'ride_declines_ride_id_foreign')) {
                $table->foreign('ride_id')->references('id')->on('rides')->onDelete('cascade');
            }
        });

        Schema::table('ride_cancellations', function (Blueprint $table) {
            if (!$this->fkExists('ride_cancellations', 'ride_cancellations_ride_id_foreign')) {
                $table->foreign('ride_id')->references('id')->on('rides')->onDelete('cascade');
            }
        });

        Schema::table('chats', function (Blueprint $table) {
            if (!$this->fkExists('chats', 'chats_ride_id_foreign')) {
                $table->foreign('ride_id')->references('id')->on('rides')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        // No revert — string(32) is the correct type matching rides.id
    }

    private function fkExists(string $table, string $constraintName): bool
    {
        $result = DB::selectOne(
            "SELECT 1 FROM information_schema.table_constraints
             WHERE constraint_name = ? AND table_name = ?",
            [$constraintName, $table]
        );
        return $result !== null;
    }
};
