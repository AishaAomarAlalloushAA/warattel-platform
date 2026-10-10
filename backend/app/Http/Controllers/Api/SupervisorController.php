<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupervisorResource;
use App\Http\Requests\StoreSupervisorRequest;
use App\Http\Requests\UpdateSupervisorRequest;
use App\Models\Supervisor;


class SupervisorController extends Controller
{
    public function index()
    {
        $supervisors = Supervisor::with('person')->paginate(20);
        return SupervisorResource::collection($supervisors);
    }

    public function show(Supervisor $supervisor)
    {
        $supervisor->load('person', 'assistedSupervisors.person');
        return new SupervisorResource($supervisor);
    }

    public function store(StoreSupervisorRequest $request)
    {
        $supervisor = Supervisor::create($request->validated());

        $supervisor->person->user->update([
             'role' => \App\Enums\UserRole::Supervisor,
        ]);
        return new SupervisorResource($supervisor->load('person'));
    }

    public function update(UpdateSupervisorRequest $request, Supervisor $supervisor)
    {
        $supervisor->update($request->validated());
        return new SupervisorResource($supervisor->fresh('person'));
    }

    public function destroy(Supervisor $supervisor)
    {
        $supervisor->delete();
        return response()->json(['message' => 'تم حذف المشرف']);
    }
}
