<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Resources\PersonResource;
use App\Http\Requests\StorePersonRequest;
use App\Http\Requests\UpdatePersonRequest;
use App\Models\Person;

class PersonController extends Controller
{
    public function index()
    {
        $persons = Person::paginate(20);
        return PersonResource::collection($persons);
    }

    public function show(Person $person)
    {
        return new PersonResource($person);
    }

    public function store(StorePersonRequest $request)
    {
        $person = Person::create($request->validated());
        return new PersonResource($person);
    }

    public function update(UpdatePersonRequest $request, Person $person)
    {
        $person->update($request->validated());
        return new PersonResource($person->fresh());
    }

    public function destroy(Person $person)
    {
        $person->delete();
        return response()->json(['message' => 'تم حذف الشخص بنجاح']);
    }
}
