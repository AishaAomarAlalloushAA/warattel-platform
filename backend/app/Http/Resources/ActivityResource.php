<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
          return [
        'id'             => $this->id,
        'title'          => $this->title,
        'activity_date'  => $this->activity_date->toDateString(),
        'activity_type'  => new ActivityTypeResource($this->whenLoaded('activityType')),
        'coordinator'    => new SupervisorResource($this->whenLoaded('coordinator')),
        'presenter'      => new SupervisorResource($this->whenLoaded('presenter')),
    ];

    }
}




