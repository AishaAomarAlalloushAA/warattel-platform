<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\Student;
use App\Models\StudentSupervisor;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

trait RestrictsSupervisorScope
{
    protected function isSupervisorActor(Request $request): bool
    {
        return $request->user()?->role?->value === UserRole::Supervisor->value;
    }

    protected function actorSupervisorId(Request $request): ?int
    {
        if (!$this->isSupervisorActor($request)) {
            return null;
        }

        $user = $request->user()->loadMissing('person.supervisor');
        $supervisorId = $user->person?->supervisor?->id;

        abort_unless($supervisorId, 403, 'حساب المشرف غير مرتبط بسجل إشراف فعال.');

        return (int) $supervisorId;
    }

    protected function ensureAssignedStudent(Student $student, Request $request): void
    {
        if (!$this->isSupervisorActor($request)) {
            return;
        }

        $supervisorId = $this->actorSupervisorId($request);
        $assigned = StudentSupervisor::query()
            ->where('student_id', $student->id)
            ->where('supervisor_id', $supervisorId)
            ->whereNull('retired_at')
            ->exists();

        abort_unless($assigned, 403, 'غير مسموح لك بالوصول إلى طالب غير معيّن لك.');
    }

    protected function resolvedSupervisorId(?int $requestedSupervisorId, Request $request): ?int
    {
        if (!$this->isSupervisorActor($request)) {
            return $requestedSupervisorId;
        }

        $actorSupervisorId = $this->actorSupervisorId($request);

        if ($requestedSupervisorId !== null && (int) $requestedSupervisorId !== $actorSupervisorId) {
            throw ValidationException::withMessages([
                'supervisor_id' => ['لا يمكنك تنفيذ العملية باسم مشرف آخر.'],
            ]);
        }

        return $actorSupervisorId;
    }
}
