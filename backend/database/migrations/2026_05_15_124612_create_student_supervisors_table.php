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
        Schema::create('student_supervisors', function (Blueprint $table) {
            $table->id();
            $table->date('assigned_at');
            $table->date('retired_at')->nullable();;
            $table->timestamps();

    $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
    $table->foreignId('supervisor_id')->constrained('supervisors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_supervisors');
    }
};
