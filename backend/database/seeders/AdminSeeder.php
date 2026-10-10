<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Person;
use App\Enums\UserRole;


class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // إنشاء حساب المدير
        $user = User::create([
            'email' => 'engineerheba49@gmail.com',
            'password' => Hash::make(env('ADMIN_PASSWORD')),
            'role' => UserRole::Admin,
        ]);

        // إنشاء الشخص المرتبط بالمدير
        Person::create([
            'user_id' => $user->id,
            'fname' => 'مديرة',
            'lname' => 'ورتّل',
            'gender' => 'fmale',
            'year_of_study' => null,
            'contact_number' => '0964757641',
            'join_date' => now(),
            'address' => 'حلب',
        ]);
    }
}
