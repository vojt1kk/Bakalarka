<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Exercise;
use Inertia\Inertia;
use Inertia\Response;

final class ExerciseCoachController extends Controller
{
    public function __invoke(Exercise $exercise): Response
    {
        $exerciseKey = str_replace(' ', '_', mb_strtolower($exercise->name));
        $referenceAngles = config("exercise-reference-angles.{$exerciseKey}", [
            'phases' => [],
        ]);

        return Inertia::render('exercises/coach', [
            'exercise' => [
                'id' => $exercise->id,
                'name' => $exercise->name,
                'instructions' => $exercise->instructions,
            ],
            'referenceAngles' => $referenceAngles,
        ]);
    }
}
