<?php

declare(strict_types=1);

namespace App\Http\Resources\Api;

use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Exercise
 */
final class ExerciseResource extends JsonResource
{
    public static $wrap;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'videoPath' => $this->video_path,
            'instructions' => $this->instructions,
            'pplType' => $this->ppl_type,
            'ulType' => $this->ul_type,
            'muscleTypes' => $this->muscle_types,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
