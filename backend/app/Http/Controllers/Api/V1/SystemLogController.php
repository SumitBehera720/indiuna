<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class SystemLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logFile = storage_path('logs/laravel.log');

        if (!File::exists($logFile)) {
            return $this->success([]);
        }

        $logs = [];
        $lines = File::lines($logFile)->reverse()->take(1000);

        foreach ($lines as $line) {
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\].*?\.(\w+):/', $line, $matches)) {
                $logs[] = [
                    'timestamp' => $matches[1],
                    'level' => strtolower($matches[2]),
                    'message' => $line,
                ];
            }
        }

        if ($request->filled('level')) {
            $logs = array_values(array_filter($logs, fn($log) => $log['level'] === $request->input('level')));
        }

        return $this->success(array_slice($logs, 0, 100));
    }

    public function show(string $id): JsonResponse
    {
        $logFile = storage_path('logs/laravel.log');

        if (!File::exists($logFile)) {
            return $this->error('Log file not found', 404);
        }

        $lines = File::lines($logFile)->toArray();
        $index = (int) $id;

        if (!isset($lines[$index])) {
            return $this->error('Log entry not found', 404);
        }

        return $this->success([
            'line' => $index + 1,
            'content' => $lines[$index],
        ]);
    }
}
