<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class ReportError extends Model
{
    protected $fillable = [
        'error_word',
        'details',
        'report_id',
        'error_id',
    ];

    /**
     * ينتمي إلى تقرير واحد.
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    /**
     * ينتمي إلى نوع خطأ واحد.
     */
    public function error(): BelongsTo
    {
        return $this->belongsTo(Error::class);
    }
}
