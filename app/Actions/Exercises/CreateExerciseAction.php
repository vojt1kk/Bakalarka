<?php

declare(strict_types=1);

namespace App\Actions\Exercises;

use App\Data\Exercises\ExerciseInputData;
use App\Models\Exercise;
use Illuminate\Support\Facades\DB;

final readonly class CreateExerciseAction
{
    public function execute(ExerciseInputData $inputData): Exercise
    {
        return DB::transaction(fn (): Exercise => Exercise::query()->create($inputData->getAttributes()));
    }
}
