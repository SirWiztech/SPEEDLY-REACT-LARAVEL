<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Convert client_profiles.id from varchar(32) to auto-increment
        DB::statement('ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_pkey CASCADE');
        DB::statement('ALTER TABLE client_profiles ALTER COLUMN id TYPE BIGINT USING NULL');
        DB::statement('CREATE SEQUENCE IF NOT EXISTS client_profiles_id_seq OWNED BY client_profiles.id');
        DB::statement("ALTER TABLE client_profiles ALTER COLUMN id SET DEFAULT nextval('client_profiles_id_seq')");
        DB::statement('ALTER TABLE client_profiles ADD PRIMARY KEY (id)');

        // Convert driver_profiles.id from varchar(32) to auto-increment
        DB::statement('ALTER TABLE driver_profiles DROP CONSTRAINT IF EXISTS driver_profiles_pkey CASCADE');
        DB::statement('ALTER TABLE driver_profiles ALTER COLUMN id TYPE BIGINT USING NULL');
        DB::statement('CREATE SEQUENCE IF NOT EXISTS driver_profiles_id_seq OWNED BY driver_profiles.id');
        DB::statement("ALTER TABLE driver_profiles ALTER COLUMN id SET DEFAULT nextval('driver_profiles_id_seq')");
        DB::statement('ALTER TABLE driver_profiles ADD PRIMARY KEY (id)');
    }

    public function down(): void
    {
        // No revert
    }
};
