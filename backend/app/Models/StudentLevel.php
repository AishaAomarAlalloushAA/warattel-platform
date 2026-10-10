<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentLevel extends Model
{
    protected $fillable = [
        'student_id',
        'level_id',
        'reached_at',
    ];

    protected $casts = [
        'reached_at' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    public function levelExams(): HasMany
    {
        return $this->hasMany(LevelExam::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
