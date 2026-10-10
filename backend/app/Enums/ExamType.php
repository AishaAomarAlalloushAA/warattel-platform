<?php

namespace App\Enums;

enum ExamType: string
{
    case Intiqali = 'intiqali';   // انتقالي
    case Marhali = 'marhali';     // مرحلي

    public function label(): string
    {
        return match($this) {
            self::Intiqali => 'انتقالي',
            self::Marhali => 'مرحلي',
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
