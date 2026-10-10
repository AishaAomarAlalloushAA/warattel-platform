<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\LevelType;
use Illuminate\Validation\Rule;
use App\Enums\UserRole;

class StoreLevelRequest extends FormRequest
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
        'name'        => ['required', Rule::in(array_column(LevelType::cases(), 'value'))],
        'description' => 'required|string',
        'plan'        => 'required|string',
         ];
    }
}





