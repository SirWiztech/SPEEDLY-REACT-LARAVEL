<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        if (!DB::table('users')->where('email', 'edgematrix2031@gmail.com')->exists()) {
            DB::table('users')->insert([
                'full_name' => 'Super Admin',
                'username' => 'edgematrix',
                'email' => 'edgematrix2031@gmail.com',
                'password' => Hash::make('09876500aA#'),
                'role' => 'admin',
                'is_verified' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('users')->where('email', 'edgematrix2031@gmail.com')->delete();
    }
};
