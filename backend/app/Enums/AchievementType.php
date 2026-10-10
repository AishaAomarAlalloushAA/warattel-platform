<?php

namespace App\Enums;

enum AchievementType: string
{
    case Hifz = 'hifz';          // حفظ
    case Tilawa = 'tilawa';      // تلاوة
    case Tajwid = 'tajwid';      // تجويد
    case Other = 'other';        // غير ذلك

    public function label(): string
    {
        return match($this) {
            self::Hifz => 'حفظ',
            self::Tilawa => 'تلاوة',
            self::Tajwid => 'تجويد',
            self::Other => 'غير ذلك',
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
