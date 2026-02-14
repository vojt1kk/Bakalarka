<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Coaching\GenerateExerciseFeedbackAction;
use App\Http\Requests\Api\ExerciseFeedbackRequest;
use App\Http\Resources\Api\CoachingFeedbackResource;
use App\Models\Exercise;

final readonly class ExerciseFeedbackController
{
    public function __invoke(
        ExerciseFeedbackRequest $request,
        Exercise $exercise,
        GenerateExerciseFeedbackAction $generateExerciseFeedbackAction,
    ): CoachingFeedbackResource {
        $poseData = $request->toInputData();

        $feedback = $generateExerciseFeedbackAction->execute($exercise, $poseData);

        return CoachingFeedbackResource::make($feedback);
    }
}
