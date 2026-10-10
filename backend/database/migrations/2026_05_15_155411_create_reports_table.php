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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('start_page');
            $table->unsignedSmallInteger('quantity');
            $table->date('report_date');
            $table->timestamps();

             $table->foreignId('student_level_id')->constrained('student_levels')->onDelete('cascade');
              $table->foreignId('student_supervisor_id')->constrained('student_supervisors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
