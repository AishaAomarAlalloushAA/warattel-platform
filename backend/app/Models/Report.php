<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
 use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    protected $fillable = [
        'start_page',
        'quantity',
        'report_date',
        'student_level_id',
        'student_supervisor_id',
    ];

    protected $casts = [
        'report_date' => 'date',
        'start_page'  => 'integer',
        'quantity'    => 'integer',
    ];

    /**
     * التقرير مرتبط بسجل مستوى طالب محدد.
     */
    public function studentLevel(): BelongsTo
    {
        return $this->belongsTo(StudentLevel::class);
    }

    /**
     * التقرير مرتبط بعلاقة طالب-مشرف المحددة.
     */
    public function studentSupervisor(): BelongsTo
    {
        return $this->belongsTo(StudentSupervisor::class);
    }

    public function reportErrors(): HasMany
    {
    return $this->hasMany(ReportError::class);
    }
}
