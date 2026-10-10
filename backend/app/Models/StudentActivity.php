<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentActivity extends Model
{
    protected $fillable = ['activity_id', 'student_id'];

    /**
     * السجل ينتمي إلى نشاط واحد.
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    /**
     * السجل ينتمي إلى طالب واحد.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
