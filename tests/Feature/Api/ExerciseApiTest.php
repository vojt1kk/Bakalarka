<?php

declare(strict_types=1);

use App\Enums\MuscleType;
use App\Enums\PplType;
use App\Enums\UlType;
use App\Models\Exercise;
use Tests\Structure\Api\ExerciseApiStructure;

use function Pest\Laravel\deleteJson;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;

describe('Index', function (): void {
    it('returns a paginated list of exercises', function (): void {
        Exercise::factory()->count(3)->create();

        getJson('/api/exercises')
            ->assertOk()
            ->assertPaginatedApiCount(3)
            ->assertPaginatedApiStructure(new ExerciseApiStructure());
    });
});

describe('Show', function (): void {
    it('returns a single exercise', function (): void {
        $exercise = Exercise::factory()->create();

        getJson("/api/exercises/$exercise->id")
            ->assertOk()
            ->assertApiStructure(new ExerciseApiStructure());
    });

    it('returns 404 for non-existing exercise', function (): void {
        getJson('/api/exercises/999')
            ->assertNotFound();
    });
});

describe('Store', function (): void {
    it('creates a new exercise', function (): void {
        $muscleTypes = fake()->randomElements(MuscleType::cases(), 2);

        $data = [
            'name' => fake()->text(),
            'description' => fake()->text(65535),
            'videoPath' => fake()->text(),
            'instructions' => fake()->text(65535),
            'pplType' => fake()->randomElement(PplType::class)->value,
            'ulType' => fake()->randomElement(UlType::class)->value,
            'muscleTypes' => array_map(fn (MuscleType $m): string => $m->value, $muscleTypes),
        ];

        $responseData = postJson('/api/exercises', $data)
            ->assertCreated()
            ->assertApiStructure(new ExerciseApiStructure())
            ->json();

        expect($responseData)
            ->name->toBe($data['name'])
            ->description->toBe($data['description'])
            ->videoPath->toBe($data['videoPath'])
            ->instructions->toBe($data['instructions'])
            ->pplType->toBe($data['pplType'])
            ->ulType->toBe($data['ulType'])
            ->muscleTypes->toBe($data['muscleTypes']);
    });

    describe('Validation', function (): void {
        it('fails 422 when attribute is missing', function (): void {
            $data = [
                'description' => fake()->text(65535),
                'videoPath' => fake()->text(),
                'instructions' => fake()->text(65535),
                'pplType' => fake()->randomElement(PplType::class)->value,
                'ulType' => fake()->randomElement(UlType::class)->value,
                'muscleTypes' => fake()->randomElement(MuscleType::class)->value,
            ];

            postJson('/api/exercises', $data)
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['name']);
        });
    });
});

describe('Update', function (): void {
    it('updates an exercise', function (): void {
        $exercise = Exercise::factory()->create();
        $muscleTypes = fake()->randomElements(MuscleType::cases(), 2);

        $data = [
            'name' => fake()->text(),
            'description' => fake()->text(65535),
            'videoPath' => fake()->text(),
            'instructions' => fake()->text(65535),
            'pplType' => fake()->randomElement(PplType::class)->value,
            'ulType' => fake()->randomElement(UlType::class)->value,
            'muscleTypes' => array_map(fn (MuscleType $m): string => $m->value, $muscleTypes),
        ];

        $responseData = putJson("/api/exercises/$exercise->id", $data)
            ->assertOk()
            ->assertApiStructure(new ExerciseApiStructure())
            ->json();

        expect($responseData)
            ->name->toBe($data['name'])
            ->description->toBe($data['description'])
            ->videoPath->toBe($data['videoPath'])
            ->instructions->toBe($data['instructions'])
            ->pplType->toBe($data['pplType'])
            ->ulType->toBe($data['ulType'])
            ->muscleTypes->toBe($data['muscleTypes']);
    });

    it('returns 404 for non-existing exercise', function (): void {
        $data = [
            'name' => fake()->text(),
            'description' => fake()->text(),
            'videoPath' => fake()->text(),
            'instructions' => fake()->text(),
            'muscleTypes' => [MuscleType::Chest->value],
        ];

        putJson('/api/exercises/999', $data)
            ->assertNotFound();
    });
});

describe('Delete', function (): void {
    it('deletes an exercise', function (): void {
        $exercise = Exercise::factory()->create();

        deleteJson("/api/exercises/$exercise->id")
            ->assertNoContent();

        deleteJson("/api/exercises/$exercise->id")
            ->assertNotFound();
    });
});
