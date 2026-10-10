<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentActivityResource;
use App\Http\Requests\StoreStudentActivityRequest;
use App\Http\Requests\UpdateStudentActivityRequest;
use App\Models\StudentActivity;

class StudentActivityController extends Controller
{
    public function index()
    {
        $records = StudentActivity::with('student.person', 'activity')->paginate(20);
        return StudentActivityResource::collection($records);
    }

    public function show(StudentActivity $studentActivity)
    {
        $studentActivity->load('student.person', 'activity');
        return new StudentActivityResource($studentActivity);
    }

    public function store(StoreStudentActivityRequest $request)
    {
        $sa = StudentActivity::create($request->validated());
        return new StudentActivityResource($sa->load('student.person', 'activity'));
    }

    public function update(UpdateStudentActivityRequest $request, StudentActivity $studentActivity)
    {
        $studentActivity->update($request->validated());
        return new StudentActivityResource($studentActivity->fresh('student.person', 'activity'));
    }

    public function destroy(StudentActivity $studentActivity)
    {
        $studentActivity->delete();
        return response()->json(['message' => 'تم حذف سجل الطالب من النشاط']);
    }
}
