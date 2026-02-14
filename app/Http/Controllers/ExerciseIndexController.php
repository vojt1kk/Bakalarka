<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Exercise;
use Inertia\Inertia;
use Inertia\Response;

final class ExerciseIndexController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('exercises/index', [
            'exercises' => Exercise::query()
                ->select([
                    Exercise::ATTR_ID,
                    Exercise::ATTR_NAME,
                    Exercise::ATTR_DESCRIPTION,
                    Exercise::ATTR_PPL_TYPE,
                    Exercise::ATTR_UL_TYPE,
                    Exercise::ATTR_MUSCLE_TYPES,
                    Exercise::ATTR_INSTRUCTIONS,
                ])
                ->get(),
        ]);
    }
}
