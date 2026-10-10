<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('student_levels', function (Blueprint $table) {
            $table->id();
            $table->date('reached_at');

            $table->timestamps();

      $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
      $table->foreignId('level_id')->constrained('levels')->onDelete('cascade');


        });
    }


    public function down(): void
    {
        Schema::dropIfExists('student_levels');
    }
};

