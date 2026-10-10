<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Http\Resources\ExamResource;
use App\Models\Exam;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $query = Exam::with('supervisor.person', 'studentLevel.level', 'studentLevel.student.person', 'examErrors.error')
            ->orderByDesc('exam_date')
            ->orderByDesc('id');

        if ($request->filled('student_id')) {
            $studentId = $request->integer('student_id');
            $query->whereHas('studentLevel', fn ($q) => $q->where('student_id', $studentId));
        }

        if ($request->filled('supervisor_id')) {
            $query->where('supervisor_id', $request->integer('supervisor_id'));
        }

        if ($request->filled('exam_type')) {
            $query->where('exam_type', $request->string('exam_type'));
        }

        return ExamResource::collection($query->paginate(20));
    }

    public function show(Exam $exam)
    {
        return new ExamResource($exam->load('supervisor.person', 'studentLevel.level', 'studentLevel.student.person', 'examErrors.error'));
    }

    public function store(StoreExamRequest $request)
    {
        $exam = Exam::create($request->validated());

        return (new ExamResource($exam->load('supervisor.person', 'studentLevel.level', 'studentLevel.student.person', 'examErrors.error')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateExamRequest $request, Exam $exam)
    {
        $exam->update($request->validated());

        return new ExamResource($exam->fresh()->load('supervisor.person', 'studentLevel.level', 'studentLevel.student.person', 'examErrors.error'));
    }

    public function destroy(Exam $exam)
    {
        $exam->delete();

        return response()->json(['message' => 'تم حذف السبر بنجاح.']);
    }
}
