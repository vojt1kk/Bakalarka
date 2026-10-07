<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\RepFeedbackController;
use App\Http\Controllers\Api\RepFeedbackHealthController;
use Illuminate\Support\Facades\Route;

Route::apiResource('exercises', ExerciseController::class);

Route::post('exercises/{exercise}/rep-feedback', RepFeedbackController::class)
    ->middleware('throttle:rep-feedback')
    ->name('exercises.rep-feedback');

Route::get('exercises/{exercise}/rep-feedback/health', RepFeedbackHealthController::class)
    ->name('exercises.rep-feedback.health');
