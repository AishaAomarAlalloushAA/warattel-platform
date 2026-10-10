<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSuggestionRequest;
use App\Http\Resources\SuggestionResource;
use App\Models\Suggestion;

class SuggestionController extends Controller
{
    // للمشرف فقط: عرض كل الاقتراحات
    public function index()
    {
        return SuggestionResource::collection(Suggestion::latest()->paginate(20));
    }

    // عام: أي زائر يرسل اقتراح
    public function store(StoreSuggestionRequest $request)
    {
        $suggestion = Suggestion::create($request->validated());
        return new SuggestionResource($suggestion);
    }

    // للمشرف: حذف اقتراح
    public function destroy(Suggestion $suggestion)
    {
        $suggestion->delete();
        return response()->json(['message' => 'تم حذف الاقتراح']);
    }
}
