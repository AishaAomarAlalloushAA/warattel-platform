<?php

namespace App\Http\Controllers\Api;

use App\Enums\AchievementType;
use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\Student;
use App\Support\EnforcesGenderScope;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AchievementController extends Controller
{
    use EnforcesGenderScope;

    public function index(Request $request)
    {
        $query = Achievement::with('student.person')->orderByDesc('achieved_at')->orderByDesc('id');
        $this->scopeStudentRelationByActorGender($query, $request, 'student.person');

        if ($request->filled('student_id')) $query->where('student_id', $request->integer('student_id'));
        if ($request->filled('type')) $query->where('type', $request->string('type'));

        return response()->json(['data' => $query->paginate(20)]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $this->ensureStudentGender(Student::findOrFail($data['student_id']), $request);
        $achievement = Achievement::create($data);

        return response()->json([
            'message' => 'تمت إضافة الإنجاز بنجاح.',
            'data' => $achievement->load('student.person'),
        ], 201);
    }

    public function show(Request $request, Achievement $achievement)
    {
        $this->ensureAchievementGender($achievement, $request);
        return response()->json(['data' => $achievement->load('student.person')]);
    }

    public function update(Request $request, Achievement $achievement)
    {
        $this->ensureAchievementGender($achievement, $request);
        $data = $this->validated($request, true);
        if (!empty($data['student_id'])) $this->ensureStudentGender(Student::findOrFail($data['student_id']), $request);
        $achievement->update($data);

        return response()->json([
            'message' => 'تم تحديث الإنجاز بنجاح.',
            'data' => $achievement->fresh()->load('student.person'),
        ]);
    }

    public function destroy(Request $request, Achievement $achievement)
    {
        $this->ensureAchievementGender($achievement, $request);
        $achievement->delete();
        return response()->json(['message' => 'تم حذف الإنجاز بنجاح.']);
    }

    private function ensureAchievementGender(Achievement $achievement, Request $request): void
    {
        $achievement->loadMissing('student.person');
        abort_unless($achievement->student, 404, 'الطالب المرتبط بالإنجاز غير موجود.');
        $this->ensureStudentGender($achievement->student, $request);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        $types = array_map(fn ($case) => $case->value, AchievementType::cases());

        return $request->validate([
            'student_id' => [$required, 'integer', 'exists:students,id'],
            'type' => [$required, Rule::in($types)],
            'title' => [$required, 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'achieved_at' => [$required, 'date'],
        ]);
    }
}
