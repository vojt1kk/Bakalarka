<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use App\Data\Exercises\ExerciseInputData;
use App\Enums\MuscleType;
use App\Enums\PplType;
use App\Enums\UlType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ExerciseRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'description' => [
                'required',
                'string',
                'max:65535',
            ],
            'videoPath' => [
                'required',
                'string',
                'max:255',
            ],
            'instructions' => [
                'required',
                'string',
                'max:65535',
            ],
            'pplType' => [
                'nullable',
                'string',
                Rule::enum(PplType::class),
            ],
            'ulType' => [
                'nullable',
                'string',
                Rule::enum(UlType::class),
            ],
            'muscleTypes' => [
                'required',
                'array',
                'min:1',
            ],
            'muscleTypes.*' => [
                'required',
                'string',
                Rule::enum(MuscleType::class),
            ],
        ];
    }

    public function toInputData(): ExerciseInputData
    {
        $validated = $this->validated();
        $inputData = new ExerciseInputData();

        if (isset($validated['name'])) {
            $inputData->setName($validated['name']);
        }

        if (isset($validated['description'])) {
            $inputData->setDescription($validated['description']);
        }

        if (isset($validated['videoPath'])) {
            $inputData->setVideoPath($validated['videoPath']);
        }

        if (isset($validated['instructions'])) {
            $inputData->setInstructions($validated['instructions']);
        }

        if (isset($validated['pplType'])) {
            $inputData->setPplType($validated['pplType']);
        }

        if (isset($validated['ulType'])) {
            $inputData->setUlType($validated['ulType']);
        }

        if (isset($validated['muscleTypes'])) {
            $inputData->setMuscleTypes($validated['muscleTypes']);
        }

        return $inputData;
    }
}
