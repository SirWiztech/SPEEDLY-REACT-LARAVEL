<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('driver_vehicles', function (Blueprint $table) {
            $table->string('vehicle_image_url')->nullable()->after('vehicle_year');
        });
    }

    public function down(): void
    {
        Schema::table('driver_vehicles', function (Blueprint $table) {
            $table->dropColumn('vehicle_image_url');
        });
    }
};
