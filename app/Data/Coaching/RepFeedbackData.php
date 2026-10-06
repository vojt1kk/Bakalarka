<?php

declare(strict_types=1);

namespace App\Data\Coaching;

use App\Enums\FeedbackStatus;

final readonly class RepFeedbackData
{
    /**
     * @param  array{status: FeedbackStatus, issue: ?string, correction: string}  $startPosition
     * @param  array{status: FeedbackStatus, issue: ?string, correction: string}  $bottomPosition
     * @param  array{status: FeedbackStatus, issue: ?string, correction: string}  $tempo
     */
    public function __construct(
        public array $startPosition,
        public array $bottomPosition,
        public array $tempo,
        public string $encouragement,
    ) {}
}
