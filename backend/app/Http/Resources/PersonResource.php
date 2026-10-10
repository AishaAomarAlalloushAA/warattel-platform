<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonResource extends JsonResource
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
            'fname'          => $this->fname,
            'lname'          => $this->lname,
            'gender'         => $this->gender->label(),
            'year_of_study'  => $this->year_of_study,
            'contact_number' => $this->contact_number,
            'join_date'      => $this->join_date?->toDateString(),
            'address'        => $this->address,
            'achievements'   => $this->achievements,
        ];
    }
}

