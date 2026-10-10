<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('volunteer_forms') && Schema::hasColumn('volunteer_forms', 'user_id')) {
            Schema::table('volunteer_forms', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });

            Schema::table('volunteer_forms', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            });
        }

        if (Schema::hasTable('suggestions') && ! Schema::hasColumn('suggestions', 'phone')) {
            Schema::table('suggestions', function (Blueprint $table) {
                $table->string('phone', 30)->nullable()->after('email');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('suggestions') && Schema::hasColumn('suggestions', 'phone')) {
            Schema::table('suggestions', function (Blueprint $table) {
                $table->dropColumn('phone');
            });
        }

        if (Schema::hasTable('volunteer_forms') && Schema::hasColumn('volunteer_forms', 'user_id')) {
            Schema::table('volunteer_forms', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            });
        }
    }
};
