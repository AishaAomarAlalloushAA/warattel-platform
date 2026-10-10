<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\UserRole;
use App\Enums\ErrorType;

class StoreErrorRequest extends FormRequest
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
        'error_type' => ['required', Rule::in(array_column(ErrorType::cases(), 'value'))],
        'score'      => 'required|integer|min:0|max:100', ];
    }
}
