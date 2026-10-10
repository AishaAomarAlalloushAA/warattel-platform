<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamError extends Model
{
    protected $fillable = [
        'error_word',
        'details',
        'exam_id',
        'error_id',
    ];

    /**
     * ينتمي إلى امتحان واحد.
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * ينتمي إلى نوع خطأ واحد.
     */
    public function error(): BelongsTo
    {
        return $this->belongsTo(Error::class);
    }
}
