<?php

namespace App\Models;


use App\Enums\VolunteerFormType;
use App\Enums\VolunteerFormStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class VolunteerForm extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'contact_number',
        'telegram_username',
        'email',
        'year_of_study',
        'additional_skills',
        'form_type', 'status',
        'form_data',
        'admin_response',];

    protected $casts = [
        'year_of_study' => 'integer',
        'form_type' => VolunteerFormType::class,
        'status'    => VolunteerFormStatus::class,
        'form_data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accessors للترجمة
    public function getFormTypeLabelAttribute(): string
    {
        return $this->form_type->label();
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status->label();
    }
}
