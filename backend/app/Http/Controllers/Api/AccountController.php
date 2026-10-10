<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'data' => new UserResource($request->user()->load('person.student', 'person.supervisor')),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user()->loadMissing('person');
        $person = $user->person;

        abort_unless($person, 422, 'لا توجد بيانات شخصية مرتبطة بهذا الحساب.');

        // Gender is intentionally immutable here because it defines the account's
        // student-data access scope. It can only be corrected through a trusted
        // administrative workflow, never by the account owner.
        $data = $request->validate([
            'fname' => ['sometimes', 'required', 'string', 'max:100'],
            'lname' => ['sometimes', 'required', 'string', 'max:100'],
            'year_of_study' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:10'],
            'contact_number' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('persons', 'contact_number')->ignore($person->id),
            ],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'serial_number' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        DB::transaction(function () use ($user, $person, $data) {
            if (array_key_exists('email', $data)) {
                $user->update(['email' => $data['email']]);
                unset($data['email']);
            }

            if ($data !== []) {
                $person->update($data);
            }
        });

        return response()->json([
            'message' => 'تم تحديث الملف الشخصي بنجاح.',
            'data' => new UserResource($user->fresh()->load('person.student', 'person.supervisor')),
        ]);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($data['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['كلمة المرور الحالية غير صحيحة.'],
            ]);
        }

        $request->user()->update(['password' => $data['password']]);
        $request->user()->tokens()->where('id', '!=', optional($request->user()->currentAccessToken())->id)->delete();

        return response()->json([
            'message' => 'تم تغيير كلمة المرور بنجاح.',
        ]);
    }
}
