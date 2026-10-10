<?php

namespace App\Http\Controllers\Api;

use App\Enums\GenderType;
use App\Enums\SupervisorRole;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Person;
use App\Models\Supervisor;
use App\Models\User;
use App\Support\EnforcesGenderScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminSupervisorAccountController extends Controller
{
    use EnforcesGenderScope;

    public function index(Request $request)
    {
        $gender = $this->actorGender($request);
        $query = User::query()
            ->with('person.supervisor')
            ->where('role', UserRole::Supervisor->value)
            ->whereHas('person', fn ($q) => $q->where('gender', $gender))
            ->latest('id');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhereHas('person', function ($personQuery) use ($search) {
                        $personQuery->where('fname', 'like', "%{$search}%")
                            ->orWhere('lname', 'like', "%{$search}%")
                            ->orWhere('contact_number', 'like', "%{$search}%");
                    });
            });
        }

        $items = $query->paginate(min(max($request->integer('per_page', 20), 1), 100));

        return response()->json([
            'data' => collect($items->items())->map(fn (User $user) => $this->payload($user))->values(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'fname' => ['required', 'string', 'max:100'],
            'lname' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'gender' => ['sometimes', Rule::in(array_column(GenderType::cases(), 'value'))],
            'contact_number' => ['required', 'string', 'max:20', Rule::unique('persons', 'contact_number')],
            'year_of_study' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:10'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'serial_number' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'join_date' => ['sometimes', 'nullable', 'date'],
        ], [
            'fname.required' => 'يرجى إدخال الاسم الأول.',
            'lname.required' => 'يرجى إدخال اسم العائلة.',
            'email.required' => 'يرجى إدخال البريد الإلكتروني.',
            'email.email' => 'يرجى إدخال بريد إلكتروني صحيح.',
            'email.unique' => 'البريد الإلكتروني مستخدم مسبقاً.',
            'password.required' => 'يرجى إدخال كلمة المرور.',
            'password.min' => 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
            'contact_number.required' => 'يرجى إدخال رقم التواصل.',
            'contact_number.unique' => 'رقم التواصل مستخدم مسبقاً.',
        ]);

        $actorGender = $this->actorGender($request);
        if (isset($data['gender']) && $data['gender'] !== $actorGender) {
            throw ValidationException::withMessages([
                'gender' => ['لا يمكنك إضافة مشرف من الجنس الآخر.'],
            ]);
        }

        $user = DB::transaction(function () use ($data, $actorGender) {
            $user = User::create([
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => UserRole::Supervisor,
            ]);

            $person = Person::create([
                'user_id' => $user->id,
                'fname' => $data['fname'],
                'lname' => $data['lname'],
                'gender' => $actorGender,
                'year_of_study' => $data['year_of_study'] ?? null,
                'contact_number' => $data['contact_number'],
                'join_date' => $data['join_date'] ?? now()->toDateString(),
                'address' => $data['address'] ?? null,
                'serial_number' => $data['serial_number'] ?? null,
            ]);

            Supervisor::create([
                'person_id' => $person->id,
                'role' => SupervisorRole::Mushrif,
                'became_supervisor_at' => $data['join_date'] ?? now()->toDateString(),
                'retired_at' => null,
                'aider_id' => null,
            ]);

            return $user->load('person.supervisor');
        });

        return response()->json([
            'message' => $actorGender === GenderType::Female->value
                ? 'تمت إضافة المشرفة بنجاح.'
                : 'تمت إضافة المشرف بنجاح.',
            'data' => $this->payload($user),
        ], 201);
    }

    private function payload(User $user): array
    {
        $user->loadMissing('person.supervisor');
        $person = $user->person;

        return [
            'id' => $user->id,
            'supervisor_id' => $person?->supervisor?->id,
            'email' => $user->email,
            'full_name' => $person ? trim($person->fname . ' ' . $person->lname) : '',
            'gender' => $person?->gender?->value,
            'gender_label' => $person?->gender?->label(),
            'contact_number' => $person?->contact_number,
            'join_date' => optional($person?->join_date)->toDateString(),
            'address' => $person?->address,
        ];
    }
}
