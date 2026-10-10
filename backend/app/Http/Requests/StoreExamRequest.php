<?php

namespace App\Http\Requests;

use App\Enums\ExamType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'part' => ['required', 'integer', 'min:1', 'max:30'],
            'quantity' => ['required', 'integer', 'min:1', 'max:30'],
            'exam_type' => ['required', Rule::in(array_column(ExamType::cases(), 'value'))],
            'exam_date' => ['required', 'date'],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'result' => ['nullable', Rule::in(['passed', 'failed'])],
            'student_level_id' => ['required', 'integer', 'exists:student_levels,id'],
            'supervisor_id' => ['required', 'integer', 'exists:supervisors,id'],
        ];
    }
}
