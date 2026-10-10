<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\SupervisorRole;
use App\Enums\UserRole;
use Illuminate\Validation\Rule;
class UpdateSupervisorRequest extends FormRequest
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
             'role'                 => ['sometimes', Rule::in(array_column(SupervisorRole::cases(), 'value'))],
        'retired_at'           => 'nullable|date',
        'aider_id'             => 'nullable|exists:supervisors,id',
        ];
    }
}
