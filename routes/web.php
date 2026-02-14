<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', fn () => Inertia::render('welcome', [
    'canRegister' => Features::enabled(Features::registration()),
]))->name('home');

Route::get('dashboard', fn () => Inertia::render('dashboard', [
    'exerciseCount' => App\Models\Exercise::query()->count(),
]))->middleware(['auth', 'verified'])->name('dashboard');

Route::get('exercises', App\Http\Controllers\ExerciseIndexController::class)
    ->middleware(['auth', 'verified'])
    ->name('exercises');

Route::get('exercises/{exercise}/coach', App\Http\Controllers\ExerciseCoachController::class)
    ->middleware(['auth', 'verified'])
    ->name('exercises.coach');

require __DIR__ . '/settings.php';
