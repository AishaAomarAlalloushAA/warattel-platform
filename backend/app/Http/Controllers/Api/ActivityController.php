<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Http\Requests\StoreActivityRequest;
use App\Http\Requests\UpdateActivityRequest;
use App\Models\Activity;
class ActivityController extends Controller
{
    public function index()
    {
        $activities = Activity::with('activityType', 'coordinator.person', 'presenter.person')
            ->paginate(20);
        return ActivityResource::collection($activities);
    }

    public function show(Activity $activity)
    {
        $activity->load('activityType', 'coordinator.person', 'presenter.person');
        return new ActivityResource($activity);
    }

    public function store(StoreActivityRequest $request)
    {
        $activity = Activity::create($request->validated());
        return new ActivityResource($activity->load('activityType', 'coordinator.person', 'presenter.person'));
    }

    public function update(UpdateActivityRequest $request, Activity $activity)
    {
        $activity->update($request->validated());
        return new ActivityResource($activity->fresh('activityType', 'coordinator.person', 'presenter.person'));
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();
        return response()->json(['message' => 'تم حذف النشاط']);
    }
}
