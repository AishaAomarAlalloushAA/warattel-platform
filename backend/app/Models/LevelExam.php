<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LevelExam extends Model
{
    protected $fillable = [
        'student_level_id',
        'target_level_id',
        'supervisor_id',
        'exam_date',
        'makharij_score',
        'ahkam_score',
        'fluency_score',
        'notes',
        'decision',
    ];

    protected $casts = [
        'exam_date' => 'date',
        'makharij_score' => 'integer',
        'ahkam_score' => 'integer',
        'fluency_score' => 'integer',
    ];

    public function studentLevel(): BelongsTo
    {
        return $this->belongsTo(StudentLevel::class);
    }

    public function targetLevel(): BelongsTo
    {
        return $this->belongsTo(Level::class, 'target_level_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class);
    }
}
