<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentActivityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
         return [
        'id'         => $this->id,
        'student_id' => $this->student_id,
        'activity_id'=> $this->activity_id,
        'student'    => new StudentResource($this->whenLoaded('student')),
        'activity'   => new ActivityResource($this->whenLoaded('activity')),
    ];
    }
}
