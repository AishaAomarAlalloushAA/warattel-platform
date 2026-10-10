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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('gender')->default('all');
            $table->date('activity_date');
            $table->timestamps();


        $table->foreignId('activity_type_id')->constrained('activity_types')->restrictOnDelete();
        $table->foreignId('coordinator_id')->nullable()->constrained('supervisors')->nullOnDelete();
        $table->foreignId('presenter_id')->nullable()->constrained('supervisors')->nullOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
