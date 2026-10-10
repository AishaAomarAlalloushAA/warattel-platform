<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExamErrorResource;
use App\Http\Requests\StoreExamErrorRequest;
use App\Http\Requests\UpdateExamErrorRequest;
use App\Models\ExamError;

class ExamErrorController extends Controller
{
    public function index()
    {
        $records = ExamError::with('exam', 'error')->paginate(20);
        return ExamErrorResource::collection($records);
    }

    public function show(ExamError $examError)
    {
        return new ExamErrorResource($examError->load('exam', 'error'));
    }

    public function store(StoreExamErrorRequest $request)
    {
        $examError = ExamError::create($request->validated());
        return new ExamErrorResource($examError->load('exam', 'error'));
    }

    public function update(UpdateExamErrorRequest $request, ExamError $examError)
    {
        $examError->update($request->validated());
        return new ExamErrorResource($examError->fresh('exam', 'error'));
    }

    public function destroy(ExamError $examError)
    {
        $examError->delete();
        return response()->json(['message' => 'تم حذف خطأ الامتحان']);
    }
}
