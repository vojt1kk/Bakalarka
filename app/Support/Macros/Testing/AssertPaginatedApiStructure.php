<?php

declare(strict_types=1);

namespace App\Support\Macros\Testing;

use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Testing\TestResponse;
use Tests\Structure\Api\PaginatedApiStructure;

/**
 * @mixin TestResponse
 */
final readonly class AssertPaginatedApiStructure
{
    /**
     * @return Closure(Arrayable): TestResponse
     */
    public function __invoke(): Closure
    {
        return fn (Arrayable $resource): TestResponse => $this->assertApiStructure(PaginatedApiStructure::of($resource));
    }
}
