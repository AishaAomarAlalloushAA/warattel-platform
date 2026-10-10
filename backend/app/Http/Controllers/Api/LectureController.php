<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lecture;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LectureController extends Controller
{
    public function publicIndex()
    {
        return response()->json([
            'data' => Lecture::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function index(Request $request)
    {
        $query = Lecture::query()->orderBy('sort_order')->orderByDesc('id');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        return response()->json(['data' => $query->paginate(30)]);
    }

    public function store(Request $request)
    {
        $lecture = Lecture::create($this->validated($request));

        return response()->json([
            'message' => 'تمت إضافة المحاضرة بنجاح.',
            'data' => $lecture,
        ], 201);
    }

    public function show(Lecture $lecture)
    {
        return response()->json(['data' => $lecture]);
    }

    public function update(Request $request, Lecture $lecture)
    {
        $lecture->update($this->validated($request, true));

        return response()->json([
            'message' => 'تم تحديث المحاضرة بنجاح.',
            'data' => $lecture->fresh(),
        ]);
    }

    public function destroy(Lecture $lecture)
    {
        $lecture->delete();

        return response()->json(['message' => 'تم حذف المحاضرة بنجاح.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'title' => [$required, 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'display_date' => ['sometimes', 'nullable', 'string', 'max:100'],
            'type' => [$required, Rule::in(['video', 'playlist', 'image'])],
            'url' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'thumbnail' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'registration_status' => ['sometimes', Rule::in(['open', 'closed', 'soon'])],
            'category' => ['sometimes', 'nullable', 'string', 'max:80'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);
    }
}
