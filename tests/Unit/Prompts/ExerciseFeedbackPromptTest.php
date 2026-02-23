<?php

declare(strict_types=1);

use App\Data\Coaching\PoseInputData;
use App\Models\Exercise;
use App\Prompts\ExerciseFeedbackPrompt;

it('includes exercise details in the prompt', function (): void {
    $exercise = Exercise::factory()->make([
        'name' => 'Squat',
        'instructions' => 'Stand with feet shoulder-width apart and lower your body.',
        'muscle_types' => ['quadriceps', 'glutes'],
    ]);

    $poseData = new PoseInputData(
        jointAngles: ['knee' => 90.0, 'hip' => 85.0],
        deviations: ['knee' => 5.0],
        currentPhase: 'descent',
        repCount: 3,
    );

    $prompt = (string) new ExerciseFeedbackPrompt($exercise, $poseData);

    expect($prompt)
        ->toContain('Squat')
        ->toContain('Stand with feet shoulder-width apart')
        ->toContain('quadriceps')
        ->toContain('"knee":90')
        ->toContain('descent')
        ->toContain('3');
});
