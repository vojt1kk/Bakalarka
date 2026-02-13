<?php

declare(strict_types=1);

namespace Tests\Structure\Api;

use Illuminate\Contracts\Support\Arrayable;

final readonly class PaginatedApiStructure implements Arrayable
{
    public function __construct(
        private Arrayable $collection,
    ) {}

    public static function of(Arrayable $resource): self
    {
        return new self(new CollectionApiStructure($resource));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'data' => $this->collection->toArray(),
            'links' => [
                'first',
                'last',
                'prev',
                'next',
            ],
            'meta' => [
                'current_page',
                'from',
                'last_page',
                'path',
                'per_page',
                'to',
                'total',
            ],
        ];
    }
}
