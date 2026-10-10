<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\VolunteerFormStatus;
use App\Enums\VolunteerFormType;
use Illuminate\Validation\Rule;
use App\Enums\UserRole;


class UpdateVolunteerFormRequest extends FormRequest
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
            'name' =>              [ 'sometimes', 'string','max:255', ],
            'contact_number' =>    ['sometimes', 'string', 'max:30', ],
            'telegram_username' => ['sometimes', 'nullable','string','max:255', ],
            'email' =>             ['sometimes','email','max:255', ],
            'year_of_study' =>     [ 'sometimes', 'nullable','integer','min:1', ],
            'additional_skills' => ['sometimes','nullable','string', ],
            'form_type' =>         [ 'sometimes',
                  Rule::in(array_column(VolunteerFormType::cases(), 'value')),],
            'form_data' =>         ['sometimes','nullable','array', ],
            'admin_response' =>    ['sometimes','nullable','string', ],
            'status' =>            ['sometimes', Rule::in(array_column(VolunteerFormStatus::cases(), 'value'))],
    ];
    }
}
