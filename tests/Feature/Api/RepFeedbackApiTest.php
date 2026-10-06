<?php

declare(strict_types=1);

use App\Http\Integrations\Gemini\GeminiConnector;
use App\Http\Integrations\Gemini\Requests\GenerateContentRequest;
use App\Models\Exercise;
use Saloon\Http\Faking\MockClient;
use Saloon\Http\Faking\MockResponse;

use function Pest\Laravel\postJson;

function mockGemini(array $generated): void
{
    $connector = new GeminiConnector;
    $connector->withMockClient(new MockClient([
        GenerateContentRequest::class => MockResponse::make([
            'candidates' => [
                ['content' => ['parts' => [['text' => json_encode($generated, JSON_THROW_ON_ERROR)]]]],
            ],
        ]),
    ]));

    app()->instance(GeminiConnector::class, $connector);
}

function repKeyframe(float $knee, float $hip): array
{
    $points = [];
    foreach (App\Data\Coaching\RepSummaryData::KEY_POINTS as $point) {
        $points[$point] = [0.5, 0.6, -0.12, 0.98];
    }

    return ['angles' => ['knee' => $knee, 'hip' => $hip], 'points' => $points];
}

beforeEach(function (): void {
    config([
        'services.gemini.api_key' => 'test-api-key',
        'services.gemini.model' => 'gemini-3.5-flash',
    ]);

    $this->exercise = Exercise::factory()->create([
        'name' => 'Squat',
        'instructions' => 'Stand with feet shoulder-width apart and lower your body.',
        'muscle_types' => ['quadriceps', 'glutes'],
    ]);

    $this->url = "/api/exercises/{$this->exercise->id}/rep-feedback";

    $this->validPayload = [
        'repNumber' => 3,
        'keyframes' => [
            'start' => repKeyframe(176.2, 174.0),
            'bottom' => repKeyframe(88.5, 84.1),
            'end' => repKeyframe(175.0, 172.3),
        ],
        'frame' => ['width' => 293, 'height' => 450],
        'eccentricSeconds' => 1.9,
        'concentricSeconds' => 1.1,
    ];

    $this->geminiResponse = [
        'startPosition' => ['status' => 'ok', 'issue' => null, 'correction' => 'Výchozí pozice je skvělá.'],
        'bottomPosition' => ['status' => 'warning', 'issue' => 'too_shallow', 'correction' => 'Jdi níž.'],
        'tempo' => ['status' => 'ok', 'issue' => null, 'correction' => 'Tempo sedí.'],
        'encouragement' => 'Skvělý rep!',
    ];
});

describe('Rep feedback', function (): void {
    it('returns the statuses decided by Gemini', function (): void {
        mockGemini($this->geminiResponse);

        postJson($this->url, $this->validPayload)
            ->assertOk()
            ->assertExactJson([
                'startPosition' => ['status' => 'ok', 'issue' => null, 'correction' => 'Výchozí pozice je skvělá.'],
                'bottomPosition' => ['status' => 'warning', 'issue' => 'too_shallow', 'correction' => 'Jdi níž.'],
                'tempo' => ['status' => 'ok', 'issue' => null, 'correction' => 'Tempo sedí.'],
                'encouragement' => 'Skvělý rep!',
            ]);
    });

    it('fails instead of masking an incomplete or invalid Gemini section', function (array $section): void {
        $response = $this->geminiResponse;
        $response['bottomPosition'] = $section;
        mockGemini($response);

        postJson($this->url, $this->validPayload)->assertServerError();
    })->with([
        'missing status' => [['correction' => 'Dobré.']],
        'unknown status' => [['status' => 'great', 'correction' => 'Dobré.']],
        'issue from another section' => [['status' => 'warning', 'issue' => 'too_fast', 'correction' => 'Pomaleji.']],
        'warning without issue' => [['status' => 'warning', 'issue' => null, 'correction' => 'Pozor.']],
        'ok with an issue' => [['status' => 'ok', 'issue' => 'too_deep', 'correction' => 'Dobré.']],
        'missing correction' => [['status' => 'warning', 'issue' => 'too_deep']],
        'empty correction' => [['status' => 'ok', 'issue' => null, 'correction' => '']],
    ]);

    it('fails instead of masking a missing encouragement', function (): void {
        $response = $this->geminiResponse;
        $response['encouragement'] = '';
        mockGemini($response);

        postJson($this->url, $this->validPayload)->assertServerError();
    });

    it('returns 422 for an exercise without tempo reference', function (): void {
        $benchPress = Exercise::factory()->create(['name' => 'Bench press']);

        postJson("/api/exercises/{$benchPress->id}/rep-feedback", $this->validPayload)
            ->assertUnprocessable()
            ->assertInvalid(['exercise']);
    });

    it('returns 404 for non-existing exercise', function (): void {
        postJson('/api/exercises/999/rep-feedback', $this->validPayload)
            ->assertNotFound();
    });
});

