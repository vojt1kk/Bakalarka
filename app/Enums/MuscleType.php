<?php

declare(strict_types=1);

namespace App\Enums;

enum MuscleType: string
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
}
