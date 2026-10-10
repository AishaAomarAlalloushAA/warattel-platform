<?php

namespace App\Models;

use App\Enums\ErrorType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Error extends Model
{
    protected $fillable = ['error_type', 'score'];

    protected $casts = [
        'error_type' => ErrorType::class,
        'score' => 'integer',
    ];

    public function examErrors(): HasMany
    {
        return $this->hasMany(ExamError::class);
    }

    public function reportErrors(): HasMany
    {
        return $this->hasMany(ReportError::class);
    }

    public function getTypeAttribute(): ?ErrorType
    {
        return $this->error_type;
    }

    public function getErrorTypeLabelAttribute(): string
    {
        return $this->error_type->label();
    }
}
