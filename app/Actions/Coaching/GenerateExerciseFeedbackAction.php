<?php

declare(strict_types=1);

namespace App\Actions\Coaching;

use App\Data\Coaching\CoachingFeedbackData;
use App\Data\Coaching\PoseInputData;
use App\Http\Integrations\Gemini\GeminiConnector;
use App\Http\Integrations\Gemini\Requests\GenerateContentRequest;
use App\Models\Exercise;
use RuntimeException;

final readonly class GenerateExerciseFeedbackAction
{
    public function __construct(
        private GeminiConnector $connector,
    ) {}

    public function execute(Exercise $exercise, PoseInputData $poseData): CoachingFeedbackData
    {
        $prompt = $this->buildPrompt($exercise, $poseData);

        $request = new GenerateContentRequest(
            model: config('services.gemini.model'),
            contents: [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
        );

        $response = $this->connector->send($request);

        if ($response->failed()) {
            throw new RuntimeException('Gemini API request failed: ' . $response->json('error.message', 'Unknown error'));
        }

        $text = $response->json('candidates.0.content.parts.0.text');

        if ($text === null) {
            throw new RuntimeException('Gemini API returned an unexpected response structure.');
        }

        $text = trim((string) $text);
        $text = preg_replace('/^```(?:json)?\s*|\s*```$/s', '', $text);

        $parsed = json_decode((string) $text, true, 512, JSON_THROW_ON_ERROR);

        return CoachingFeedbackData::fromArray($parsed);
    }

    private function buildPrompt(Exercise $exercise, PoseInputData $poseData): string
    {
        /** @var list<string> $rawMuscleTypes */
        $rawMuscleTypes = $exercise->muscle_types;
        $muscleTypes = implode(', ', $rawMuscleTypes);
        $jointAngles = json_encode($poseData->jointAngles, JSON_THROW_ON_ERROR);
        $deviations = json_encode($poseData->deviations, JSON_THROW_ON_ERROR);

        return <<<PROMPT
            You are a professional fitness coach AI. Analyze the user's exercise form and provide feedback.

            Exercise: {$exercise->name}
            Instructions: {$exercise->instructions}
            Target muscles: {$muscleTypes}

            Current pose data:
            - Joint angles: {$jointAngles}
            - Deviations from ideal: {$deviations}
            - Current phase: {$poseData->currentPhase}
            - Rep count: {$poseData->repCount}

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
