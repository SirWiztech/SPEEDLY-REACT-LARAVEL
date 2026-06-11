<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop all FKs first
        $fks = [
            'client_profiles'     => ['client_profiles_user_id_foreign'],
            'driver_profiles'     => ['driver_profiles_user_id_foreign'],
            'password_resets'     => ['password_resets_user_id_foreign'],
            'support_tickets'     => ['support_tickets_user_id_foreign'],
            'wallet_transactions' => ['wallet_transactions_user_id_foreign', 'wallet_transactions_ride_id_foreign'],
            'payment_gateway_transactions' => ['payment_gateway_transactions_user_id_foreign'],
            'payment_sessions'    => ['payment_sessions_user_id_foreign'],
            'rides'               => ['rides_client_id_foreign', 'rides_driver_id_foreign'],
            'driver_vehicles'     => ['driver_vehicles_driver_id_foreign'],
            'driver_kyc_documents'=> ['driver_kyc_documents_driver_id_foreign'],
            'driver_approval_queue'=> ['driver_approval_queue_driver_id_foreign'],
            'driver_withdrawals'  => ['driver_withdrawals_driver_id_foreign'],
            'driver_bank_details' => ['driver_bank_details_driver_id_foreign'],
            'driver_ratings'      => ['driver_ratings_driver_id_foreign'],
            'client_ratings'      => ['client_ratings_client_id_foreign'],
            'ride_declines'       => ['ride_declines_driver_id_foreign', 'ride_declines_ride_id_foreign'],
            'ride_cancellations'  => ['ride_cancellations_ride_id_foreign'],
            'chats'               => ['chats_ride_id_foreign'],
        ];

        foreach ($fks as $table => $constraints) {
            foreach ($constraints as $constraint) {
                DB::statement("ALTER TABLE {$table} DROP CONSTRAINT IF EXISTS {$constraint}");
            }
        }

        // Wipe junk data from partial prior inserts
        DB::table('password_resets')->delete();
        DB::table('driver_profiles')->delete();
        DB::table('client_profiles')->delete();
        DB::table('users')->delete();

        // Convert users.id from VARCHAR back to BIGINT auto-increment
        DB::statement('ALTER TABLE users ALTER COLUMN id DROP DEFAULT');
        DB::statement('DROP SEQUENCE IF EXISTS users_id_seq CASCADE');
        DB::statement("ALTER TABLE users ALTER COLUMN id SET DATA TYPE BIGINT USING (COALESCE(NULLIF(id, '')::BIGINT, 0))");
        DB::statement('CREATE SEQUENCE users_id_seq OWNED BY users.id');
        DB::statement("SELECT setval('users_id_seq', 1)");
        DB::statement("ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq')");

        // Convert client_profiles.id from VARCHAR to BIGINT auto-increment
        DB::statement('ALTER TABLE client_profiles ALTER COLUMN id DROP DEFAULT');
        DB::statement('DROP SEQUENCE IF EXISTS client_profiles_id_seq CASCADE');
        DB::statement("ALTER TABLE client_profiles ALTER COLUMN id SET DATA TYPE BIGINT USING (COALESCE(NULLIF(id, '')::BIGINT, 0))");
        DB::statement('CREATE SEQUENCE client_profiles_id_seq OWNED BY client_profiles.id');
        DB::statement("SELECT setval('client_profiles_id_seq', 1)");
        DB::statement("ALTER TABLE client_profiles ALTER COLUMN id SET DEFAULT nextval('client_profiles_id_seq')");

        // Convert driver_profiles.id from VARCHAR to BIGINT auto-increment
        DB::statement('ALTER TABLE driver_profiles ALTER COLUMN id DROP DEFAULT');
        DB::statement('DROP SEQUENCE IF EXISTS driver_profiles_id_seq CASCADE');
        DB::statement("ALTER TABLE driver_profiles ALTER COLUMN id SET DATA TYPE BIGINT USING (COALESCE(NULLIF(id, '')::BIGINT, 0))");
        DB::statement('CREATE SEQUENCE driver_profiles_id_seq OWNED BY driver_profiles.id');
        DB::statement("SELECT setval('driver_profiles_id_seq', 1)");
        DB::statement("ALTER TABLE driver_profiles ALTER COLUMN id SET DEFAULT nextval('driver_profiles_id_seq')");

        // Re-create essential FKs
        DB::statement('ALTER TABLE client_profiles ADD CONSTRAINT client_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE driver_profiles ADD CONSTRAINT driver_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
    }

    public function down(): void
    {
        // No revert
    }
};
