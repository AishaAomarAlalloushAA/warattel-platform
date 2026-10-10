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
        Schema::create('supervisors', function (Blueprint $table) {
            $table->id();
            $table->date('became_supervisor_at');
            $table->date('retired_at')->nullable();
            $table->timestamps();
            $table->string('role')->default('musami');//('مسمع','مساعد', 'مشرف');
        $table->foreignId('person_id')->unique()->constrained('persons')->onDelete('cascade');
        $table->foreignId('aider_id')->nullable()->
        constrained('supervisors')->onDelete('set null');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervisors');
    }
};
