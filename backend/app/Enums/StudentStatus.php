<?php

namespace App\Enums;

enum StudentStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Graduated = 'graduated';

    // دالة لإرجاع الترجمة العربية للعرض في الواجهة
    public function label(): string
    {
        return match($this) {
            self::Active => 'نشط',
            self::Inactive => 'منقطع',
            self::Graduated => 'متخرج',
        };
    }
    // في StudentStatus.php
    public static function options(): array
    {
    return array_map(
        fn($case) => ['value' => $case->value, 'label' => $case->label()],
        self::cases()
    );
    }
}

