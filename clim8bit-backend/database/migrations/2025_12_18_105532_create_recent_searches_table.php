<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recent_searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('city');
            $table->string('country');
            $table->timestamp('searched_at');
            $table->timestamps();

            $table->index(['user_id', 'searched_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recent_searches');
    }
};
