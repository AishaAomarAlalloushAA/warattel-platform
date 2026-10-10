<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LevelResource;
use App\Http\Requests\StoreLevelRequest;
use App\Http\Requests\UpdateLevelRequest;
use App\Models\Level;

class LevelController extends Controller
{
    public function index()
    {
        $levels = Level::all(); // العدد قليل عادةً
        return LevelResource::collection($levels);
    }

    public function show(Level $level)
    {
        return new LevelResource($level);
    }

    public function store(StoreLevelRequest $request)
    {
        $level = Level::create($request->validated());
        return new LevelResource($level);
    }

    public function update(UpdateLevelRequest $request, Level $level)
    {
        $level->update($request->validated());
        return new LevelResource($level);
    }

    public function destroy(Level $level)
    {
        $level->delete();
        return response()->json(['message' => 'تم حذف المستوى']);
    }
}
