<?php

declare(strict_types=1);

namespace App\Http\Resources\Api;

use App\Data\Coaching\RepFeedbackData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin RepFeedbackData
 */
final class RepFeedbackResource extends JsonResource
{
    public static $wrap;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'startPosition' => $this->serializeSection($this->startPosition),
            'bottomPosition' => $this->serializeSection($this->bottomPosition),
            'tempo' => $this->serializeSection($this->tempo),
            'encouragement' => $this->encouragement,
        ];
    }

    /**
     * @param  array{status: \App\Enums\FeedbackStatus, issue: ?string, correction: string}  $section
     *
     * @return array{status: string, issue: ?string, correction: string}
     */
    private function serializeSection(array $section): array
    {
        return [
            'status' => $section['status']->value,
            'issue' => $section['issue'],
            'correction' => $section['correction'],
        ];
    }
}
