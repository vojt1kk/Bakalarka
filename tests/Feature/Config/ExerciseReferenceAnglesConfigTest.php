<?php

declare(strict_types=1);

describe('ExerciseReferenceAngles Config', function (): void {
    it('contains only the squat', function (): void {
        expect(config('exercise-reference-angles'))
            ->toBeArray()
            ->toHaveKeys(['squat'])
            ->toHaveCount(1);
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

    it('has valid tempo structure for exercises that define it', function (): void {
        $withTempo = collect(config('exercise-reference-angles'))->filter(fn (array $data): bool => isset($data['tempo']));

        expect($withTempo)->toHaveKey('squat');

        foreach ($withTempo as $data) {
            expect($data['tempo'])->toHaveKeys(['eccentric', 'concentric']);

            foreach ($data['tempo'] as $range) {
                expect($range)
                    ->toHaveKeys(['min', 'max'])
                    ->and($range['min'])->toBeLessThan($range['max']);
            }
        }
    });
});

describe('Gemini Config', function (): void {
    it('has gemini service configuration', function (): void {
        expect(config('services.gemini'))
            ->toBeArray()
            ->toHaveKeys(['api_key', 'model'])
            ->and(config('services.gemini.model'))->toBe('gemini-3.5-flash-lite');
    });
});
