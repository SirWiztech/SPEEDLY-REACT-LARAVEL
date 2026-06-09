<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->integer('geoname_id')->nullable();
            $table->string('name', 255);
            $table->string('ascii_name', 255)->nullable();
            $table->text('alternate_names')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->char('feature_class', 1)->nullable();
            $table->string('feature_code', 10)->nullable();
            $table->string('state_code', 10)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('lga', 150)->nullable();
            $table->integer('population')->default(0);
            $table->string('full_address', 500)->nullable();

            $table->index('name');
            $table->index('state');
            $table->index('feature_code');
        });

        // Enable pg_trgm extension for text search
        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_places_name_trgm ON places USING gin (name gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_places_address_trgm ON places USING gin (full_address gin_trgm_ops)');
    }

    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
