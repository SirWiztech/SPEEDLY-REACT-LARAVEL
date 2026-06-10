<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_user_id_foreign');
        DB::statement('ALTER TABLE driver_profiles DROP CONSTRAINT IF EXISTS driver_profiles_user_id_foreign');
        DB::statement('ALTER TABLE password_resets DROP CONSTRAINT IF EXISTS password_resets_user_id_foreign');
        DB::statement('ALTER TABLE support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_foreign');
        DB::statement('ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_user_id_foreign');
        DB::statement('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_foreign');
        DB::statement('ALTER TABLE payment_gateway_transactions DROP CONSTRAINT IF EXISTS payment_gateway_transactions_user_id_foreign');
        DB::statement('ALTER TABLE payment_sessions DROP CONSTRAINT IF EXISTS payment_sessions_user_id_foreign');

        Schema::table('client_profiles', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        Schema::table('driver_profiles',  fn (Blueprint $t) => $t->string('user_id', 36)->change());

        // Widen profile ID columns to fit UUIDs (36 chars)
        Schema::table('client_profiles', fn (Blueprint $t) => $t->string('id', 36)->change());
        Schema::table('driver_profiles',  fn (Blueprint $t) => $t->string('id', 36)->change());

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

        if (Schema::hasTable('notifications') && Schema::hasColumn('notifications', 'user_id')) {
            Schema::table('notifications', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        }

        if (Schema::hasTable('payment_gateway_transactions') && Schema::hasColumn('payment_gateway_transactions', 'user_id')) {
            Schema::table('payment_gateway_transactions', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        }

        if (Schema::hasTable('payment_sessions') && Schema::hasColumn('payment_sessions', 'user_id')) {
            Schema::table('payment_sessions', fn (Blueprint $t) => $t->string('user_id', 36)->change());
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('id', 36)->change();
            $table->string('name')->nullable()->change();
            $table->string('email')->change();
            $table->string('password')->change();
        });

        Schema::table('client_profiles', fn (Blueprint $t) => $t->foreign('user_id')->references('id')->on('users')->onDelete('cascade'));
        Schema::table('driver_profiles',  fn (Blueprint $t) => $t->foreign('user_id')->references('id')->on('users')->onDelete('cascade'));

        if (Schema::hasTable('password_resets')) {
            Schema::table('password_resets', fn (Blueprint $t) => $t->foreign('user_id')->references('id')->on('users')->onDelete('cascade'));
        }
    }

    public function down(): void
    {
        // No revert — this is a one-way fix for PostgreSQL
    }
};
