<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentLevelResource;
use App\Http\Requests\StoreStudentLevelRequest;
use App\Http\Requests\UpdateStudentLevelRequest;
use App\Models\StudentLevel;

class StudentLevelController extends Controller
{
    public function index()
    {
        $records = StudentLevel::with('level')->paginate(20);
        return StudentLevelResource::collection($records);
    }

    public function show(StudentLevel $studentLevel)
    {
        return new StudentLevelResource($studentLevel->load('level'));
    }

    public function store(StoreStudentLevelRequest $request)
    {
        $studentLevel = StudentLevel::create($request->validated());
        return new StudentLevelResource($studentLevel->load('level'));
    }

    public function update(UpdateStudentLevelRequest $request, StudentLevel $studentLevel)
    {
        $studentLevel->update($request->validated());
        return new StudentLevelResource($studentLevel->fresh('level'));
    }

    public function destroy(StudentLevel $studentLevel)
    {
        $studentLevel->delete();
        return response()->json(['message' => 'تم حذف السجل']);
    }
}
