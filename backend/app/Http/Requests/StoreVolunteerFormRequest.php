<?php

namespace App\Http\Requests;

use App\Enums\VolunteerFormType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVolunteerFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:30'],
            'telegram_username' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'year_of_study' => ['nullable', 'integer', 'min:1'],
            'additional_skills' => ['nullable', 'string', 'max:2000'],
            'form_type' => ['required', Rule::in(array_column(VolunteerFormType::cases(), 'value'))],
            'form_data' => ['required', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'يرجى إدخال الاسم الكامل.',
            'contact_number.required' => 'يرجى إدخال رقم التواصل.',
            'email.required' => 'يرجى إدخال البريد الإلكتروني.',
            'email.email' => 'يرجى إدخال بريد إلكتروني صحيح.',
            'form_type.required' => 'يرجى اختيار مجال التطوع.',
            'form_type.in' => 'مجال التطوع المحدد غير صحيح.',
            'form_data.required' => 'بيانات طلب التطوع مطلوبة.',
        ];
    }
}
