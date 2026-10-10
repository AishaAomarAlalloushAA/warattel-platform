<?php

namespace App\Enums;

enum LevelType: string
{
    case Tilawa = 'tilawa';       // تلاوة
    case Ghaybi = 'ghaybi';       // غيبي
    case Intiqali = 'intiqali';   // انتقالي

    /**
     * الترجمة العربية للحالة.
     */
    public function label(): string
    {
        return match($this) {
            self::Tilawa => 'تلاوة',
            self::Ghaybi => 'غيبي',
            self::Intiqali => 'انتقالي',
        };
    }

    /**
     * جميع الخيارات للواجهات الديناميكية.
     */
    public static function options(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
