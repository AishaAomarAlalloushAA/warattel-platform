<?php

namespace App\Support;

use App\Models\Student;
use App\Models\Supervisor;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

trait EnforcesGenderScope
{
    protected function actorGender(Request $request): string
    {
        $user = $request->user()?->loadMissing('person');
        $gender = $user?->person?->gender?->value;

        abort_unless(
            $gender,
            403,
            'يجب تحديد جنس حساب المشرف قبل الوصول إلى بيانات الطلاب.'
        );

        return $gender;
    }

    protected function scopeStudentsByActorGender(Builder $query, Request $request): Builder
    {
        $gender = $this->actorGender($request);

        return $query->whereHas('person', fn (Builder $personQuery) => $personQuery->where('gender', $gender));
    }

    protected function scopeStudentRelationByActorGender(Builder $query, Request $request, string $relation): Builder
    {
        $gender = $this->actorGender($request);

        return $query->whereHas($relation, fn (Builder $personQuery) => $personQuery->where('gender', $gender));
    }

    protected function ensureStudentGender(Student $student, Request $request): void
    {
        $student->loadMissing('person');

        abort_unless(
            $student->person?->gender?->value === $this->actorGender($request),
            403,
            'غير مسموح لك بالوصول إلى بيانات طلاب من الجنس الآخر.'
        );
    }

    protected function ensurePayloadGender(?string $gender, Request $request): string
    {
        $actorGender = $this->actorGender($request);

        if ($gender !== null && $gender !== $actorGender) {
            throw ValidationException::withMessages([
                'gender' => ['لا يمكنك إضافة أو تعديل طالب من الجنس الآخر.'],
            ]);
        }

        return $actorGender;
    }

    protected function ensureSupervisorGender(?int $supervisorId, Request $request): void
    {
        if (!$supervisorId) {
            return;
        }

        $supervisor = Supervisor::with('person')->findOrFail($supervisorId);

        if ($supervisor->person?->gender?->value !== $this->actorGender($request)) {
            throw ValidationException::withMessages([
                'supervisor_id' => ['يجب أن يكون المشرف من نفس الجنس.'],
            ]);
        }
    }
}
