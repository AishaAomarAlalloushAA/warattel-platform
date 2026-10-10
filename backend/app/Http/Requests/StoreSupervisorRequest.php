<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\SupervisorRole;
use App\Enums\UserRole;

class StoreSupervisorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
   public function authorize(): bool
{
    return auth()->check()
        && auth()->user()->role === UserRole::Admin;
}

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
        'person_id'            => 'required|exists:persons,id',
        'role'                 => ['required', Rule::in(array_column(SupervisorRole::cases(), 'value'))],
        'became_supervisor_at' => 'required|date',
        'retired_at'           => 'nullable|date',
        'aider_id'             => 'nullable|exists:supervisors,id',
    ];
}


    }
