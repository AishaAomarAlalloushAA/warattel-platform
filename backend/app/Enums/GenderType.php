<?php
namespace App\Enums;

enum GenderType: string
{
    case Male = 'male';
    case Female = 'female';

    public function label(): string
    {
        return match($this) {
            self::Male => 'ذكر',
            self::Female => 'أنثى',
        };
    }

    public static function options(): array
    {
        return array_map(fn($case) => ['value' => $case->value, 'label' => $case->label()], self::cases());
    }
}
