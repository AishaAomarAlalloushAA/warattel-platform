<?php

namespace App\Enums;

enum SupervisorRole: string
{
    case Musami = 'musami';       // مسمع
    case Musaid = 'musaid';       // مساعد
    case Mushrif = 'mushrif';     // مشرف

    public function label(): string
    {
        return match($this) {
            self::Musami => 'مسمع',
            self::Musaid => 'مساعد',
            self::Mushrif => 'مشرف',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
