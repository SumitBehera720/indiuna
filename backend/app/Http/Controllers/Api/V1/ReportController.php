<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\Analytics\ReportFilterDTO;
use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
    ) {}

    private function getFilters(Request $request): ReportFilterDTO
    {
        return ReportFilterDTO::fromArray($request->all());
    }

    public function sales(Request $request): JsonResponse
    {
        $data = $this->reportService->sales($this->getFilters($request));

        return $this->success($data);
    }

    public function revenue(Request $request): JsonResponse
    {
        $data = $this->reportService->revenue($this->getFilters($request));

        return $this->success($data);
    }

    public function profit(Request $request): JsonResponse
    {
        $data = $this->reportService->profit($this->getFilters($request));

        return $this->success($data);
    }

    public function inventory(Request $request): JsonResponse
    {
        $data = $this->reportService->inventory($this->getFilters($request));

        return $this->success($data);
    }

    public function customers(Request $request): JsonResponse
    {
        $data = $this->reportService->customers($this->getFilters($request));

        return $this->success($data);
    }

    public function products(Request $request): JsonResponse
    {
        $data = $this->reportService->products($this->getFilters($request));

        return $this->success($data);
    }

    public function taxes(Request $request): JsonResponse
    {
        $data = $this->reportService->taxes($this->getFilters($request));

        return $this->success($data);
    }

    public function coupons(Request $request): JsonResponse
    {
        $data = $this->reportService->coupons($this->getFilters($request));

        return $this->success($data);
    }

    public function returns(Request $request): JsonResponse
    {
        $data = $this->reportService->returns($this->getFilters($request));

        return $this->success($data);
    }

    public function shipping(Request $request): JsonResponse
    {
        $data = $this->reportService->shipping($this->getFilters($request));

        return $this->success($data);
    }

    public function export(Request $request): JsonResponse
    {
        $request->validate(['type' => 'required|string']);

        $csv = $this->reportService->export(
            $request->input('type'),
            $this->getFilters($request)
        );

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, "report-{$request->input('type')}-export.csv", [
            'Content-Type' => 'text/csv',
        ]);
    }
}
