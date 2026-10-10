<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ErrorResource;
use App\Http\Requests\StoreErrorRequest;
use App\Http\Requests\UpdateErrorRequest;
use App\Models\Error;

class ErrorController extends Controller
{
    public function index()
    {
        $errors = Error::paginate(20);
        return ErrorResource::collection($errors);
    }

    public function show(Error $error)
    {
        return new ErrorResource($error);
    }

    public function store(StoreErrorRequest $request)
    {
        $error = Error::create($request->validated());
        return new ErrorResource($error);
    }

    public function update(UpdateErrorRequest $request, Error $error)
    {
        $error->update($request->validated());
        return new ErrorResource($error);
    }

    public function destroy(Error $error)
    {
        $error->delete();
        return response()->json(['message' => 'تم حذف الخطأ']);
    }
}
