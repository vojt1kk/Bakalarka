<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Coaching\GenerateRepFeedbackAction;
use App\Http\Requests\Api\RepFeedbackRequest;
use App\Http\Resources\Api\RepFeedbackResource;
use App\Models\Exercise;
use Illuminate\Validation\ValidationException;

final readonly class RepFeedbackController
{
    public function __invoke(
        RepFeedbackRequest $request,
        Exercise $exercise,
        GenerateRepFeedbackAction $generateRepFeedbackAction,
    ): RepFeedbackResource {
        $exerciseKey = str_replace(' ', '_', mb_strtolower($exercise->name));
        $reference = config("exercise-reference-angles.{$exerciseKey}");

        if (! is_array($reference) || ! isset($reference['tempo'])) {
            throw ValidationException::withMessages([
                'exercise' => 'Tento cvik nepodporuje zpětnou vazbu po opakování.',
            ]);
        }

        $feedback = $generateRepFeedbackAction->execute($exercise, $reference, $request->toRepSummary());

        return RepFeedbackResource::make($feedback);
    }
}
