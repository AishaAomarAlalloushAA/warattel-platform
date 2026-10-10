<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentSupervisor extends Model
{
    protected $fillable = [
        'student_id',
        'supervisor_id',
        'assigned_at',
        'retired_at',
    ];

    protected $casts = [
        'assigned_at' => 'date',
        'retired_at'   => 'date',
    ];

    /**
     * ينتمي إلى طالب واحد.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * ينتمي إلى مشرف واحد.
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class);
    }

    public function reports(): HasMany
    {
    return $this->hasMany(Report::class);
    }
}
