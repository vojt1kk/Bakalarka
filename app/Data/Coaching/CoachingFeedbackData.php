<?php

declare(strict_types=1);

namespace App\Data\Coaching;

final readonly class CoachingFeedbackData
{
    /**
     * @param  array<int, array{joint: string, correction: string}>  $jointCorrections
     */
    public function __construct(
        public string $overallFeedback,
        public array $jointCorrections,
        public string $encouragement,
    ) {}

    /**
     * @param  array{overallFeedback: string, jointCorrections: array<int, array{joint: string, correction: string}>, encouragement: string}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            overallFeedback: $data['overallFeedback'],
            jointCorrections: $data['jointCorrections'],
            encouragement: $data['encouragement'],
        );
    }
}
