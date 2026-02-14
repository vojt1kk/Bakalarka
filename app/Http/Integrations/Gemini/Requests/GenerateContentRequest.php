<?php

declare(strict_types=1);

namespace App\Http\Integrations\Gemini\Requests;

use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

final class GenerateContentRequest extends Request implements HasBody
{
    use HasJsonBody;

    protected Method $method = Method::POST;

    /**
     * @param  array<int, array<string, mixed>>  $contents
     */
    public function __construct(
        private readonly string $model,
        private readonly array $contents,
    ) {}

    public function resolveEndpoint(): string
    {
        return "/models/{$this->model}:generateContent";
    }

    /**
     * @return array<string, mixed>
     */
    protected function defaultBody(): array
    {
        return [
            'contents' => $this->contents,
        ];
    }
}
