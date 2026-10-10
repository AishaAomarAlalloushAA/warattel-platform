<?php

namespace App\Models;

use App\Enums\AchievementType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Achievement extends Model
{
    protected $fillable = [
        'student_id',
        'type',
        'title',
        'description',
        'achieved_at',
    ];

    protected $casts = [
        'type' => AchievementType::class,
        'achieved_at' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
