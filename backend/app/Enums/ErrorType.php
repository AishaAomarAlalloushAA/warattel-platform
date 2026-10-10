<?php

namespace App\Enums;

enum ErrorType: string
{
    case Tashkili = 'tashkili';   // تشكيلي
    case Hifzi = 'hifzi';         // حفظي
    case Tajwidi = 'tajwidi';     // تجويدي

    /**
     * ترجمة الحالة إلى العربية.
     */
    public function label(): string
    {
        return match($this) {
            self::Tashkili => 'تشكيلي',
            self::Hifzi => 'حفظي',
            self::Tajwidi => 'تجويدي',
        };
    }

    /**
     * إرجاع جميع الخيارات مع الترجمة (للقوائم المنسدلة).
     */
    public static function options(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
