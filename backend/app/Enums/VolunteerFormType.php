<?php

namespace App\Enums;

enum VolunteerFormType: string
{
    case Photography = 'photography';//تصوير
    case Design = 'design';//تصميم
    case Media = 'media';//اعلام
    case Organization = 'organization';//تنظيم

    public function label(): string
    {
        return match($this) {
            self::Photography => 'تصوير',
            self::Design => 'تصميم',
            self::Media => 'إعلام',
            self::Organization => 'تنظيم',
        };
    }

    public static function options(): array
    {
        return array_map(fn($case) => ['value' => $case->value, 'label' => $case->label()], self::cases());
    }
}
