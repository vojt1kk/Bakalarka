<?php

declare(strict_types=1);

use App\Data\Coaching\RepSummaryData;
use App\Models\Exercise;
use App\Prompts\RepFeedbackPrompt;

function promptKeyframe(float $knee, float $hip, float $y): array
{
    $points = [];
    foreach (RepSummaryData::KEY_POINTS as $point) {
        $points[$point] = [0.5, $y, -0.1, 0.99];
    }

    return ['angles' => ['knee' => $knee, 'hip' => $hip], 'points' => $points];
}

function sectionOf(string $prompt, string $section, string $nextHeading): string
{
    $start = mb_strpos($prompt, "Section {$section}");
    $end = mb_strpos($prompt, $nextHeading, $start);

    return mb_substr($prompt, $start, $end - $start);
}

beforeEach(function (): void {
    $exercise = Exercise::factory()->make([
        'name' => 'Squat',
        'instructions' => 'Stand with feet shoulder-width apart and lower your body.',
        'muscle_types' => ['quadriceps', 'glutes'],
    ]);

    $rep = new RepSummaryData(
        repNumber: 4,
        keyframes: [
            'start' => promptKeyframe(171.1, 172.2, 0.111),
            'bottom' => promptKeyframe(88.8, 59.9, 0.555),
            'end' => promptKeyframe(169.9, 173.3, 0.999),
        ],
        frameWidth: 293,
        frameHeight: 450,
        eccentricSeconds: 1.26,
        concentricSeconds: 0.93,
    );

    $this->prompt = (string) new RepFeedbackPrompt($exercise, (require dirname(__DIR__, 3) . '/config/exercise-reference-angles.php')['squat'], $rep);
});

it('includes exercise context, reference ranges, frame size and the response contract', function (): void {
    expect($this->prompt)
        ->toContain('Squat')
        ->toContain('quadriceps')
        ->toContain('Repetition number: 4')
        ->toContain('293x450 px')
        ->toContain('"knee":{"min":70,"ideal":90,"max":110}')
        ->toContain('"eccentric":{"min":1.5,"max":3}')
        ->toContain('"status": "ok", "issue": null')
        ->toContain('incomplete_lockout')
        ->toContain('too_shallow')
        ->toContain('too_fast')
        ->not->toContain('"ankle":{')
        ->not->toContain('Current phase');
});

it('keeps each section limited to its own data', function (): void {
    $startSection = sectionOf($this->prompt, 'startPosition', 'Section bottomPosition');
    $bottomSection = sectionOf($this->prompt, 'bottomPosition', 'Section tempo');
    $tempoSection = sectionOf($this->prompt, 'tempo', 'Rules:');

    expect($startSection)
        ->toContain('"knee":171.1')
        ->toContain('"knee":169.9')
        ->not->toContain('"knee":88.8');

    expect($bottomSection)
        ->toContain('"knee":88.8')
        ->toContain('0.555')
        ->not->toContain('"knee":171.1')
        ->not->toContain('"knee":169.9');

    expect($tempoSection)
        ->toContain('eccentric (lowering) = 1.26 s')
        ->toContain('concentric (rising) = 0.93 s')
        ->not->toContain('"knee"');

    expect($this->prompt)->toContain('Never judge depth from a standing frame');
});
