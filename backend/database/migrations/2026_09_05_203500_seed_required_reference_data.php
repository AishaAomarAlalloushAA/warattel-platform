<?php

use App\Enums\ErrorType;
use App\Enums\LevelType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
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

    public function down(): void
    {
        // Reference rows are intentionally preserved on rollback to avoid deleting
        // records that may already be used by students, reports, or exams.
    }
};
