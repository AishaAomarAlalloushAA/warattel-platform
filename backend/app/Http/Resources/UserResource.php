<?php

namespace App\Http\Resources;

use App\Enums\UserRole;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        $this->resource->loadMissing('person.student', 'person.supervisor');

        $person = $this->person;
        $role = $this->role?->value;
        $roleData = null;

        if ($this->role === UserRole::Student && $person?->student) {
            $roleData = [
                'student_id' => $person->student->id,
                'status' => $person->student->status?->value,
                'status_label' => $person->student->status?->label(),
            ];
        } elseif ($this->role === UserRole::Supervisor && $person?->supervisor) {
            $roleData = [
                'supervisor_id' => $person->supervisor->id,
                'supervisor_role' => $person->supervisor->role?->value,
                'supervisor_role_label' => $person->supervisor->role?->label(),
            ];
        }

        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $role,
            'role_label' => $this->role?->label(),
            'full_name' => $this->full_name,
            'person' => $person ? [
                'id' => $person->id,
                'fname' => $person->fname,
                'lname' => $person->lname,
                'full_name' => trim($person->fname . ' ' . $person->lname),
                'gender' => $person->gender?->value,
                'gender_label' => $person->gender?->label(),
                'year_of_study' => $person->year_of_study,
                'contact_number' => $person->contact_number,
                'join_date' => optional($person->join_date)->toDateString(),
                'address' => $person->address,
                'serial_number' => $person->serial_number,
                'legacy_achievements' => $person->achievements,
            ] : null,
            'role_data' => $roleData,
        ];
    }
}
