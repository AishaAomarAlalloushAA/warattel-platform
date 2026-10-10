<?php

namespace App\Models;

use App\Enums\StudentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = ['status', 'person_id'];

    protected $casts = [
        'status' => StudentStatus::class,
    ];

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function studentLevels(): HasMany
    {
        return $this->hasMany(StudentLevel::class);
    }

    public function studentSupervisors(): HasMany
    {
        return $this->hasMany(StudentSupervisor::class);
    }

    public function studentActivities(): HasMany
    {
        return $this->hasMany(StudentActivity::class);
    }

    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status->label();
    }
}
