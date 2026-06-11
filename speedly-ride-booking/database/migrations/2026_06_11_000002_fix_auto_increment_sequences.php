<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Fix users.id auto-increment sequence
        DB::statement('ALTER TABLE users ALTER COLUMN id DROP DEFAULT');
        DB::statement('DROP SEQUENCE IF EXISTS users_id_seq CASCADE');
        DB::statement('CREATE SEQUENCE users_id_seq OWNED BY users.id');
        DB::statement('SELECT setval(\'users_id_seq\', COALESCE((SELECT MAX(id) FROM users), 1))');
        DB::statement('ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval(\'users_id_seq\')');

        // Fix client_profiles.id auto-increment
        DB::statement('ALTER TABLE client_profiles ALTER COLUMN id DROP DEFAULT');
        DB::statement('DROP SEQUENCE IF EXISTS client_profiles_id_seq CASCADE');
        DB::statement('CREATE SEQUENCE client_profiles_id_seq OWNED BY client_profiles.id');
        DB::statement('SELECT setval(\'client_profiles_id_seq\', COALESCE((SELECT MAX(id) FROM client_profiles), 1))');
        DB::statement('ALTER TABLE client_profiles ALTER COLUMN id SET DEFAULT nextval(\'client_profiles_id_seq\')');

        // Fix driver_profiles.id auto-increment
        DB::statement('ALTER TABLE driver_profiles ALTER COLUMN id DROP DEFAULT');
        DB::statement('DROP SEQUENCE IF EXISTS driver_profiles_id_seq CASCADE');
        DB::statement('CREATE SEQUENCE driver_profiles_id_seq OWNED BY driver_profiles.id');
        DB::statement('SELECT setval(\'driver_profiles_id_seq\', COALESCE((SELECT MAX(id) FROM driver_profiles), 1))');
        DB::statement('ALTER TABLE driver_profiles ALTER COLUMN id SET DEFAULT nextval(\'driver_profiles_id_seq\')');
    }

    public function down(): void
    {
        // No revert
    }
};
