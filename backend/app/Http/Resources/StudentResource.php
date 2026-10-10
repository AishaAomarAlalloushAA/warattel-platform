<?php

namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'      => $this->id,
            'status'  => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'person'  => new PersonResource($this->whenLoaded('person')),
            'levels'  => StudentLevelResource::collection($this->whenLoaded('studentLevels')),
        ];
    }
}
