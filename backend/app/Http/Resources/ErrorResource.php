<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ErrorResource extends JsonResource
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
        'error_type' => [ 'value'      => $this->error_type->value,
                          'label'      => $this->error_type->label(),],
        'score'      => $this->score,
    ];

    }
}
