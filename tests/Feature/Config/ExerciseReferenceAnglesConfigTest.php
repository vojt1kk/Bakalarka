<?php

declare(strict_types=1);

describe('ExerciseReferenceAngles Config', function (): void {
    it('loads all expected exercises', function (): void {
        $config = config('exercise-reference-angles');

        expect($config)
            ->toBeArray()
            ->toHaveKeys(['squat', 'bicep_curl', 'push_up', 'overhead_press', 'deadlift', 'lunge']);
    });

    it('has valid phase structure for each exercise', function (): void {
        $config = config('exercise-reference-angles');

        foreach ($config as $data) {
            expect($data)->toHaveKey('phases');
            expect($data['phases'])->toBeArray()->not->toBeEmpty();

            foreach ($data['phases'] as $joints) {
                foreach ($joints as $angles) {
                    expect($angles)
                        ->toHaveKeys(['min', 'ideal', 'max'])
                        ->and($angles['min'])->toBeLessThanOrEqual($angles['ideal'])
                        ->and($angles['ideal'])->toBeLessThanOrEqual($angles['max'])
                        ->and($angles['min'])->toBeGreaterThanOrEqual(0)
                        ->and($angles['max'])->toBeLessThanOrEqual(180);
                }
            }
        }
    });
});

describe('Gemini Config', function (): void {
    it('has gemini service configuration', function (): void {
        expect(config('services.gemini'))
            ->toBeArray()
            ->toHaveKeys(['api_key', 'model'])
            ->and(config('services.gemini.model'))->toBe('gemini-2.0-flash');
    });
});
