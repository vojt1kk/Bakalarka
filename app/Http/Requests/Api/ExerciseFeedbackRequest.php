<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use App\Data\Coaching\PoseInputData;
use Illuminate\Foundation\Http\FormRequest;

final class ExerciseFeedbackRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'jointAngles' => [
                'required',
                'array',
            ],
            'jointAngles.*' => [
                'required',
                'numeric',
            ],
            'currentPhase' => [
                'required',
                'string',
                'max:255',
            ],
            'repCount' => [
                'required',
                'integer',
                'min:0',
            ],
            'deviations' => [
                'sometimes',
                'array',
            ],
            'deviations.*' => [
                'required',
                'numeric',
            ],
        ];
    }

    public function toInputData(): PoseInputData
    {
        $validated = $this->validated();

        return new PoseInputData(
            jointAngles: $validated['jointAngles'],
            deviations: $validated['deviations'] ?? [],
            currentPhase: $validated['currentPhase'],
            repCount: (int) $validated['repCount'],
        );
    }
}
