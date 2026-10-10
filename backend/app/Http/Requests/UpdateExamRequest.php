<?php

namespace App\Http\Requests;

use App\Enums\ExamType;
use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check()
            && in_array(auth()->user()->role, [UserRole::Admin, UserRole::Supervisor], true);
    }

    public function rules(): array
    {
        return [
            'part' => ['sometimes', 'integer', 'min:1', 'max:30'],
            'quantity' => ['sometimes', 'integer', 'min:1', 'max:30'],
            'exam_type' => ['sometimes', Rule::in(array_column(ExamType::cases(), 'value'))],
            'exam_date' => ['sometimes', 'date'],
            'score' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100'],
            'result' => ['sometimes', 'nullable', Rule::in(['passed', 'failed'])],
            'supervisor_id' => ['sometimes', 'integer', 'exists:supervisors,id'],
            'student_level_id' => ['sometimes', 'integer', 'exists:student_levels,id'],
        ];
    }
}
