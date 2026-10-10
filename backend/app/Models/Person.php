<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\GenderType;
class Person extends Model
{
     protected $table = 'persons';
    // الأعمدة القابلة للتعبئة
    protected $fillable = [
        'user_id',
        'fname',
        'lname',
        'year_of_study',
        'contact_number',
        'join_date',
        'address',
        'serial_number',
        'gender',
        'achievements',
    ];


    protected function casts(): array
    {
    return [
        'gender' => GenderType::class,
        'join_date' => 'date',
    ];
    }

    /**
     * العلاقة مع جدول students (واحد-إلى-واحد)
     */
    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    /**
     * العلاقة مع جدول supervisors (واحد-إلى-واحد)
     */
    public function supervisor(): HasOne
    {
        return $this->hasOne(Supervisor::class);
    }



public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}

}

