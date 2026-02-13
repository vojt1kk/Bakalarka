<?php

declare(strict_types=1);

namespace App\Enums;

enum PplType: string
{
    case Push = 'push';
    case Pull = 'pull';
    case Legs = 'legs';
}
