<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop ALL foreign keys referencing tables we're about to modify
        $fks = [
            // user_id FKs
            'client_profiles_user_id_foreign'            => 'client_profiles',
            'driver_profiles_user_id_foreign'             => 'driver_profiles',
            'password_resets_user_id_foreign'             => 'password_resets',
            'support_tickets_user_id_foreign'             => 'support_tickets',
            'wallet_transactions_user_id_foreign'         => 'wallet_transactions',
            'payment_gateway_transactions_user_id_foreign'=> 'payment_gateway_transactions',
            'payment_sessions_user_id_foreign'            => 'payment_sessions',
            // These point to client_profiles.id / driver_profiles.id
            'rides_client_id_foreign'                     => 'rides',
            'rides_driver_id_foreign'                     => 'rides',
            'driver_vehicles_driver_id_foreign'           => 'driver_vehicles',
            'driver_kyc_documents_driver_id_foreign'      => 'driver_kyc_documents',
            'driver_approval_queue_driver_id_foreign'     => 'driver_approval_queue',
            'driver_withdrawals_driver_id_foreign'        => 'driver_withdrawals',
            'driver_bank_details_driver_id_foreign'       => 'driver_bank_details',
            'driver_ratings_driver_id_foreign'            => 'driver_ratings',
            'client_ratings_client_id_foreign'            => 'client_ratings',
            'ride_declines_driver_id_foreign'             => 'ride_declines',
            'ride_declines_ride_id_foreign'               => 'ride_declines',
            'ride_cancellations_ride_id_foreign'          => 'ride_cancellations',
            'chats_ride_id_foreign'                       => 'chats',
            'wallet_transactions_ride_id_foreign'         => 'wallet_transactions',
        ];

        foreach ($fks as $fkName => $table) {
            DB::statement("ALTER TABLE {$table} DROP CONSTRAINT IF EXISTS {$fkName}");
        }

        // Widen user_id columns to 36 chars
        Schema::table('client_profiles', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        Schema::table('driver_profiles',  fn (Blueprint $t) => $t->string('user_id', 36)->change());

        if (Schema::hasTable('password_resets')) {
            Schema::table('password_resets', function (Blueprint $t) {
                if (!Schema::hasColumn('password_resets', 'used_at')) {
                    $t->timestamp('used_at')->nullable()->after('expires_at');
                }
                $t->string('user_id', 36)->change();
            });
        }

        if (Schema::hasTable('support_tickets') && Schema::hasColumn('support_tickets', 'user_id')) {
            Schema::table('support_tickets', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        }
        if (Schema::hasTable('wallet_transactions') && Schema::hasColumn('wallet_transactions', 'user_id')) {
            Schema::table('wallet_transactions', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        }
        if (Schema::hasTable('payment_gateway_transactions') && Schema::hasColumn('payment_gateway_transactions', 'user_id')) {
            Schema::table('payment_gateway_transactions', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        }
        if (Schema::hasTable('payment_sessions') && Schema::hasColumn('payment_sessions', 'user_id')) {
            Schema::table('payment_sessions', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        }

        // Widen profile ID columns to fit UUIDs (36 chars)
        Schema::table('client_profiles', fn (Blueprint $t) => $t->string('id', 36)->change());
        Schema::table('driver_profiles',  fn (Blueprint $t) => $t->string('id', 36)->change());

        // Change users.id from bigint to string
        Schema::table('users', function (Blueprint $table) {
            $table->string('id', 36)->change();
            $table->string('name')->nullable()->change();
            $table->string('email')->change();
            $table->string('password')->change();
        });

        // Fix notification user_id
        if (Schema::hasTable('notifications') && Schema::hasColumn('notifications', 'user_id')) {
            Schema::table('notifications', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        }

        // Re-create essential FKs
        Schema::table('client_profiles', fn (Blueprint $t) => $t->foreign('user_id')->references('id')->on('users')->onDelete('cascade'));
        Schema::table('driver_profiles',  fn (Blueprint $t) => $t->foreign('user_id')->references('id')->on('users')->onDelete('cascade'));
    }

    public function down(): void
    {
        // No revert — one-way fix
    }
};
