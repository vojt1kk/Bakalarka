<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\MuscleType;
use App\Enums\PplType;
use App\Enums\UlType;
use App\Models\Exercise;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Exercise>
 */
class ExerciseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            Exercise::ATTR_NAME => fake()->text(),
            Exercise::ATTR_DESCRIPTION => fake()->text(65535),
            Exercise::ATTR_VIDEO_PATH => fake()->text(),
            Exercise::ATTR_INSTRUCTIONS => fake()->text(65535),
            Exercise::ATTR_PPL_TYPE => fake()->optional()->randomElement(PplType::cases()),
            Exercise::ATTR_UL_TYPE => fake()->optional()->randomElement(UlType::cases()),
            Exercise::ATTR_MUSCLE_TYPES => fake()->randomElements(MuscleType::cases(), fake()->numberBetween(1, 3)),
        ];
    }
}
