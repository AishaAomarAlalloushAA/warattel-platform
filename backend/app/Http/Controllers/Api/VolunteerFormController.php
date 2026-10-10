<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVolunteerFormRequest;
use App\Http\Requests\UpdateVolunteerFormRequest;
use App\Http\Resources\VolunteerFormResource;
use App\Models\VolunteerForm;

class VolunteerFormController extends Controller
{
    public function index()
    {
        $forms = VolunteerForm::with('user.person')
            ->latest('id')
            ->paginate(20);

        return VolunteerFormResource::collection($forms);
    }

    public function show(VolunteerForm $volunteerForm)
    {
        return new VolunteerFormResource($volunteerForm->load('user.person'));
    }

    public function store(StoreVolunteerFormRequest $request)
    {
        $form = VolunteerForm::create([
            'user_id' => $request->user()?->id,
            'name' => $request->name,
            'contact_number' => $request->contact_number,
            'telegram_username' => $request->telegram_username,
            'email' => $request->email,
            'year_of_study' => $request->year_of_study,
            'additional_skills' => $request->additional_skills,
            'form_type' => $request->form_type,
            'status' => 'pending',
            'form_data' => $request->form_data,
        ]);

        return (new VolunteerFormResource($form->load('user.person')))
            ->additional([
                'message' => 'تم استلام طلب التطوع وهو قيد المراجعة، وسيتم التواصل معك قريباً.',
            ]);
    }

    public function update(UpdateVolunteerFormRequest $request, VolunteerForm $volunteerForm)
    {
        $volunteerForm->update($request->validated());

        return (new VolunteerFormResource($volunteerForm->fresh()->load('user.person')))
            ->additional(['message' => 'تم تحديث طلب التطوع بنجاح.']);
    }

    public function destroy(VolunteerForm $volunteerForm)
    {
        $volunteerForm->delete();

        return response()->json(['message' => 'تم حذف طلب التطوع.']);
    }
}
