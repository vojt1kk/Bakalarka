<?php

declare(strict_types=1);

namespace App\Actions\Exercises;

use App\Data\Exercises\ExerciseInputData;
use App\Models\Exercise;
use Illuminate\Support\Facades\DB;

final readonly class UpdateExerciseAction
{
    public function execute(Exercise $exercise, ExerciseInputData $inputData): Exercise
    {
        return DB::transaction(function () use ($exercise, $inputData): Exercise {
            $exercise->update($inputData->getAttributes());

            return $exercise;
        });
    }
}
