<?php

namespace App\Models;

use App\Enums\ExamType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    protected $fillable = [
        'part',
        'quantity',
        'exam_type',
        'exam_date',
        'score',
        'result',
        'supervisor_id',
        'student_level_id',
    ];

    protected $casts = [
        'exam_type' => ExamType::class,
        'exam_date' => 'date',
        'part' => 'integer',
        'quantity' => 'integer',
        'score' => 'integer',
    ];

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class);
    }

    public function studentLevel(): BelongsTo
    {
        return $this->belongsTo(StudentLevel::class);
    }

    public function examErrors(): HasMany
    {
        return $this->hasMany(ExamError::class);
    }

    public function getExamTypeLabelAttribute(): string
    {
        return $this->exam_type->label();
    }
}
