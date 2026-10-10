<?php

namespace App\Enums;
enum VolunteerFormStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::Pending => 'قيد المراجعة',
            self::Accepted => 'مقبول',
            self::Rejected => 'مرفوض',
        };
    }

    public static function options(): array
    {
        return array_map(fn($case) => ['value' => $case->value, 'label' => $case->label()], self::cases());
    }
}
