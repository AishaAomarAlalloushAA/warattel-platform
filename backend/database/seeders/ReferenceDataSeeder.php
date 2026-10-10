<?php

namespace Database\Seeders;

use App\Enums\ErrorType;
use App\Enums\LevelType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReferenceDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        foreach (LevelType::cases() as $levelType) {
            if (!DB::table('levels')->where('name', $levelType->value)->exists()) {
                DB::table('levels')->insert([
                    'name' => $levelType->value,
                    'description' => $levelType->label(),
                    'plan' => '',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        foreach (ErrorType::cases() as $errorType) {
            if (!DB::table('errors')->where('error_type', $errorType->value)->exists()) {
                DB::table('errors')->insert([
                    'error_type' => $errorType->value,
                    'score' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }
}
