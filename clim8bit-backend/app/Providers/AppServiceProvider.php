<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
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

        // In proxy environments like Vercel, force HTTPS-generated URLs
        // so asset() / vite() links use https:// and avoid Mixed Content.
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
