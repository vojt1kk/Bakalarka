<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Exercise;
use Inertia\Inertia;
use Inertia\Response;

final class ExerciseShowController extends Controller
{
    public function __invoke(Exercise $exercise): Response
    {
        $exerciseKey = str_replace(' ', '_', mb_strtolower($exercise->name));
        $referenceAngles = config("exercise-reference-angles.{$exerciseKey}", [
            'phases' => [],
        ]);

        return Inertia::render('exercises/show', [
            'exercise' => [
                'id' => $exercise->id,
                'name' => $exercise->name,
                'description' => $exercise->description,
                'instructions' => $exercise->instructions,
                'video_path' => $exercise->video_path,
                'ppl_type' => $exercise->ppl_type,
                'ul_type' => $exercise->ul_type,
                'muscle_types' => $exercise->muscle_types,
            ],
            'referenceAngles' => $referenceAngles,
        ]);
    }
}
