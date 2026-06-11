<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop all FKs
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

        // Truncate all dependent tables first
        DB::statement('DROP TABLE IF EXISTS password_resets CASCADE');
        DB::statement('DROP TABLE IF EXISTS driver_profiles CASCADE');
        DB::statement('DROP TABLE IF EXISTS client_profiles CASCADE');
        DB::statement('DROP TABLE IF EXISTS users CASCADE');

        // Recreate users with native BIGSERIAL
        DB::statement("
            CREATE TABLE users (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(255),
                full_name VARCHAR(255),
                username VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                email_verified_at TIMESTAMP NULL,
                password VARCHAR(255) NOT NULL,
                phone_number VARCHAR(255) NULL,
                role VARCHAR(255) NULL,
                profile_picture_url TEXT NULL,
                avatar TEXT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                last_login TIMESTAMP NULL,
                google_id VARCHAR(255) NULL,
                facebook_id VARCHAR(255) NULL,
                remember_token VARCHAR(100) NULL,
                two_factor_secret TEXT NULL,
                two_factor_recovery_codes TEXT NULL,
                two_factor_confirmed_at TIMESTAMP NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL
            )
        ");

        // Recreate client_profiles
        DB::statement("
            CREATE TABLE client_profiles (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL,
                membership_tier VARCHAR(255) DEFAULT 'basic',
                total_rides INTEGER DEFAULT 0,
                average_rating DECIMAL(3,2) DEFAULT 0,
                total_reviews INTEGER DEFAULT 0,
                notification_preferences TEXT NULL,
                dark_mode BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL,
                CONSTRAINT client_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ");

        // Recreate driver_profiles
        DB::statement("
            CREATE TABLE driver_profiles (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL,
                license_number VARCHAR(255) DEFAULT '',
                license_expiry DATE NULL,
                driver_status VARCHAR(255) DEFAULT 'offline',
                verification_status VARCHAR(255) DEFAULT 'pending',
                is_available BOOLEAN DEFAULT FALSE,
                current_latitude DOUBLE PRECISION NULL,
                current_longitude DOUBLE PRECISION NULL,
                last_location_update TIMESTAMP NULL,
                completed_rides INTEGER DEFAULT 0,
                average_rating DECIMAL(3,2) DEFAULT 0,
                total_reviews INTEGER DEFAULT 0,
                total_earnings DECIMAL(12,2) DEFAULT 0,
                date_of_birth DATE NULL,
                gender VARCHAR(50) NULL,
                notification_preferences TEXT NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL,
                CONSTRAINT driver_profiles_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ");

        // Recreate password_resets
        DB::statement("
            CREATE TABLE password_resets (
                id VARCHAR(36) PRIMARY KEY,
                user_id BIGINT NOT NULL,
                token VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used_at TIMESTAMP NULL,
                created_at TIMESTAMP NULL
            )
        ");
    }

    public function down(): void
    {
        // No revert
    }
};
