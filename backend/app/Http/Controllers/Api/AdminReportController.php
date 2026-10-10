<?php

namespace App\Http\Controllers\Api;

use App\Enums\ErrorType;
use App\Http\Controllers\Controller;
use App\Models\Error;
use App\Models\Report;
use App\Models\ReportError;
use App\Models\Student;
use App\Models\StudentSupervisor;
use App\Support\EnforcesGenderScope;
use App\Support\RestrictsSupervisorScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminReportController extends Controller
{
    use EnforcesGenderScope;
    use RestrictsSupervisorScope;

    public function index(Request $request)
    {
        $query = Report::with([
            'studentLevel.level',
            'studentLevel.student.person',
            'studentSupervisor.supervisor.person',
            'reportErrors.error',
        ])->orderByDesc('report_date')->orderByDesc('id');

        $this->scopeStudentRelationByActorGender($query, $request, 'studentLevel.student.person');

        if ($this->isSupervisorActor($request)) {
            $query->whereHas('studentSupervisor', fn ($q) => $q->where('supervisor_id', $this->actorSupervisorId($request)));
        }

        if ($request->filled('student_id')) {
            $student = Student::findOrFail($request->integer('student_id'));
            $this->ensureStudentGender($student, $request);
            $this->ensureAssignedStudent($student, $request);
            $query->whereHas('studentLevel', fn ($q) => $q->where('student_id', $student->id));
        }
        if ($request->filled('date_from')) $query->whereDate('report_date', '>=', $request->date('date_from'));
        if ($request->filled('date_to')) $query->whereDate('report_date', '<=', $request->date('date_to'));

        $reports = $query->paginate(min(max($request->integer('per_page', 30), 1), 100));

        return response()->json([
            'data' => collect($reports->items())->map(fn (Report $report) => $this->payload($report))->values(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $student = Student::findOrFail($data['student_id']);
        $this->ensureStudentGender($student, $request);
        $this->ensureAssignedStudent($student, $request);

        $data['supervisor_id'] = $this->resolvedSupervisorId($data['supervisor_id'] ?? null, $request);
        $this->ensureSupervisorGender($data['supervisor_id'] ?? null, $request);

        $report = DB::transaction(function () use ($data) {
            [$studentLevel, $studentSupervisor] = $this->resolveRelations($data['student_id'], $data['supervisor_id'] ?? null, false);
            $report = Report::create([
                'start_page' => $data['start_page'],
                'quantity' => $data['quantity'],
                'report_date' => $data['report_date'],
                'student_level_id' => $studentLevel->id,
                'student_supervisor_id' => $studentSupervisor->id,
            ]);
            $this->syncErrors($report, $data['errors'] ?? []);
            return $report;
        });

        return response()->json([
            'message' => 'تمت إضافة تقرير التسميع بنجاح.',
            'data' => $this->payload($this->load($report)),
        ], 201);
    }

    public function update(Request $request, Report $report)
    {
        $this->ensureReportAccess($report, $request);
        $data = $this->validated($request, true);

        if (!empty($data['student_id'])) {
            $student = Student::findOrFail($data['student_id']);
            $this->ensureStudentGender($student, $request);
            $this->ensureAssignedStudent($student, $request);
        }

        if ($this->isSupervisorActor($request)) {
            $data['supervisor_id'] = $this->actorSupervisorId($request);
        } elseif (array_key_exists('supervisor_id', $data)) {
            $data['supervisor_id'] = $this->resolvedSupervisorId($data['supervisor_id'], $request);
        }
        $this->ensureSupervisorGender($data['supervisor_id'] ?? null, $request);

        DB::transaction(function () use ($data, $report) {
            $update = collect($data)->only(['start_page', 'quantity', 'report_date'])->all();

            if (array_key_exists('student_id', $data) || array_key_exists('supervisor_id', $data)) {
                $report->loadMissing('studentLevel', 'studentSupervisor');
                $studentId = $data['student_id'] ?? $report->studentLevel?->student_id;
                $supervisorId = $data['supervisor_id'] ?? $report->studentSupervisor?->supervisor_id;
                [$studentLevel, $studentSupervisor] = $this->resolveRelations($studentId, $supervisorId, false);
                $update['student_level_id'] = $studentLevel->id;
                $update['student_supervisor_id'] = $studentSupervisor->id;
            }

            if ($update !== []) $report->update($update);
            if (array_key_exists('errors', $data)) $this->syncErrors($report, $data['errors'] ?? []);
        });

        return response()->json([
            'message' => 'تم تحديث تقرير التسميع بنجاح.',
            'data' => $this->payload($this->load($report->fresh())),
        ]);
    }

    public function destroy(Request $request, Report $report)
    {
        $this->ensureReportAccess($report, $request);
        DB::transaction(function () use ($report) {
            $report->reportErrors()->delete();
            $report->delete();
        });
        return response()->json(['message' => 'تم حذف تقرير التسميع بنجاح.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'student_id' => [$required, 'integer', 'exists:students,id'],
            'supervisor_id' => ['sometimes', 'nullable', 'integer', 'exists:supervisors,id'],
            'report_date' => [$required, 'date'],
            'start_page' => [$required, 'integer', 'min:1', 'max:604'],
            'quantity' => [$required, 'integer', 'min:1', 'max:604'],
            'errors' => ['sometimes', 'array'],
            'errors.*.error_id' => ['sometimes', 'nullable', 'integer', 'exists:errors,id'],
            'errors.*.error_type' => ['sometimes', 'nullable', Rule::in(array_column(ErrorType::cases(), 'value'))],
            'errors.*.word' => ['required_with:errors', 'string', 'max:255'],
            'errors.*.details' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);
    }

    private function ensureReportAccess(Report $report, Request $request): void
    {
        $report->loadMissing('studentLevel.student.person', 'studentSupervisor');
        $student = $report->studentLevel?->student;
        abort_unless($student, 404, 'الطالب المرتبط بالتقرير غير موجود.');
        $this->ensureStudentGender($student, $request);
        $this->ensureAssignedStudent($student, $request);

        if ($this->isSupervisorActor($request)) {
            abort_unless(
                (int) $report->studentSupervisor?->supervisor_id === $this->actorSupervisorId($request),
                403,
                'غير مسموح لك بتعديل تقرير أنشأه مشرف آخر.'
            );
        }
    }

    private function resolveRelations(int $studentId, ?int $supervisorId, bool $allowCreateAssignment = true): array
    {
        $student = Student::with(['studentLevels', 'studentSupervisors'])->findOrFail($studentId);
        $studentLevel = $student->studentLevels->sortByDesc('id')->first();
        if (!$studentLevel) throw ValidationException::withMessages(['student_id' => ['لا يوجد مستوى مسجل لهذا الطالب بعد.']]);

        $studentSupervisor = $student->studentSupervisors
            ->whereNull('retired_at')
            ->when($supervisorId, fn ($collection) => $collection->where('supervisor_id', $supervisorId))
            ->sortByDesc('id')->first();

        if (!$studentSupervisor && $supervisorId && $allowCreateAssignment) {
            $studentSupervisor = StudentSupervisor::create([
                'student_id' => $studentId,
                'supervisor_id' => $supervisorId,
                'assigned_at' => now()->toDateString(),
            ]);
        }
        if (!$studentSupervisor) throw ValidationException::withMessages(['supervisor_id' => ['يجب أن يكون الطالب معيّناً لهذا المشرف قبل إضافة التقرير.']]);
        return [$studentLevel, $studentSupervisor];
    }

    private function syncErrors(Report $report, array $errors): void
    {
        $report->reportErrors()->delete();
        foreach ($errors as $item) {
            $errorId = $item['error_id'] ?? null;
            if (!$errorId && !empty($item['error_type'])) {
                $errorId = Error::firstOrCreate(['error_type' => $item['error_type']], ['score' => 0])->id;
            }
            if (!$errorId) continue;
            ReportError::create([
                'report_id' => $report->id,
                'error_id' => $errorId,
                'error_word' => $item['word'] ?? '',
                'details' => $item['details'] ?? null,
            ]);
        }
    }

    private function load(Report $report): Report
    {
        return $report->load([
            'studentLevel.level', 'studentLevel.student.person',
            'studentSupervisor.supervisor.person', 'reportErrors.error',
        ]);
    }

    private function payload(Report $report): array
    {
        $student = $report->studentLevel?->student;
        $person = $student?->person;
        $supervisorPerson = $report->studentSupervisor?->supervisor?->person;
        return [
            'id' => $report->id,
            'student_id' => $student?->id,
            'student_name' => $person ? trim($person->fname . ' ' . $person->lname) : null,
            'student_level_id' => $report->student_level_id,
            'level' => $report->studentLevel?->level?->name?->value,
            'level_label' => $report->studentLevel?->level?->name?->label(),
            'supervisor_id' => $report->studentSupervisor?->supervisor_id,
            'supervisor_name' => $supervisorPerson ? trim($supervisorPerson->fname . ' ' . $supervisorPerson->lname) : null,
            'report_date' => optional($report->report_date)->toDateString(),
            'start_page' => $report->start_page,
            'quantity' => $report->quantity,
            'errors' => $report->reportErrors->map(fn (ReportError $error) => [
                'id' => $error->id,
                'error_id' => $error->error_id,
                'error_type' => $error->error?->error_type?->value,
                'error_type_label' => $error->error?->error_type?->label(),
                'word' => $error->error_word,
                'details' => $error->details,
            ])->values(),
        ];
    }
}
