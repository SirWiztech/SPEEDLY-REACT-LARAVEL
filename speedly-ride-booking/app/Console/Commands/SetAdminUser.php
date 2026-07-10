<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SetAdminUser extends Command
{
    protected $signature = 'admin:set {email}';
    protected $description = 'Set a user as admin by email';

    public function handle(): int
    {
        $email = $this->argument('email');
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'full_name' => 'Admin',
                'username' => 'admin_' . rand(100, 999),
                'password' => bcrypt('09876500aA#'),
                'role' => 'admin',
                'is_active' => true,
                'is_verified' => true,
            ]
        );

        $user->role = 'admin';
        $user->is_active = true;
        $user->is_verified = true;
        $user->save();

        $this->info("User {$user->full_name} ({$email}) is now an admin.");
        return 0;
    }
}
