<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportErrorResource;
use App\Http\Requests\StoreReportErrorRequest;
use App\Http\Requests\UpdateReportErrorRequest;
use App\Models\ReportError;

class ReportErrorController extends Controller
{
    public function index()
    {
        $records = ReportError::with('report', 'error')->paginate(20);
        return ReportErrorResource::collection($records);
    }

    public function show(ReportError $reportError)
    {
        return new ReportErrorResource($reportError->load('report', 'error'));
    }

    public function store(StoreReportErrorRequest $request)
    {
        $reportError = ReportError::create($request->validated());
        return (new ReportErrorResource($reportError->load('report', 'error')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateReportErrorRequest $request, ReportError $reportError)
    {
        $reportError->update($request->validated());
        return new ReportErrorResource($reportError->fresh('report', 'error'));
    }

    public function destroy(ReportError $reportError)
    {
        $reportError->delete();
        return response()->json(['message' => 'تم حذف خطأ التقرير بنجاح.']);
    }
}
