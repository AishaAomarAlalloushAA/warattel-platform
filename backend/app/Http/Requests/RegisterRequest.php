<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fname' => ['required', 'string', 'max:100'],
            'lname' => ['required', 'string', 'max:100'],
            'gender' => ['required', 'in:male,female'],
            'year_of_study' => ['nullable', 'integer', 'min:1'],
            'contact_number' => ['required', 'string', 'max:20', 'unique:persons,contact_number'],
            'serial_number' => ['nullable', 'integer', 'min:1'],
            'address' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
