<?php

declare(strict_types=1);

namespace App\Support\Macros\Testing;

use Closure;
use Illuminate\Testing\TestResponse;

/**
 * @mixin TestResponse
 */
final readonly class AssertPaginatedApiCount
{
    /**
     * @return Closure(int): TestResponse
     */
    public function __invoke(): Closure
    {
        return fn (int $count): TestResponse => $this->assertJsonCount($count, 'data');
    }
}