describe('Validation', function (): void {
    it('fails when required fields are missing', function (string $field): void {
        $payload = $this->validPayload;
        unset($payload[$field]);

        postJson($this->url, $payload)->assertInvalid([$field]);
    })->with(['repNumber', 'keyframes', 'frame', 'eccentricSeconds', 'concentricSeconds']);

    it('fails when a keyframe is missing', function (): void {
        $payload = $this->validPayload;
        unset($payload['keyframes']['bottom']);

        postJson($this->url, $payload)->assertInvalid(['keyframes']);
    });

    it('fails when an angle is out of range', function (): void {
        $payload = $this->validPayload;
        $payload['keyframes']['start']['angles']['knee'] = 200;

        postJson($this->url, $payload)->assertInvalid(['keyframes.start.angles.knee']);
    });

    it('rejects disallowed angle keys such as ankle', function (): void {
        $payload = $this->validPayload;
        $payload['keyframes']['bottom']['angles']['ankle'] = 70.0;

        postJson($this->url, $payload)->assertInvalid(['keyframes.bottom.angles']);
    });

    it('rejects untracked points', function (): void {
        $payload = $this->validPayload;
        $payload['keyframes']['bottom']['points']['nose'] = [0.5, 0.1, 0, 1];

        postJson($this->url, $payload)->assertInvalid(['keyframes.bottom.points']);
    });

    it('fails when a point is missing', function (): void {
        $payload = $this->validPayload;
        unset($payload['keyframes']['end']['points']['left_knee']);

        postJson($this->url, $payload)->assertInvalid(['keyframes.end.points']);
    });

    it('fails when a point does not have four values', function (): void {
        $payload = $this->validPayload;
        $payload['keyframes']['start']['points']['left_hip'] = [0.5, 0.6];

        postJson($this->url, $payload)->assertInvalid(['keyframes.start.points.left_hip']);
    });

    it('fails when a coordinate is out of range', function (): void {
        $payload = $this->validPayload;
        $payload['keyframes']['start']['points']['left_hip'][0] = 50;

        postJson($this->url, $payload)->assertInvalid(['keyframes.start.points.left_hip.0']);
    });

    it('fails when the frame size is invalid', function (): void {
        $payload = $this->validPayload;
        $payload['frame']['width'] = 0;

        postJson($this->url, $payload)->assertInvalid(['frame.width']);
    });

    it('fails when seconds are out of range', function (): void {
        $payload = $this->validPayload;
        $payload['concentricSeconds'] = 31;

        postJson($this->url, $payload)->assertInvalid(['concentricSeconds']);
    });

    it('fails when repNumber is not a positive integer', function (mixed $value): void {
        $payload = $this->validPayload;
        $payload['repNumber'] = $value;

        postJson($this->url, $payload)->assertInvalid(['repNumber']);
    })->with([0, 'abc', 1.5]);

    it('returns Czech validation messages', function (): void {
        $payload = $this->validPayload;
        $payload['eccentricSeconds'] = 99;

        postJson($this->url, $payload)
            ->assertInvalid(['eccentricSeconds' => 'Doba spouštění musí být mezi 0 a 30 sekundami.']);
    });
});

describe('Rate limiting', function (): void {
    it('returns 429 after 30 requests per minute', function (): void {
        mockGemini($this->geminiResponse);

        foreach (range(1, 30) as $attempt) {
            postJson($this->url, $this->validPayload)->assertOk();
        }

        postJson($this->url, $this->validPayload)->assertTooManyRequests();
    });
});
