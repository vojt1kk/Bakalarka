<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MuscleType;
use App\Enums\PplType;
use App\Enums\UlType;
use Database\Factories\ExerciseFactory;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read int $id
 * @property-read string $name
 * @property-read string $description
 * @property-read string $video_path
 * @property-read string $instructions
 * @property-read PplType|null $ppl_type
 * @property-read UlType|null $ul_type
 * @property-read list<MuscleType> $muscle_types
 * @property-read \Carbon\CarbonImmutable $created_at
 * @property-read \Carbon\CarbonImmutable $updated_at
 */
#[UseFactory(ExerciseFactory::class)]
final class Exercise extends Model
{
    use HasFactory;

    public const ATTR_ID = 'id';
    public const ATTR_NAME = 'name';
    public const ATTR_DESCRIPTION = 'description';
    public const ATTR_VIDEO_PATH = 'video_path';
    public const ATTR_INSTRUCTIONS = 'instructions';
    public const ATTR_PPL_TYPE = 'ppl_type';
    public const ATTR_UL_TYPE = 'ul_type';
    public const ATTR_MUSCLE_TYPES = 'muscle_types';
    public const ATTR_CREATED_AT = 'created_at';
    public const ATTR_UPDATED_AT = 'updated_at';

    protected $fillable = [
        self::ATTR_NAME,
        self::ATTR_DESCRIPTION,
        self::ATTR_VIDEO_PATH,
        self::ATTR_INSTRUCTIONS,
        self::ATTR_PPL_TYPE,
        self::ATTR_UL_TYPE,
        self::ATTR_MUSCLE_TYPES,
    ];

    protected function casts(): array
    {
        return [
            self::ATTR_PPL_TYPE => PplType::class,
            self::ATTR_UL_TYPE => UlType::class,
            self::ATTR_MUSCLE_TYPES => 'array',
        ];
    }
}
