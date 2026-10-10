<?php

namespace App\Http\Controllers\Api;

use App\Enums\GenderType;
use App\Enums\StudentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Person;
use App\Models\Student;
use App\Models\StudentLevel;
use App\Models\StudentSupervisor;
use App\Models\User;
use App\Support\EnforcesGenderScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminStudentController extends Controller
{
    use EnforcesGenderScope;

    public function index(Request $request)
    {
        $query = Student::query()
            ->with(['person.user', 'studentLevels.level', 'studentSupervisors.supervisor.person'])
            ->latest('id');

        $this->scopeStudentsByActorGender($query, $request);

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->whereHas('person', function ($q) use ($search) {
                $q->where(function ($nested) use ($search) {
                    $nested->where('fname', 'like', "%{$search}%")
                        ->orWhere('lname', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('email', 'like', "%{$search}%"));
                });
            });
        }

        if ($request->filled('status')) $query->where('status', $request->string('status'));
        if ($request->filled('level')) {
            $level = $request->string('level');
            $query->whereHas('studentLevels.level', fn ($q) => $q->where('name', $level));
        }

        $students = $query->paginate(min(max($request->integer('per_page', 20), 1), 100));

        return response()->json([
            'data' => collect($students->items())->map(fn (Student $student) => $this->payload($student))->values(),
            'meta' => [
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
            ],
            'scope' => ['gender' => $this->actorGender($request)],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['gender'] = $this->ensurePayloadGender($data['gender'] ?? null, $request);
        $this->ensureSupervisorGender($data['supervisor_id'] ?? null, $request);

        $student = DB::transaction(function () use ($data) {
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
                'join_date' => $data['join_date'] ?? now()->toDateString(),
            ]);

            $student = Student::create([
                'person_id' => $person->id,
                'status' => $data['status'] ?? StudentStatus::Active->value,
            ]);

            if (!empty($data['level_id'])) {
                StudentLevel::create([
                    'student_id' => $student->id,
                    'level_id' => $data['level_id'],
                    'reached_at' => $data['reached_at'] ?? now()->toDateString(),
                ]);
            }

            if (!empty($data['supervisor_id'])) {
                StudentSupervisor::create([
                    'student_id' => $student->id,
                    'supervisor_id' => $data['supervisor_id'],
                    'assigned_at' => now()->toDateString(),
                ]);
            }

            return $student;
        });

        return response()->json([
            'message' => 'تمت إضافة الطالب بنجاح.',
            'data' => $this->payload($this->load($student)),
        ], 201);
    }

    public function show(Request $request, Student $student)
    {
        $this->ensureStudentGender($student, $request);
        return response()->json(['data' => $this->payload($this->load($student))]);
    }

    public function update(Request $request, Student $student)
    {
        $this->ensureStudentGender($student, $request);
        $data = $this->validated($request, $student, true);

        if (array_key_exists('gender', $data)) {
            $data['gender'] = $this->ensurePayloadGender($data['gender'], $request);
        }
        $this->ensureSupervisorGender($data['supervisor_id'] ?? null, $request);

        DB::transaction(function () use ($data, $student) {
            $student->loadMissing('person.user', 'studentLevels', 'studentSupervisors');
            $person = $student->person;
            $user = $person?->user;

            if ($user && array_key_exists('email', $data)) $user->update(['email' => $data['email']]);
            if ($user && !empty($data['password'])) $user->update(['password' => $data['password']]);

            if ($person) {
                $personFields = collect($data)->only([
                    'fname', 'lname', 'gender', 'year_of_study', 'contact_number',
                    'serial_number', 'address', 'join_date',
                ])->all();
                if ($personFields !== []) $person->update($personFields);
            }

            if (array_key_exists('status', $data)) $student->update(['status' => $data['status']]);

            if (array_key_exists('level_id', $data) && $data['level_id']) {
                $current = $student->studentLevels
                    ->sortByDesc(fn ($item) => ($item->reached_at?->timestamp ?? 0) . '-' . $item->id)
                    ->first();
                if (!$current || (int) $current->level_id !== (int) $data['level_id']) {
                    StudentLevel::create([
                        'student_id' => $student->id,
                        'level_id' => $data['level_id'],
                        'reached_at' => $data['reached_at'] ?? now()->toDateString(),
                    ]);
                }
            }

            if (array_key_exists('supervisor_id', $data)) {
                $active = $student->studentSupervisors->whereNull('retired_at')->sortByDesc('id')->first();
                $newSupervisorId = $data['supervisor_id'];

                if ($active && (int) $active->supervisor_id !== (int) $newSupervisorId) {
                    $active->update(['retired_at' => now()->toDateString()]);
                }
                if ($newSupervisorId && (!$active || (int) $active->supervisor_id !== (int) $newSupervisorId)) {
                    StudentSupervisor::create([
                        'student_id' => $student->id,
                        'supervisor_id' => $newSupervisorId,
                        'assigned_at' => now()->toDateString(),
                    ]);
                }
            }
        });

        return response()->json([
            'message' => 'تم تحديث بيانات الطالب بنجاح.',
            'data' => $this->payload($this->load($student->fresh())),
        ]);
    }

    private function validated(Request $request, ?Student $student = null, bool $partial = false): array
    {
        $person = $student?->person;
        $user = $person?->user;
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'fname' => [$required, 'string', 'max:100'],
            'lname' => [$required, 'string', 'max:100'],
            'email' => [$required, 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'password' => [$partial ? 'sometimes' : 'required', 'nullable', 'string', 'min:8'],
            'gender' => [$required, Rule::in(array_column(GenderType::cases(), 'value'))],
            'year_of_study' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:10'],
            'contact_number' => [$required, 'string', 'max:20', Rule::unique('persons', 'contact_number')->ignore($person?->id)],
            'serial_number' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'join_date' => ['sometimes', 'date'],
            'status' => ['sometimes', Rule::in(array_column(StudentStatus::cases(), 'value'))],
            'level_id' => ['sometimes', 'nullable', 'integer', 'exists:levels,id'],
            'reached_at' => ['sometimes', 'nullable', 'date'],
            'supervisor_id' => ['sometimes', 'nullable', 'integer', 'exists:supervisors,id'],
        ]);
    }

    private function load(Student $student): Student
    {
        return $student->load(['person.user', 'studentLevels.level', 'studentSupervisors.supervisor.person']);
    }

    private function payload(Student $student): array
    {
        $person = $student->person;
        $currentLevel = $student->studentLevels
            ->sortByDesc(fn ($item) => sprintf('%s-%010d', optional($item->reached_at)->format('Ymd') ?? '00000000', $item->id))
            ->first();
        $currentSupervisor = $student->studentSupervisors->whereNull('retired_at')->sortByDesc('id')->first();
        $supervisorPerson = $currentSupervisor?->supervisor?->person;

        return [
            'id' => $student->id,
            'status' => $student->status?->value,
            'status_label' => $student->status?->label(),
            'person' => $person ? [
                'id' => $person->id,
                'fname' => $person->fname,
                'lname' => $person->lname,
                'full_name' => trim($person->fname . ' ' . $person->lname),
                'email' => $person->user?->email,
                'gender' => $person->gender?->value,
                'gender_label' => $person->gender?->label(),
                'year_of_study' => $person->year_of_study,
                'contact_number' => $person->contact_number,
                'serial_number' => $person->serial_number,
                'address' => $person->address,
                'join_date' => optional($person->join_date)->toDateString(),
            ] : null,
            'current_level' => $currentLevel ? [
                'student_level_id' => $currentLevel->id,
                'level_id' => $currentLevel->level_id,
                'value' => $currentLevel->level?->name?->value,
                'label' => $currentLevel->level?->name?->label(),
                'plan' => $currentLevel->level?->plan,
                'description' => $currentLevel->level?->description,
                'reached_at' => optional($currentLevel->reached_at)->toDateString(),
            ] : null,
            'current_supervisor' => $currentSupervisor ? [
                'student_supervisor_id' => $currentSupervisor->id,
                'supervisor_id' => $currentSupervisor->supervisor_id,
                'name' => $supervisorPerson ? trim($supervisorPerson->fname . ' ' . $supervisorPerson->lname) : null,
            ] : null,
        ];
    }
}
