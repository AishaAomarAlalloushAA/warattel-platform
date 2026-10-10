<?php

namespace App\Models;

use App\Enums\SupervisorRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supervisor extends Model
{
    protected $fillable = [
        'person_id',
        'role',
        'aider_id',
        'became_supervisor_at',
        'retired_at',
    ];

    protected $casts = [
        'role' => SupervisorRole::class,
        'became_supervisor_at' => 'date',
        'retired_at' => 'date',
    ];

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function aider(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class, 'aider_id');
    }

    public function assistedSupervisors(): HasMany
    {
        return $this->hasMany(Supervisor::class, 'aider_id');
    }

    public function studentSupervisors(): HasMany
    {
        return $this->hasMany(StudentSupervisor::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    public function levelExams(): HasMany
    {
        return $this->hasMany(LevelExam::class);
    }

    public function coordinatedActivities(): HasMany
    {
        return $this->hasMany(Activity::class, 'coordinator_id');
    }

    public function presentedActivities(): HasMany
    {
        return $this->hasMany(Activity::class, 'presenter_id');
    }
}
