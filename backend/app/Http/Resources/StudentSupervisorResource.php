<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentSupervisorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
         return [
        'id'          => $this->id,
        'assigned_at' => $this->assigned_at->toDateString(),
        'retired_at'  => $this->retired_at?->toDateString(),
        'student'     => new StudentResource($this->whenLoaded('student')),
        'supervisor'  => new SupervisorResource($this->whenLoaded('supervisor')),
    ];
    }
}
