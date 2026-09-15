<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Exports\ProductsExport;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ExportProducts implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly array $filters = [],
        private readonly ?string $exportId = null,
    ) {}

    public function handle(): void
    {
        $fileName = "exports/products_" . now()->timestamp . '.xlsx';
        $disk = Storage::disk('public');

        Excel::store(new ProductsExport($this->filters), $fileName, 'public');

        $url = $disk->url($fileName);

        Log::info("Products export completed: {$fileName}");

        if ($this->exportId && class_exists(\App\Models\Export::class)) {
            $exportModel = \App\Models\Export::find($this->exportId);
            if ($exportModel) {
                $exportModel->update([
                    'status' => 'completed',
                    'file_path' => $fileName,
                    'file_url' => $url,
                    'completed_at' => now(),
                ]);
            }
        }
    }
}
