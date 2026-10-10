<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->unsignedTinyInteger('score')->nullable()->after('exam_date');
            $table->string('result', 30)->nullable()->after('score');
        });

        Schema::table('suggestions', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('email');
        });

        Schema::create('level_exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_level_id')->constrained('student_levels')->cascadeOnDelete();
            $table->foreignId('target_level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->foreignId('supervisor_id')->constrained('supervisors')->cascadeOnDelete();
            $table->date('exam_date');
            $table->unsignedTinyInteger('makharij_score')->nullable();
            $table->unsignedTinyInteger('ahkam_score')->nullable();
            $table->unsignedTinyInteger('fluency_score')->nullable();
            $table->text('notes')->nullable();
            $table->string('decision', 50)->nullable();
            $table->timestamps();

            $table->index(['student_level_id', 'exam_date']);
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('type', 30)->default('other');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('achieved_at');
            $table->timestamps();

            $table->index(['student_id', 'achieved_at']);
        });

        Schema::create('educational_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->string('title');
            $table->text('url');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('lectures', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('display_date')->nullable();
            $table->string('type', 30)->default('video');
            $table->text('url')->nullable();
            $table->text('thumbnail')->nullable();
            $table->string('registration_status', 40)->default('closed');
            $table->string('category', 80)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lectures');
        Schema::dropIfExists('educational_links');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('level_exams');

        Schema::table('suggestions', function (Blueprint $table) {
            $table->dropColumn('phone');
        });

        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['score', 'result']);
        });
    }
};
