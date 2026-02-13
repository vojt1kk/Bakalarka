<?php

declare(strict_types=1);

namespace Tests\Structure\Api;

use Illuminate\Contracts\Support\Arrayable;

final readonly class ExerciseApiStructure implements Arrayable
{
    /**
     * @return list<string>
     */
    public function toArray(): array
    {
        return [
            'id',
            'name',
            'description',
            'videoPath',
            'instructions',
            'pplType',
            'ulType',
            'muscleTypes',
            'createdAt',
            'updatedAt',
        ];
    }
}
