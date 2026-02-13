<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ExerciseController;
use Illuminate\Support\Facades\Route;

Route::apiResource('exercises', ExerciseController::class);
