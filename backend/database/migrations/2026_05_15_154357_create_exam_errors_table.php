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
        Schema::create('exam_errors', function (Blueprint $table) {
            $table->id();
            $table->Text('details');
            $table->string('error_word');
            $table->timestamps();

        $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
        $table->foreignId('error_id')->constrained('errors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_errors');
    }
};
