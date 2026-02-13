<?php

declare(strict_types=1);

namespace App\Data\Exercises;

use App\Models\Exercise;

final class ExerciseInputData
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function __construct(
        private array $attributes = [],
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public function setName(string $name): void
    {
        $this->attributes[Exercise::ATTR_NAME] = $name;
    }

    public function setDescription(string $description): void
    {
        $this->attributes[Exercise::ATTR_DESCRIPTION] = $description;
    }

    public function setVideoPath(string $videoPath): void
    {
        $this->attributes[Exercise::ATTR_VIDEO_PATH] = $videoPath;
    }

    public function setInstructions(string $instructions): void
    {
        $this->attributes[Exercise::ATTR_INSTRUCTIONS] = $instructions;
    }

    public function setPplType(?string $pplType): void
    {
        $this->attributes[Exercise::ATTR_PPL_TYPE] = $pplType;
    }

    public function setUlType(?string $ulType): void
    {
        $this->attributes[Exercise::ATTR_UL_TYPE] = $ulType;
    }

    public function setMuscleTypes(array $muscleTypes): void
    {
        $this->attributes[Exercise::ATTR_MUSCLE_TYPES] = $muscleTypes;
    }
}
