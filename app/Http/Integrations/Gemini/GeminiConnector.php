<?php

declare(strict_types=1);

namespace App\Http\Integrations\Gemini;

use App\Exceptions\GeminiException;
use Saloon\Http\Auth\QueryAuthenticator;
use Saloon\Http\Connector;
use Saloon\Http\Response;
use Saloon\Traits\Plugins\AcceptsJson;
use Saloon\Traits\Plugins\AlwaysThrowOnErrors;
use Throwable;

final class GeminiConnector extends Connector
{
    use AcceptsJson;
    use AlwaysThrowOnErrors;

    public function resolveBaseUrl(): string
    {
        return 'https://generativelanguage.googleapis.com/v1beta';
    }

    public function getRequestException(Response $response, ?Throwable $senderException): Throwable
    {
        return new GeminiException(
            message: $response->json('error.message', 'Unknown error'),
            code: $response->status(),
            previous: $senderException,
        );
    }

    protected function defaultAuth(): QueryAuthenticator
    {
        return new QueryAuthenticator('key', config('services.gemini.api_key'));
    }
}
