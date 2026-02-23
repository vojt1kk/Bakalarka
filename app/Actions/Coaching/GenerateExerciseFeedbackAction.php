<?php

declare(strict_types=1);

namespace App\Actions\Coaching;

use App\Data\Coaching\CoachingFeedbackData;
use App\Data\Coaching\PoseInputData;
use App\Models\Exercise;
use App\Prompts\ExerciseFeedbackPrompt;
use App\Services\Gemini\GeminiService;

final readonly class GenerateExerciseFeedbackAction
{
    public function __construct(
        private GeminiService $geminiService,
    ) {}

    public function execute(Exercise $exercise, PoseInputData $poseData): CoachingFeedbackData
    {
        return $this->geminiService->generateFeedback(
            new ExerciseFeedbackPrompt($exercise, $poseData)
        );
    }
}
