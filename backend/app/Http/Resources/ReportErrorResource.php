<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportErrorResource extends JsonResource
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
        'details'    => $this->details,
        'error_word' => $this->error_word,
        'report'     => new ReportResource($this->whenLoaded('report')),
        'error'      => new ErrorResource($this->whenLoaded('error')),
    ];
    }
}
