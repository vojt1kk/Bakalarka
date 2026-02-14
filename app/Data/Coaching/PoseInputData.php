<?php

declare(strict_types=1);

namespace App\Data\Coaching;

final readonly class PoseInputData
{
    /**
     * @param  array<string, float>  $jointAngles
     * @param  array<string, float>  $deviations
     */
    public function __construct(
        public array $jointAngles,
        public array $deviations,
        public string $currentPhase,
        public int $repCount,
    ) {}
}
