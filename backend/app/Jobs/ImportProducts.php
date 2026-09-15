<?php
declare(strict_types=1);

namespace App\Jobs;

use App\Imports\ProductsImport;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;

class ImportProducts implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $filePath,
        private readonly ?string $importId = null,
    ) {}

    public function handle(): void
    {
        try {
            $import = new ProductsImport();
            Excel::import($import, $this->filePath);

            $result = [
                'success_count' => $import->getSuccessCount(),
                'fail_count' => $import->getFailCount(),
                'errors' => $import->getErrors(),
            ];

            Log::info("Product import completed", $result);

            if ($this->importId && class_exists(\App\Models\Import::class)) {
                $importModel = \App\Models\Import::find($this->importId);
                if ($importModel) {
                    $importModel->update([
                        'status' => 'completed',
                        'summary' => $result,
                        'completed_at' => now(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error("Product import failed: {$e->getMessage()}");

            if ($this->importId && class_exists(\App\Models\Import::class)) {
                $importModel = \App\Models\Import::find($this->importId);
                if ($importModel) {
                    $importModel->update([
                        'status' => 'failed',
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            throw $e;
        }
    }
}
