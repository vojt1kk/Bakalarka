<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Models\Exercise;
use Illuminate\Http\Response;

/**
 * Lightweight readiness probe for the rep feedback endpoint. It never calls the AI provider.
 */
final readonly class RepFeedbackHealthController
{
    public function __invoke(Exercise $exercise): Response
    {
        return response()->noContent();
    }
}
