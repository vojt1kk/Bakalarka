<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\ExerciseFeedbackController;
use Illuminate\Support\Facades\Route;

Route::apiResource('exercises', ExerciseController::class);

Route::post('exercises/{exercise}/feedback', ExerciseFeedbackController::class)
    ->name('exercises.feedback');
