<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'part' => $this->part,
            'quantity' => $this->quantity,
            'exam_type' => [
                'value' => $this->exam_type?->value,
                'label' => $this->exam_type?->label(),
            ],
            'exam_date' => optional($this->exam_date)->toDateString(),
            'score' => $this->score,
            'result' => $this->result,
            'supervisor' => new SupervisorResource($this->whenLoaded('supervisor')),
            'student_level' => new StudentLevelResource($this->whenLoaded('studentLevel')),
            'errors' => ExamErrorResource::collection($this->whenLoaded('examErrors')),
        ];
    }
}
