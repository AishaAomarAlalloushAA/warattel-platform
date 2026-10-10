<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EducationalLink;
use Illuminate\Http\Request;

class EducationalLinkController extends Controller
{
    public function index(Request $request)
    {
        $query = EducationalLink::with('level')->orderBy('sort_order')->orderBy('id');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('level_id')) {
            $query->where('level_id', $request->integer('level_id'));
        }

        return response()->json(['data' => $query->paginate(30)]);
    }

    public function store(Request $request)
    {
        $link = EducationalLink::create($this->validated($request));

        return response()->json([
            'message' => 'تمت إضافة الرابط التعليمي بنجاح.',
            'data' => $link->load('level'),
        ], 201);
    }

    public function show(EducationalLink $educationalLink)
    {
        return response()->json(['data' => $educationalLink->load('level')]);
    }

    public function update(Request $request, EducationalLink $educationalLink)
    {
        $educationalLink->update($this->validated($request, true));

        return response()->json([
            'message' => 'تم تحديث الرابط التعليمي بنجاح.',
            'data' => $educationalLink->fresh()->load('level'),
        ]);
    }

    public function destroy(EducationalLink $educationalLink)
    {
        $educationalLink->delete();

        return response()->json(['message' => 'تم حذف الرابط التعليمي بنجاح.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'level_id' => ['sometimes', 'nullable', 'integer', 'exists:levels,id'],
            'title' => [$required, 'string', 'max:255'],
            'url' => [$required, 'url', 'max:2000'],
            'description' => ['sometimes', 'nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);
    }
}
