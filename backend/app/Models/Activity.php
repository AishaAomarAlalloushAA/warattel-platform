<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    protected $fillable = [
        'title',
        'gender',
        'activity_date',
        'activity_type_id',
        'coordinator_id',
        'presenter_id',
    ];

    protected $casts = [
        'activity_date' => 'date',
    ];

    /**
     * النشاط ينتمي إلى نوع نشاط واحد.
     */
    public function activityType(): BelongsTo
    {
        return $this->belongsTo(ActivityType::class);
    }

    /**
     * النشاط يديره منسق واحد (مشرف).
     */
    public function coordinator(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class, 'coordinator_id');
    }

    /**
     * النشاط يقدمه مشرف واحد.
     */
    public function presenter(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class, 'presenter_id');
    }


    public function studentActivities(): HasMany
    {
    return $this->hasMany(StudentActivity::class);
    }
}
