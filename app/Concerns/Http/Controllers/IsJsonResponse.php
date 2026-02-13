<?php

declare(strict_types=1);

namespace App\Concerns\Http\Controllers;

use Illuminate\Http\JsonResponse;

trait IsJsonResponse
{
    protected function jsonResponse(?array $data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status);
    }

    protected function ok(string $message): JsonResponse
    {
        return $this->jsonResponse(['message' => $message]);
    }

    protected function noContent(): JsonResponse
    {
        return $this->jsonResponse(null, 204);
    }
}
