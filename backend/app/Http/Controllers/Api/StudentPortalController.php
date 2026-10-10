<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Achievement;
use App\Models\EducationalLink;
use App\Models\Exam;
use App\Models\LevelExam;
use App\Models\Report;
use App\Models\Student;
use App\Models\StudentActivity;
use App\Models\StudentLevel;
use Illuminate\Http\Request;

class StudentPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $student = $this->student($request);
        $currentLevel = $this->currentLevel($student);

        return response()->json([
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'status' => $student->status?->value,
                    'status_label' => $student->status?->label(),
                    'user' => new UserResource($request->user()->load('person.student')),
                ],
                'current_level' => $this->levelPayload($currentLevel),
                'counts' => [
                    'reports' => Report::whereHas('studentLevel', fn ($query) => $query->where('student_id', $student->id))->count(),
                    'part_exams' => Exam::whereHas('studentLevel', fn ($query) => $query->where('student_id', $student->id))->count(),
                    'level_exams' => LevelExam::whereHas('studentLevel', fn ($query) => $query->where('student_id', $student->id))->count(),
                    'activities' => StudentActivity::where('student_id', $student->id)->count(),
                    'achievements' => Achievement::where('student_id', $student->id)->count(),
                ],
            ],
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json([
            'data' => new UserResource($request->user()->load('person.student')),
        ]);
    }

    public function level(Request $request)
    {
        $student = $this->student($request);
        $levels = StudentLevel::with('level')
            ->where('student_id', $student->id)
            ->orderByDesc('reached_at')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => [
                'current' => $this->levelPayload($levels->first()),
                'history' => $levels->map(fn ($studentLevel) => $this->levelPayload($studentLevel))->values(),
            ],
        ]);
    }

    public function reports(Request $request)
    {
        $student = $this->student($request);

        $reports = Report::with([
            'studentLevel.level',
            'studentSupervisor.supervisor.person',
            'reportErrors.error',
        ])
            ->whereHas('studentLevel', fn ($query) => $query->where('student_id', $student->id))
            ->orderByDesc('report_date')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $reports->map(function (Report $report) {
                $supervisor = $report->studentSupervisor?->supervisor?->person;

                return [
                    'id' => $report->id,
                    'date' => optional($report->report_date)->toDateString(),
                    'level' => $report->studentLevel?->level?->name?->value,
                    'level_label' => $report->studentLevel?->level?->name?->label(),
                    'start_page' => $report->start_page,
                    'quantity' => $report->quantity,
                    'supervisor' => $supervisor ? [
                        'id' => $report->studentSupervisor?->supervisor_id,
                        'name' => trim($supervisor->fname . ' ' . $supervisor->lname),
                    ] : null,
                    'errors' => $report->reportErrors->map(fn ($item) => [
                        'id' => $item->id,
                        'word' => $item->error_word,
                        'details' => $item->details,
                        'type' => $item->error?->type?->value,
                        'type_label' => $item->error?->type?->label(),
                    ])->values(),
                ];
            })->values(),
        ]);
    }

    public function exams(Request $request)
    {
        $student = $this->student($request);

        $partExams = Exam::with(['studentLevel.level', 'supervisor.person', 'examErrors.error'])
            ->whereHas('studentLevel', fn ($query) => $query->where('student_id', $student->id))
            ->orderByDesc('exam_date')
            ->orderByDesc('id')
            ->get()
            ->map(function (Exam $exam) {
                $person = $exam->supervisor?->person;

                return [
                    'id' => $exam->id,
                    'date' => optional($exam->exam_date)->toDateString(),
                    'part' => $exam->part,
                    'quantity' => $exam->quantity,
                    'exam_type' => $exam->exam_type?->value,
                    'exam_type_label' => $exam->exam_type?->label(),
                    'score' => $exam->score,
                    'result' => $exam->result,
                    'level' => $exam->studentLevel?->level?->name?->value,
                    'level_label' => $exam->studentLevel?->level?->name?->label(),
                    'supervisor' => $person ? [
                        'id' => $exam->supervisor_id,
                        'name' => trim($person->fname . ' ' . $person->lname),
                    ] : null,
                    'errors' => $exam->examErrors->map(fn ($item) => [
                        'id' => $item->id,
                        'word' => $item->error_word,
                        'details' => $item->details,
                        'type' => $item->error?->type?->value,
                        'type_label' => $item->error?->type?->label(),
                    ])->values(),
                ];
            })->values();

        $levelExams = LevelExam::with(['studentLevel.level', 'targetLevel', 'supervisor.person'])
            ->whereHas('studentLevel', fn ($query) => $query->where('student_id', $student->id))
            ->orderByDesc('exam_date')
            ->orderByDesc('id')
            ->get()
            ->map(function (LevelExam $exam) {
                $person = $exam->supervisor?->person;

                return [
                    'id' => $exam->id,
                    'date' => optional($exam->exam_date)->toDateString(),
                    'current_level' => $exam->studentLevel?->level?->name?->value,
                    'current_level_label' => $exam->studentLevel?->level?->name?->label(),
                    'target_level' => $exam->targetLevel?->name?->value,
                    'target_level_label' => $exam->targetLevel?->name?->label(),
                    'supervisor' => $person ? [
                        'id' => $exam->supervisor_id,
                        'name' => trim($person->fname . ' ' . $person->lname),
                    ] : null,
                    'evaluation' => [
                        'makharij' => $exam->makharij_score,
                        'ahkam' => $exam->ahkam_score,
                        'fluency' => $exam->fluency_score,
                    ],
                    'notes' => $exam->notes,
                    'decision' => $exam->decision,
                ];
            })->values();

        return response()->json([
            'data' => [
                'part_exams' => $partExams,
                'level_exams' => $levelExams,
            ],
        ]);
    }

    public function activities(Request $request)
    {
        $student = $this->student($request);

        $items = StudentActivity::with([
            'activity.activityType',
            'activity.coordinator.person',
            'activity.presenter.person',
        ])
            ->where('student_id', $student->id)
            ->whereHas('activity')
            ->get()
            ->sortByDesc(fn ($item) => optional($item->activity?->activity_date)->timestamp ?? 0)
            ->values()
            ->map(function (StudentActivity $item) {
                $activity = $item->activity;
                $presenter = $activity?->presenter?->person;
                $coordinator = $activity?->coordinator?->person;

                return [
                    'id' => $activity?->id,
                    'title' => $activity?->title,
                    'date' => optional($activity?->activity_date)->toDateString(),
                    'gender' => $activity?->gender,
                    'type' => $activity?->activityType?->name ?? null,
                    'presenter' => $presenter ? trim($presenter->fname . ' ' . $presenter->lname) : null,
                    'coordinator' => $coordinator ? trim($coordinator->fname . ' ' . $coordinator->lname) : null,
                ];
            });

        return response()->json(['data' => $items]);
    }

    public function achievements(Request $request)
    {
        $student = $this->student($request);

        $items = Achievement::where('student_id', $student->id)
            ->orderByDesc('achieved_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Achievement $achievement) => [
                'id' => $achievement->id,
                'type' => $achievement->type?->value,
                'type_label' => $achievement->type?->label(),
                'title' => $achievement->title,
                'description' => $achievement->description,
                'date' => optional($achievement->achieved_at)->toDateString(),
            ]);

        return response()->json(['data' => $items]);
    }

    public function links(Request $request)
    {
        $student = $this->student($request);
        $currentLevelId = $this->currentLevel($student)?->level_id;

        $links = EducationalLink::query()
            ->where('is_active', true)
            ->where(function ($query) use ($currentLevelId) {
                $query->whereNull('level_id');
                if ($currentLevelId) {
                    $query->orWhere('level_id', $currentLevelId);
                }
            })
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'title', 'url', 'description', 'level_id']);

        return response()->json(['data' => $links]);
    }

    private function student(Request $request): Student
    {
        $user = $request->user()->loadMissing('person.student');
        $student = $user->person?->student;

        abort_unless($student, 403, 'هذا الحساب غير مرتبط بطالب.');

        return $student;
    }

    private function currentLevel(Student $student): ?StudentLevel
    {
        return StudentLevel::with('level')
            ->where('student_id', $student->id)
            ->orderByDesc('reached_at')
            ->orderByDesc('id')
            ->first();
    }

    private function levelPayload(?StudentLevel $studentLevel): ?array
    {
        if (!$studentLevel) {
            return null;
        }

        return [
            'student_level_id' => $studentLevel->id,
            'level_id' => $studentLevel->level_id,
            'name' => $studentLevel->level?->name?->value,
            'name_label' => $studentLevel->level?->name?->label(),
            'description' => $studentLevel->level?->description,
            'plan' => $studentLevel->level?->plan,
            'reached_at' => optional($studentLevel->reached_at)->toDateString(),
        ];
    }
}
