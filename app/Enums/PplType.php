<?php

declare(strict_types=1);

namespace App\Enums;

use App\Contracts\ExposableEnum;

enum PplType: string implements ExposableEnum
{
    case Push = 'push';
    case Pull = 'pull';
    case Legs = 'legs';

    public static function getIdentifier(): string
    {
        return 'ppl_type';
    }

    public function value(): string
    {
        return $this->value;
    }

    public function label(): string
    {
        return match ($this) {
            self::Push => trans('common.ppl_type.push'),
            self::Pull => trans('common.ppl_type.pull'),
            self::Legs => trans('common.ppl_type.legs'),
        };
    }
}
