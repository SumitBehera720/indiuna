<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'type' => $this->type,
            'date_range' => $this->date_range,
            'data' => $this->data,
            'totals' => $this->totals,
            'chart_data' => $this->chart_data,
        ];
    }
}
