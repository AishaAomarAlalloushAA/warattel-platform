<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\UserRole;

class StoreActivityRequest extends FormRequest
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
        'title'            => 'required|string|max:255',
        'gender'           => 'required|in:all,male,female',
        'activity_date'    => 'required|date',
        'activity_type_id' => 'required|exists:activity_types,id',
        'coordinator_id'   => 'nullable|exists:supervisors,id',
        'presenter_id'     => 'nullable|exists:supervisors,id',
    ];
    }
}
