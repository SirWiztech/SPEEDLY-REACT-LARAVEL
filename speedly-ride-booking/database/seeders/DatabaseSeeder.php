<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('email', 'edgematrix2031@gmail.com')->exists()) {
            User::create([
                'full_name' => 'Super Admin',
                'username' => 'edgematrix',
                'email' => 'edgematrix2031@gmail.com',
                'password' => '09876500aA#',
                'role' => 'admin',
                'is_verified' => true,
                'is_active' => true,
            ]);
        }
    }
}
