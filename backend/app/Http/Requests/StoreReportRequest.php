<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\UserRole;

class StoreReportRequest extends FormRequest
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
        'start_page'           => 'required|integer|min:1',
        'quantity'             => 'required|integer|min:1',
        'report_date'          => 'required|date',
        'student_level_id'     => 'required|exists:student_levels,id',
        'student_supervisor_id'=> 'required|exists:student_supervisors,id',
    ];
    }
}
