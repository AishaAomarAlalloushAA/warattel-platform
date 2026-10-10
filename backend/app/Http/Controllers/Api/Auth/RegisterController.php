<?php

namespace App\Http\Controllers\Api\Auth;

use App\Enums\StudentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Person;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $result = DB::transaction(function () use ($data) {
            $user = User::create([
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => UserRole::Student,
            ]);

            $person = Person::create([
                'user_id' => $user->id,
                'fname' => $data['fname'],
                'lname' => $data['lname'],
                'gender' => $data['gender'],
                'year_of_study' => $data['year_of_study'] ?? null,
                'contact_number' => $data['contact_number'],
                'serial_number' => $data['serial_number'] ?? null,
                'address' => $data['address'] ?? null,
                'join_date' => now()->toDateString(),
            ]);

            Student::create([
                'person_id' => $person->id,
                'status' => StudentStatus::Active,
            ]);

            return [
                'user' => $user->load('person.student'),
                'token' => $user->createToken('api-token')->plainTextToken,
            ];
        });

        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح.',
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ], 201);
    }
}
