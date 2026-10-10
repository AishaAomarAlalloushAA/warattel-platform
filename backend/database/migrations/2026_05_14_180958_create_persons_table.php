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
        Schema::create('persons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('fname');
            $table->string('lname');
            $table->string('gender')->default('male');
            $table->integer('year_of_study')->nullable();;//خيارات السنة
            $table->string('contact_number',20)->unique();
            $table->text('achievements')->nullable();;
            $table->date('join_date');
            $table->string('address')->nullable();
            $table->unsignedInteger('serial_number')->nullable();
            $table->timestamps();


        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('persons');
    }
};
