<?php

declare(strict_types=1);

namespace App\Http\Integrations\Gemini;

use Saloon\Http\Auth\QueryAuthenticator;
use Saloon\Http\Connector;

final class GeminiConnector extends Connector
{
    public function resolveBaseUrl(): string
    {
        return 'https://generativelanguage.googleapis.com/v1beta';
    }

    protected function defaultAuth(): QueryAuthenticator
    {
        return new QueryAuthenticator('key', config('services.gemini.api_key'));
    }

    /**
     * @return array<string, string>
     */
    protected function defaultHeaders(): array
    {
        return [
            'Accept' => 'application/json',
        ];
    }
}
