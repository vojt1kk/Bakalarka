<?php

declare(strict_types=1);

namespace App\Actions\Exercises;

use App\Models\Exercise;
use Illuminate\Support\Facades\DB;

final readonly class DeleteExerciseAction
{
    public function execute(Exercise $exercise): void
    {
        DB::transaction(fn () => $exercise->delete());
    }
}
