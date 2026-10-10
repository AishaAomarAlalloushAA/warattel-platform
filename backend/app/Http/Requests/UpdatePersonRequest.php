<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\GenderType;
use App\Enums\UserRole;

class UpdatePersonRequest extends FormRequest
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

         return
        [
        'fname'          => 'sometimes|string|max:255',
        'lname'          => 'sometimes|string|max:255',
        'gender'         => ['sometimes', Rule::in(array_column(GenderType::cases(), 'value'))],
        'year_of_study'  => 'nullable|integer|min:1|max:5',
        'contact_number' => ['sometimes','string','regex:/^\+?[0-9]+$/',
            Rule::unique('persons', 'contact_number')->ignore($this->person?->id),],
        'join_date'      => 'sometimes|date',
        'address'        => 'nullable|string',
        'achievements'   => 'nullable|string',
        'email'          => 'sometimes|string|max:255',
        ];
    }
}

