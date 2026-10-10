<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use App\Models\StudentSupervisor;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with('person')->paginate(20);
        return StudentResource::collection($students);
    }

    public function show(Student $student)
    {
        $student->load('person', 'studentLevels.level');
        return new StudentResource($student);
    }

    public function store(StoreStudentRequest $request)
    {
        $student = Student::create($request->validated());
        return new StudentResource($student->load('person'));
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());
        return new StudentResource($student->fresh('person'));
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(['message' => 'تم حذف الطالب بنجاح'], 200);
    }

    public function myStudents()
    {
        $user = auth()->user()->loadMissing('person.supervisor');
        $supervisor = $user->person?->supervisor;
        $gender = $user->person?->gender?->value;

        if (!$supervisor || !$gender) {
            return response()->json(['message' => 'حساب المشرف غير مكتمل.'], 403);
        }

        $studentSupervisors = StudentSupervisor::with([
            'student.person',
            'student.studentLevels.level',
        ])
            ->where('supervisor_id', $supervisor->id)
            ->whereNull('retired_at')
            ->whereHas('student.person', fn ($query) => $query->where('gender', $gender))
            ->get();

        return StudentResource::collection($studentSupervisors->pluck('student')->filter()->values());
    }
}
