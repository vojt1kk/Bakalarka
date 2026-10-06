<?php

declare(strict_types=1);

namespace App\Enums;

enum FeedbackStatus: string
{
    case Ok = 'ok';
    case Warning = 'warning';
}
