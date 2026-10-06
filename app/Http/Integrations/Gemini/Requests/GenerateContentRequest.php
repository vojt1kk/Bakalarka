<?php

declare(strict_types=1);

namespace App\Http\Integrations\Gemini\Requests;

use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Http\Response;
use Saloon\Traits\Body\HasJsonBody;

final class GenerateContentRequest extends Request implements HasBody
{
    use HasJsonBody;

    protected Method $method = Method::POST;

    public function __construct(
        private readonly string $model,
        private readonly string $prompt,
    ) {}

    public function resolveEndpoint(): string
    {
        return "/models/{$this->model}:generateContent";
    }

    /**
     * @return array<string, mixed>
     */
    public function createDtoFromResponse(Response $response): array
    {
        $text = $response->json('candidates.0.content.parts.0.text');

        return json_decode((string) $text, true, 512, JSON_THROW_ON_ERROR);
    }

    /**
     * Thinking is set to "minimal" because real-time coaching needs low latency
     * more than deep reasoning (~1.3s vs ~3s with default thinking).
     *
     * @return array<string, mixed>
     */
    protected function defaultBody(): array
    {
        return [
            'contents' => [
                ['parts' => [['text' => $this->prompt]]],
            ],
            'generationConfig' => [
                'response_mime_type' => 'application/json',
                'thinkingConfig' => [
                    'thinkingLevel' => 'minimal',
                ],
            ],
        ];
    }
}
