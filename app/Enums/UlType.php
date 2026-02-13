<?php

declare(strict_types=1);

namespace App\Enums;

use App\Contracts\ExposableEnum;

enum UlType: string implements ExposableEnum
{
    case Upper = 'upper';
    case Lower = 'lower';

    public static function getIdentifier(): string
    {
        return 'ul_type';
    }

    public function value(): string
    {
        return $this->value;
    }

    public function label(): string
    {
        return match ($this) {
            self::Upper => trans('common.ul_type.upper'),
            self::Lower => trans('common.ul_type.lower'),
        };
    }
}
