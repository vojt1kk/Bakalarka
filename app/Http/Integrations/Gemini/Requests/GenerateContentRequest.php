<?php

declare(strict_types=1);

namespace App\Http\Integrations\Gemini\Requests;

use App\Data\Coaching\CoachingFeedbackData;
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

    public function createDtoFromResponse(Response $response): CoachingFeedbackData
    {
        $text = $response->json('candidates.0.content.parts.0.text');
        $parsed = json_decode((string) $text, true, 512, JSON_THROW_ON_ERROR);

        return CoachingFeedbackData::fromArray($parsed);
    }

    /**
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
            ],
        ];
    }
}
