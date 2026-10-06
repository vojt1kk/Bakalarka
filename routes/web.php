<?php

declare(strict_types=1);

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => auth()->check()
    ? redirect()->route('exercises')
    : redirect()->route('login'))->name('home');

Route::get('exercises', App\Http\Controllers\ExerciseIndexController::class)
    ->middleware(['auth', 'verified'])
    ->name('exercises');

Route::get('exercises/{exercise}', App\Http\Controllers\ExerciseShowController::class)
    ->middleware(['auth', 'verified'])
    ->name('exercises.detail');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::put('profile/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');
});
