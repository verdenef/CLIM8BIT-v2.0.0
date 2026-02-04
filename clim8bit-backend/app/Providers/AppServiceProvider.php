<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Required for MySQL (e.g. FreeSQL) with utf8mb4: index key limit is 767 bytes.
        // 191 chars × 4 bytes = 764 bytes, so unique indexes on string columns fit.
        Schema::defaultStringLength(191);
    }
}
