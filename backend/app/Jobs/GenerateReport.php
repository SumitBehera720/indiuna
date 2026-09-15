<?php
declare(strict_types=1);

namespace App\Jobs;

use App\DTOs\Analytics\ReportFilterDTO;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerateReport implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $reportType,
        private readonly ReportFilterDTO $filters,
        private readonly ?string $reportId = null,
    ) {}

    public function handle(ReportService $reportService): void
    {
        $data = $reportService->generate($this->reportType, $this->filters);

        $fileName = "reports/{$this->reportType}_" . now()->timestamp . '.pdf';
        $disk = Storage::disk('public');

        $pdf = Pdf::loadView("reports.{$this->reportType}", [
            'data' => $data,
            'filters' => $this->filters,
        ]);

        $disk->put($fileName, $pdf->output());

        $url = $disk->url($fileName);

        Log::info("Report {$this->reportType} generated: {$fileName}");

        if ($this->reportId && class_exists(\App\Models\Report::class)) {
            $reportModel = \App\Models\Report::find($this->reportId);
            if ($reportModel) {
                $reportModel->update([
                    'status' => 'completed',
                    'file_path' => $fileName,
                    'file_url' => $url,
                    'completed_at' => now(),
                ]);
            }
        }
    }
}
