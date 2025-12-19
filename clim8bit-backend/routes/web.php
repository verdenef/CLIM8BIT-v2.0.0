<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserPreferenceController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Weather/Index');
})->name('home');

// Public authentication routes
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');

// Protected routes (require authentication)
Route::middleware('auth')->group(function () {
    // Logout (must be authenticated to logout)
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    
    // User preferences
    Route::put('/user/preferences', [UserPreferenceController::class, 'update'])->name('user.preferences.update');
    
    // Profile management
    Route::put('/user/email', [ProfileController::class, 'updateEmail'])->name('user.email.update');
    Route::put('/user/username', [ProfileController::class, 'updateUsername'])->name('user.username.update');
    Route::put('/user/password', [ProfileController::class, 'changePassword'])->name('user.password.change');
    Route::delete('/user', [ProfileController::class, 'destroy'])->name('user.delete');
});
