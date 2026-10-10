<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityTypeResource;
use App\Http\Requests\StoreActivityTypeRequest;
use App\Http\Requests\UpdateActivityTypeRequest;
use App\Models\ActivityType;

class ActivityTypeController extends Controller
{
    public function index()
    {
        return ActivityTypeResource::collection(ActivityType::all());
    }

    public function show(ActivityType $activityType)
    {
        return new ActivityTypeResource($activityType);
    }

    public function store(StoreActivityTypeRequest $request)
    {
        return new ActivityTypeResource(ActivityType::create($request->validated()));
    }

    public function update(UpdateActivityTypeRequest $request, ActivityType $activityType)
    {
        $activityType->update($request->validated());
        return new ActivityTypeResource($activityType);
    }

    public function destroy(ActivityType $activityType)
    {
        $activityType->delete();
        return response()->json(['message' => 'تم حذف نوع النشاط']);
    }
}
