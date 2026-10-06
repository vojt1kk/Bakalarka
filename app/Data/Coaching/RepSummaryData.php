<?php

declare(strict_types=1);

namespace App\Data\Coaching;

/**
 * @phpstan-type KeyPoint array{0: float, 1: float, 2: float, 3: float}
 * @phpstan-type RepKeyframe array{angles: array{knee: float, hip: float}, points: array<string, KeyPoint>}
 */
final readonly class RepSummaryData
{
    public const KEYFRAMES = ['start', 'bottom', 'end'];

    public const KEY_POINTS = [
        'left_shoulder',
        'right_shoulder',
        'left_hip',
        'right_hip',
        'left_knee',
        'right_knee',
        'left_ankle',
        'right_ankle',
    ];

    /**
     * @param  array{start: RepKeyframe, bottom: RepKeyframe, end: RepKeyframe}  $keyframes
     */
    public function __construct(
        public int $repNumber,
        public array $keyframes,
        public int $frameWidth,
        public int $frameHeight,
        public float $eccentricSeconds,
        public float $concentricSeconds,
    ) {}
}
