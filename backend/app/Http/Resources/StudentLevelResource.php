<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentLevelResource extends JsonResource
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
        'reached_at' => $this->reached_at->toDateString(),
        'level'      => new LevelResource($this->whenLoaded('level')),
        'student_id' => $this->student_id,
    ];
   }
}
