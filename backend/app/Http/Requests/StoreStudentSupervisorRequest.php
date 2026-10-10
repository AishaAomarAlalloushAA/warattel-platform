<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\UserRole;

class StoreStudentSupervisorRequest extends FormRequest
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
        'student_id'  => 'required|exists:students,id',
        'assigned_at' => 'required|date',
        'retired_at'  => 'nullable|date|after_or_equal:assigned_at',
        'supervisor_id' => [
            'required',
            'exists:supervisors,id',
            Rule::unique('student_supervisors')
                ->where('student_id', request('student_id'))
                ->ignore($this->student_supervisor?->id),],
        ];
    }
}
