<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Supervisor = 'supervisor';
    case Student = 'student';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'مدير النظام',
            self::Supervisor => 'مشرف',
            self::Student => 'طالب',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn ($case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases()
        );
    }
}
