<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'start_page' => $this->start_page,
            'quantity' => $this->quantity,
            'report_date' => optional($this->report_date)->toDateString(),
            'student_level' => new StudentLevelResource($this->whenLoaded('studentLevel')),
            'student_supervisor' => new StudentSupervisorResource($this->whenLoaded('studentSupervisor')),
            'errors' => ReportErrorResource::collection($this->whenLoaded('reportErrors')),
        ];
    }
}
