<?php

declare(strict_types=1);

use App\Models\Exercise;
use Database\Seeders\ExerciseSeeder;

test('seeder creates only the squat', function (): void {
    $this->seed(ExerciseSeeder::class);

    expect(Exercise::query()->pluck('name')->all())->toBe(['Squat']);
});

test('seeder removes exercises that are not in the catalogue', function (): void {
    Exercise::factory()->create(['name' => 'Bench press']);
    Exercise::factory()->create(['name' => 'Push-ups']);

    $this->seed(ExerciseSeeder::class);

    expect(Exercise::query()->pluck('name')->all())->toBe(['Squat']);
});

test('seeder is idempotent and keeps the existing squat record', function (): void {
    $this->seed(ExerciseSeeder::class);
    $squatId = Exercise::query()->where('name', 'Squat')->value('id');

    $this->seed(ExerciseSeeder::class);

    expect(Exercise::query()->count())->toBe(1)
        ->and(Exercise::query()->value('id'))->toBe($squatId);
});
