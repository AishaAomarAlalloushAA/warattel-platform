<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'role' => ['sometimes', 'nullable', Rule::in(['student', 'admin', 'supervisor'])],
        ]);

        $credentials = [
            'email' => $data['email'],
            'password' => $data['password'],
        ];

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'بيانات الدخول غير صحيحة.'], 401);
        }

        $user = Auth::user()->load('person.student', 'person.supervisor');

        if (!empty($data['role']) && $user->role?->value !== $data['role']) {
            Auth::logout();

            return response()->json([
                'message' => 'نوع الحساب لا يطابق الحساب المسجل بهذا البريد.',
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح.',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }
}
