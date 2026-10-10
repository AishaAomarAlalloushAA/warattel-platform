<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Http\Requests\UpdateReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with(
            'studentLevel.level',
            'studentLevel.student.person',
            'studentSupervisor.supervisor.person',
            'reportErrors.error'
        )
            ->orderByDesc('report_date')
            ->orderByDesc('id');

        if ($request->filled('student_id')) {
            $studentId = $request->integer('student_id');
            $query->whereHas('studentLevel', fn ($q) => $q->where('student_id', $studentId));
        }

        if ($request->filled('supervisor_id')) {
            $supervisorId = $request->integer('supervisor_id');
            $query->whereHas('studentSupervisor', fn ($q) => $q->where('supervisor_id', $supervisorId));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('report_date', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('report_date', '<=', $request->date('date_to'));
        }

        return ReportResource::collection($query->paginate(20));
    }

    public function show(Report $report)
    {
        return new ReportResource($report->load(
            'studentLevel.level',
            'studentLevel.student.person',
            'studentSupervisor.supervisor.person',
            'reportErrors.error'
        ));
    }

    public function store(StoreReportRequest $request)
    {
        $report = Report::create($request->validated());

        return (new ReportResource($report->load(
            'studentLevel.level',
            'studentLevel.student.person',
            'studentSupervisor.supervisor.person',
            'reportErrors.error'
        )))->response()->setStatusCode(201);
    }

    public function update(UpdateReportRequest $request, Report $report)
    {
        $report->update($request->validated());

        return new ReportResource($report->fresh()->load(
            'studentLevel.level',
            'studentLevel.student.person',
            'studentSupervisor.supervisor.person',
            'reportErrors.error'
        ));
    }

    public function destroy(Report $report)
    {
        $report->delete();

        return response()->json(['message' => 'تم حذف التقرير بنجاح.']);
    }
}
