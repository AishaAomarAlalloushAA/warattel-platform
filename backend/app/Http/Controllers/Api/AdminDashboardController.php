<?php

namespace App\Http\Controllers\Api;

use App\Enums\StudentStatus;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Exam;
use App\Models\LevelExam;
use App\Models\Report;
use App\Models\Student;
use App\Models\Suggestion;
use App\Models\VolunteerForm;
use App\Support\EnforcesGenderScope;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminDashboardController extends Controller
{
    use EnforcesGenderScope;

    public function __invoke(Request $request)
    {
        $gender = $this->actorGender($request);
        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();
        $monthStart = Carbon::now()->startOfMonth();

        $students = Student::query()->whereHas('person', fn ($q) => $q->where('gender', $gender));
        $reports = Report::query()->whereHas('studentLevel.student.person', fn ($q) => $q->where('gender', $gender));
        $partExams = Exam::query()->whereHas('studentLevel.student.person', fn ($q) => $q->where('gender', $gender));
        $levelExams = LevelExam::query()->whereHas('studentLevel.student.person', fn ($q) => $q->where('gender', $gender));

        return response()->json([
            'data' => [
                'scope' => ['gender' => $gender],
                'students' => [
                    'total' => (clone $students)->count(),
                    'active' => (clone $students)->where('status', StudentStatus::Active->value)->count(),
                    'inactive' => (clone $students)->where('status', StudentStatus::Inactive->value)->count(),
                    'graduated' => (clone $students)->where('status', StudentStatus::Graduated->value)->count(),
                    'new_this_month' => (clone $students)->where('created_at', '>=', $monthStart)->count(),
                ],
                'reports' => [
                    'total' => (clone $reports)->count(),
                    'this_month' => (clone $reports)->where('report_date', '>=', $monthStart->toDateString())->count(),
                ],
                'exams' => [
                    'total' => (clone $partExams)->count() + (clone $levelExams)->count(),
                    'part_exams' => (clone $partExams)->count(),
                    'level_exams' => (clone $levelExams)->count(),
                    'this_month' => (clone $partExams)->where('exam_date', '>=', $monthStart->toDateString())->count()
                        + (clone $levelExams)->where('exam_date', '>=', $monthStart->toDateString())->count(),
                ],
                'activities' => [
                    'total' => Activity::count(),
                    'today' => Activity::whereDate('activity_date', $today)->count(),
                    'this_week' => Activity::where('activity_date', '>=', $weekStart->toDateString())->count(),
                    'this_month' => Activity::where('activity_date', '>=', $monthStart->toDateString())->count(),
                ],
                // Volunteer requests are public visitor submissions, not student-scoped data.
                'volunteer_requests' => [
                    'total' => VolunteerForm::count(),
                    'pending' => VolunteerForm::where('status', 'pending')->count(),
                ],
                'suggestions' => [
                    'total' => Suggestion::count(),
                    'this_month' => Suggestion::where('created_at', '>=', $monthStart)->count(),
                ],
            ],
        ]);
    }
}
