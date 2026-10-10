<?php

namespace App\Models;

use App\Enums\LevelType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Level extends Model
{
    protected $fillable = ['name', 'description', 'plan'];

    protected $casts = [
        'name' => LevelType::class,   // يحول القيمة تلقائياً إلى enum
    ];

    public function studentLevels(): HasMany
    {
        return $this->hasMany(StudentLevel::class);
    }
    /**
     * الوصول المباشر للترجمة العربية.
     */
    public function getNameLabelAttribute(): string
    {
        return $this->name->label();
    }


}
