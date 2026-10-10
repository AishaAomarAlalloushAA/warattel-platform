<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupervisorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

    return [
        'id'                   => $this->id,
        'role'                 => [
            'value' => $this->role->value,
            'label' => $this->role->label(),
        ],
        'became_supervisor_at' => $this->became_supervisor_at->toDateString(),
        'retired_at'           => $this->retired_at?->toDateString(),
        'person'               => new PersonResource($this->whenLoaded('person')),
        'supervisor'           => new SupervisorResource($this->whenLoaded('supervisor')),
        'assistants_count'     => $this->when($this->assistants_count !== null, $this->assistants_count),
        // لتحميل المساعدين عند الحاجة
        'assistants'           => SupervisorResource::collection($this->whenLoaded('assistants')),
    ];
}
}
