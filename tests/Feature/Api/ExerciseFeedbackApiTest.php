<?php

declare(strict_types=1);

use App\Http\Integrations\Gemini\GeminiConnector;
use App\Http\Integrations\Gemini\Requests\GenerateContentRequest;
use App\Models\Exercise;
use Saloon\Http\Faking\MockClient;
use Saloon\Http\Faking\MockResponse;

use function Pest\Laravel\postJson;

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

    $this->validPayload = [
        'jointAngles' => ['knee' => 90.0, 'hip' => 85.0],
        'currentPhase' => 'descent',
        'repCount' => 3,
        'deviations' => ['knee' => 5.0],
    ];

    $this->feedbackResponse = [
        'overallFeedback' => 'Good form overall, minor knee tracking issue.',
        'jointCorrections' => [
            ['joint' => 'knee', 'correction' => 'Keep knees aligned with toes.'],
        ],
        'encouragement' => 'Great effort! Keep it up!',
    ];
});

describe('Feedback', function (): void {
    it('returns coaching feedback for an exercise', function (): void {
        $mockClient = new MockClient([
            GenerateContentRequest::class => MockResponse::make([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode($this->feedbackResponse, JSON_THROW_ON_ERROR)],
                            ],
                        ],
                    ],
                ],
            ]),
        ]);

        $connector = new GeminiConnector;
        $connector->withMockClient($mockClient);
        $this->app->instance(GeminiConnector::class, $connector);

        postJson("/api/exercises/{$this->exercise->id}/feedback", $this->validPayload)
            ->assertOk()
            ->assertJsonStructure(['overallFeedback', 'jointCorrections', 'encouragement'])
            ->assertJson($this->feedbackResponse);
    });

    it('works without deviations', function (): void {
        $mockClient = new MockClient([
            GenerateContentRequest::class => MockResponse::make([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode($this->feedbackResponse, JSON_THROW_ON_ERROR)],
                            ],
                        ],
                    ],
                ],
            ]),
        ]);

        $connector = new GeminiConnector;
        $connector->withMockClient($mockClient);
        $this->app->instance(GeminiConnector::class, $connector);

        $payload = $this->validPayload;
        unset($payload['deviations']);

        postJson("/api/exercises/{$this->exercise->id}/feedback", $payload)
            ->assertOk();
    });

    it('returns 404 for non-existing exercise', function (): void {
        postJson('/api/exercises/999/feedback', $this->validPayload)
            ->assertNotFound();
    });
});

describe('Validation', function (): void {
    it('fails when jointAngles is missing', function (): void {
        $payload = $this->validPayload;
        unset($payload['jointAngles']);

        postJson("/api/exercises/{$this->exercise->id}/feedback", $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['jointAngles']);
    });

    it('fails when currentPhase is missing', function (): void {
        $payload = $this->validPayload;
        unset($payload['currentPhase']);

        postJson("/api/exercises/{$this->exercise->id}/feedback", $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['currentPhase']);
    });

    it('fails when repCount is missing', function (): void {
        $payload = $this->validPayload;
        unset($payload['repCount']);

        postJson("/api/exercises/{$this->exercise->id}/feedback", $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['repCount']);
    });

    it('fails when repCount is not an integer', function (): void {
        $payload = $this->validPayload;
        $payload['repCount'] = 'abc';

        postJson("/api/exercises/{$this->exercise->id}/feedback", $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['repCount']);
    });

    it('fails when jointAngles contains non-numeric values', function (): void {
        $payload = $this->validPayload;
        $payload['jointAngles'] = ['knee' => 'not-a-number'];

        postJson("/api/exercises/{$this->exercise->id}/feedback", $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['jointAngles.knee']);
    });
});
