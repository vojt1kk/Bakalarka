<?php

declare(strict_types=1);

use App\Actions\Coaching\GenerateExerciseFeedbackAction;
use App\Data\Coaching\CoachingFeedbackData;
use App\Data\Coaching\PoseInputData;
use App\Http\Integrations\Gemini\GeminiConnector;
use App\Http\Integrations\Gemini\Requests\GenerateContentRequest;
use App\Models\Exercise;
use Saloon\Http\Faking\MockClient;
use Saloon\Http\Faking\MockResponse;

beforeEach(function (): void {
    config([
        'services.gemini.api_key' => 'test-api-key',
        'services.gemini.model' => 'gemini-2.0-flash',
    ]);

    $this->exercise = Exercise::factory()->create([
        'name' => 'Squat',
        'instructions' => 'Stand with feet shoulder-width apart and lower your body.',
        'muscle_types' => ['quadriceps', 'glutes'],
    ]);

    $this->poseData = new PoseInputData(
        jointAngles: ['knee' => 90.0, 'hip' => 85.0],
        deviations: ['knee' => 5.0],
        currentPhase: 'descent',
        repCount: 3,
    );
});

it('sends a request to Gemini and returns coaching feedback', function (): void {
    $feedbackJson = json_encode([
        'overallFeedback' => 'Good form overall, minor knee tracking issue.',
        'jointCorrections' => [
            ['joint' => 'knee', 'correction' => 'Keep knees aligned with toes.'],
        ],
        'encouragement' => 'Great effort! Keep it up!',
    ], JSON_THROW_ON_ERROR);

    $mockClient = new MockClient([
        GenerateContentRequest::class => MockResponse::make([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => $feedbackJson],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $connector = new GeminiConnector;
    $connector->withMockClient($mockClient);

    $action = new GenerateExerciseFeedbackAction($connector);
    $result = $action->execute($this->exercise, $this->poseData);

    expect($result)
        ->toBeInstanceOf(CoachingFeedbackData::class)
        ->overallFeedback->toBe('Good form overall, minor knee tracking issue.')
        ->encouragement->toBe('Great effort! Keep it up!')
        ->jointCorrections->toHaveCount(1);

    expect($result->jointCorrections[0])
        ->joint->toBe('knee')
        ->correction->toBe('Keep knees aligned with toes.');

    $mockClient->assertSent(GenerateContentRequest::class);
});

it('includes exercise details in the prompt sent to Gemini', function (): void {
    $feedbackJson = json_encode([
        'overallFeedback' => 'Looks good.',
        'jointCorrections' => [],
        'encouragement' => 'Nice work!',
    ], JSON_THROW_ON_ERROR);

    $mockClient = new MockClient([
        GenerateContentRequest::class => MockResponse::make([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => $feedbackJson],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $connector = new GeminiConnector;
    $connector->withMockClient($mockClient);

    $action = new GenerateExerciseFeedbackAction($connector);
    $action->execute($this->exercise, $this->poseData);

    $mockClient->assertSent(function (GenerateContentRequest $request): bool {
        $body = $request->body()->all();
        $promptText = $body['contents'][0]['parts'][0]['text'];

        return str_contains($promptText, 'Squat')
            && str_contains($promptText, 'Stand with feet shoulder-width apart')
            && str_contains($promptText, 'quadriceps')
            && str_contains($promptText, '"knee":90');
    });
});
