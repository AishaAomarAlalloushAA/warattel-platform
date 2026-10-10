<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\UserRole;

class StoreExamErrorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
{
    return auth()->check()
        && in_array(auth()->user()->role, [
            UserRole::Admin,
            UserRole::Supervisor,
        ], true);
}

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         return [
        'exam_id'    => 'required|exists:exams,id',
        'error_id'   => 'required|exists:errors,id',
        'details'    => 'nullable|string',
        'error_word' => 'nullable|string|max:255',
    ];
    }
}
