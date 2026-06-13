<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Order matters — truncate children before parents
        $truncate = [
            'ride_declines', 'ride_cancellations', 'chats',
            'wallet_transactions', 'payment_gateway_transactions', 'payment_sessions',
            'driver_ratings', 'client_ratings',
            'support_tickets', 'notifications',
            'driver_vehicles', 'driver_kyc_documents',
            'driver_approval_queue', 'driver_withdrawals', 'driver_bank_details',
            'client_withdrawals',
            'rides',
        ];

        foreach ($truncate as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                DB::statement("TRUNCATE TABLE {$table} RESTART IDENTITY CASCADE");
            }
        }

        // Now convert all FK columns to BIGINT
        $columns = [
            'rides' => ['client_id', 'driver_id'],
            'driver_vehicles' => ['driver_id'],
            'driver_kyc_documents' => ['driver_id'],
            'driver_approval_queue' => ['driver_id'],
            'driver_withdrawals' => ['driver_id'],
            'driver_bank_details' => ['driver_id'],
            'driver_ratings' => ['driver_id'],
            'client_ratings' => ['client_id'],
            'ride_declines' => ['driver_id', 'ride_id'],
            'ride_cancellations' => ['ride_id'],
            'chats' => ['ride_id'],
            'wallet_transactions' => ['user_id', 'ride_id'],
            'support_tickets' => ['user_id'],
            'payment_gateway_transactions' => ['user_id'],
            'payment_sessions' => ['user_id'],
            'notifications' => ['user_id'],
        ];

        foreach ($columns as $table => $cols) {
            if (!DB::getSchemaBuilder()->hasTable($table)) continue;
            foreach ($cols as $col) {
                if (!DB::getSchemaBuilder()->hasColumn($table, $col)) continue;
                $colType = DB::getSchemaBuilder()->getColumnType($table, $col);
                if (in_array(strtolower($colType), ['bigint', 'integer', 'smallint'])) continue;
                try {
                    DB::statement("ALTER TABLE {$table} ALTER COLUMN {$col} SET DATA TYPE BIGINT USING (NULLIF({$col}, '')::BIGINT)");
                } catch (\Exception $e) {
                    // If conversion fails because of junk data, drop and re-add column
                    DB::statement("ALTER TABLE {$table} ALTER COLUMN {$col} TYPE BIGINT USING 0");
                }
            }
        }
    }

    public function down(): void {}
};
