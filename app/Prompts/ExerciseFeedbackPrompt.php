<?php

declare(strict_types=1);

namespace App\Prompts;

use App\Data\Coaching\PoseInputData;
use App\Models\Exercise;
use Stringable;

final readonly class ExerciseFeedbackPrompt implements Stringable
{
    public function __construct(
        private Exercise $exercise,
        private PoseInputData $poseData,
    ) {}

    public function __toString(): string
    {
        /** @var list<string> $rawMuscleTypes */
        $rawMuscleTypes = $this->exercise->muscle_types;
        $muscleTypes = implode(', ', $rawMuscleTypes);
        $jointAngles = json_encode($this->poseData->jointAngles, JSON_THROW_ON_ERROR);
        $deviations = json_encode($this->poseData->deviations, JSON_THROW_ON_ERROR);

        return <<<PROMPT
            You are a professional fitness coach AI. Analyze the user's exercise form and provide feedback.

            Exercise: {$this->exercise->name}
            Instructions: {$this->exercise->instructions}
            Target muscles: {$muscleTypes}

            Current pose data:
            - Joint angles: {$jointAngles}
            - Deviations from ideal: {$deviations}
            - Current phase: {$this->poseData->currentPhase}
            - Rep count: {$this->poseData->repCount}

            Respond ONLY with a JSON object in this exact format (no markdown, no code fences):
            {
                "overallFeedback": "A brief summary of the user's form",
                "jointCorrections": [
                    {"joint": "joint name", "correction": "what to fix"}
                ],
                "encouragement": "A motivational message"
            }
            PROMPT;
    }
}
