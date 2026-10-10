<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LevelResource extends JsonResource
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
        'name'        =>
        [
            'value' => $this->name->value,
            'label' => $this->name->label(),
        ],
        'description' => $this->description,
        'plan'        => $this->plan,
    ];
}
}

