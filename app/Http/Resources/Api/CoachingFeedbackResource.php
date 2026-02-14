<?php

declare(strict_types=1);

namespace App\Http\Resources\Api;

use App\Data\Coaching\CoachingFeedbackData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CoachingFeedbackData
 */
final class CoachingFeedbackResource extends JsonResource
{
    public static $wrap;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'overallFeedback' => $this->overallFeedback,
            'jointCorrections' => $this->jointCorrections,
            'encouragement' => $this->encouragement,
        ];
    }
}
