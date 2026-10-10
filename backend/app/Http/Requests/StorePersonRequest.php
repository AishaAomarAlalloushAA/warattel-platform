<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\GenderType;
use Illuminate\Validation\Rule;
use App\Enums\UserRole;

class StorePersonRequest extends FormRequest
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
        'fname'          => 'required|string|max:255',
        'lname'          => 'required|string|max:255',
        'gender'         => ['required', Rule::in(array_column(GenderType::cases(), 'value'))],
        'year_of_study'  => 'nullable|integer|min:1|max:5',
        'contact_number' =>[ 'required', 'string','regex:/^\+?[0-9]+$/',// أرقام لاتينية فقط (0-9)،مسموح رقم مبدوء برمز البلد, أي طول
        Rule::unique('persons', 'contact_number'),],
        'join_date'      => 'required|date',
        'address'        => 'nullable|string',
        'achievements'   => 'nullable|string',
          'email'    => 'required|email|unique:persons,email', // التحقق من فريدة البريد في جدول persons
        'password' => 'required|string|size:8|regex:/^[a-zA-Z0-9]+$/',
    ];
    }
public function messages(): array
{
    return [
        'email.required' => 'البريد الإلكتروني مطلوب.',
        'email.email' => 'صيغة البريد الإلكتروني غير صحيحة.',
        'email.unique' => 'هذا البريد الإلكتروني مسجل مسبقاً.',
        'password.required' => 'كلمة المرور مطلوبة.',
        'password.size' => 'كلمة المرور يجب أن تكون 4 محارف بالضبط.',
        'password.regex' => 'كلمة المرور يجب أن تحتوي على أحرف إنجليزية وأرقام فقط.',
    ];
}
}

