<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WeatherController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\RecentSearchController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| These routes are for AJAX calls from the React frontend
| All routes are prefixed with /api/
*/

// Public weather routes (no auth required)
Route::get('/weather', [WeatherController::class, 'getWeather']);
Route::get('/forecast', [WeatherController::class, 'getForecast']);

// Protected routes (require authentication)
Route::middleware('auth')->group(function () {
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::put('/favorites/{id}', [FavoriteController::class, 'update']);
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);

    Route::get('/recent-searches', [RecentSearchController::class, 'index']);
    Route::post('/recent-searches', [RecentSearchController::class, 'store']);
    Route::delete('/recent-searches', [RecentSearchController::class, 'clear']);
});


