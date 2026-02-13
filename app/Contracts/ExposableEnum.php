<?php

declare(strict_types=1);

namespace App\Contracts;

interface ExposableEnum
{
    public static function getIdentifier(): string;

    public function value(): int|string;

    public function label(): string;
}
