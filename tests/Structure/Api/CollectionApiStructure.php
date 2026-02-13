<?php

declare(strict_types=1);

namespace Tests\Structure\Api;

use Illuminate\Contracts\Support\Arrayable;

final readonly class CollectionApiStructure implements Arrayable
{
    public function __construct(
        private Arrayable $resource,
    ) {}

    public static function of(Arrayable $resource): self
    {
        return new self($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            '*' => $this->resource->toArray(),
        ];
    }
}
