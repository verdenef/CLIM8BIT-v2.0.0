<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weather_cache', function (Blueprint $table) {
            $table->id();
            $table->string('city');
            $table->string('country');
            $table->json('weather_data');
            $table->json('forecast_data')->nullable();
            $table->timestamp('cached_at');
            $table->timestamps();

            $table->unique(['city', 'country']);
            $table->index('cached_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weather_cache');
    }
};
