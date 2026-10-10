<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentSupervisorResource;
use App\Http\Requests\StoreStudentSupervisorRequest;
use App\Http\Requests\UpdateStudentSupervisorRequest;
use App\Models\StudentSupervisor;

class StudentSupervisorController extends Controller
{
    public function index()
    {
        $records = StudentSupervisor::with('student.person', 'supervisor.person')
                      ->paginate(20);
        return StudentSupervisorResource::collection($records);
    }

    public function show(StudentSupervisor $studentSupervisor)
    {
        return new StudentSupervisorResource(
            $studentSupervisor->load('student.person', 'supervisor.person')
        );
    }

    public function store(StoreStudentSupervisorRequest $request)
    {
        $record = StudentSupervisor::create($request->validated());
        return new StudentSupervisorResource($record->load('student', 'supervisor'));
    }

    public function update(UpdateStudentSupervisorRequest $request, StudentSupervisor $studentSupervisor)
    {
        $studentSupervisor->update($request->validated());
        return new StudentSupervisorResource($studentSupervisor->fresh('student', 'supervisor'));
    }

    public function destroy(StudentSupervisor $studentSupervisor)
    {
        $studentSupervisor->delete();
        return response()->json(['message' => 'تم حذف العلاقة']);
    }
}
