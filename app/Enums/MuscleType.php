<?php

declare(strict_types=1);

namespace App\Enums;

use App\Contracts\ExposableEnum;

enum MuscleType: string implements ExposableEnum
{
    case Calves = 'calves';
    case Quads = 'quads';
    case Hamstrings = 'hamstrings';
    case Glutes = 'glutes';
    case Abs = 'abs';
    case LowerBack = 'lower_back';
    case UpperBack = 'upper_back';
    case Biceps = 'biceps';
    case Forearms = 'forearms';
    case Triceps = 'triceps';
    case Chest = 'chest';
    case Shoulders = 'shoulders';
    case Lats = 'lats';
    case Core = 'core';
    case Trapezes = 'trapezes';

    public static function getIdentifier(): string
    {
        return 'muscle_type';
    }

    public function value(): string
    {
        return $this->value;
    }

    public function label(): string
    {
        return match ($this) {
            self::Calves => trans('common.muscle_type.calves'),
            self::Quads => trans('common.muscle_type.quads'),
            self::Hamstrings => trans('common.muscle_type.hamstrings'),
            self::Glutes => trans('common.muscle_type.glutes'),
            self::Abs => trans('common.muscle_type.abs'),
            self::LowerBack => trans('common.muscle_type.lower_back'),
            self::UpperBack => trans('common.muscle_type.upper_back'),
            self::Biceps => trans('common.muscle_type.biceps'),
            self::Forearms => trans('common.muscle_type.forearms'),
            self::Triceps => trans('common.muscle_type.triceps'),
            self::Chest => trans('common.muscle_type.chest'),
            self::Shoulders => trans('common.muscle_type.shoulders'),
            self::Lats => trans('common.muscle_type.lats'),
            self::Core => trans('common.muscle_type.core'),
            self::Trapezes => trans('common.muscle_type.trapezes'),
        };
    }
}
