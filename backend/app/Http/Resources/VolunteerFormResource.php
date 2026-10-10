<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VolunteerFormResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
   public function toArray(Request $request): array
{
    return [
        'id' => $this->id,

        'name' => $this->name,

        'contact_number' => $this->contact_number,

        'telegram_username' => $this->telegram_username,

        'email' => $this->email,

        'year_of_study' => $this->year_of_study,

        'additional_skills' => $this->additional_skills,

        'form_type' => [
            'value' => $this->form_type->value,
            'label' => $this->form_type_label,
        ],

        'status' => [
            'value' => $this->status->value,
            'label' => $this->status_label,
        ],

        'form_data' => $this->form_data,

        'admin_response' => $this->admin_response,

        'user' => new UserResource(
            $this->whenLoaded('user')
        ),

        'created_at' => $this->created_at?->toDateTimeString(),
    ];
}
}
