<?php

declare(strict_types=1);

namespace App\Services\Gemini;

use App\Http\Integrations\Gemini\GeminiConnector;
use App\Http\Integrations\Gemini\Requests\GenerateContentRequest;
use Stringable;

final readonly class GeminiService
{
    public function __construct(
        private GeminiConnector $connector,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function generateJson(string|Stringable $prompt): array
    {
        return $this->connector->send(
            new GenerateContentRequest(config('services.gemini.model'), (string) $prompt)
        )->dto();
    }
}
