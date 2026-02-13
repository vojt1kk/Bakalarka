<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Exercises\CreateExerciseAction;
use App\Actions\Exercises\DeleteExerciseAction;
use App\Actions\Exercises\UpdateExerciseAction;
use App\Concerns\Http\Controllers\IsJsonResponse;
use App\Http\Requests\Api\ExerciseRequest;
use App\Http\Resources\Api\ExerciseResource;
use App\Models\Exercise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final readonly class ExerciseController
{
    use IsJsonResponse;

    public function index(): AnonymousResourceCollection
    {
        $exercises = Exercise::query()->paginate();

        return ExerciseResource::collection($exercises);
    }

    public function show(Exercise $exercise): ExerciseResource
    {
        return ExerciseResource::make($exercise);
    }

    public function store(ExerciseRequest $request, CreateExerciseAction $createExerciseAction): ExerciseResource
    {
        return ExerciseResource::make(
            $createExerciseAction->execute($request->toInputData())
        );
    }

    public function update(
        Exercise $exercise,
        ExerciseRequest $request,
        UpdateExerciseAction $updateExerciseAction,
    ): ExerciseResource {
        return ExerciseResource::make(
            $updateExerciseAction->execute($exercise, $request->toInputData())
        );
    }

    public function destroy(Exercise $exercise, DeleteExerciseAction $deleteExerciseAction): JsonResponse
    {
        $deleteExerciseAction->execute($exercise);

        return $this->noContent();
    }
}
