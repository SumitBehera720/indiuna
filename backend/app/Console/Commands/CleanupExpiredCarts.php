<?php

namespace App\Console\Commands;

use App\Jobs\CleanupExpiredCarts as CleanupExpiredCartsJob;
use Illuminate\Console\Command;

class CleanupExpiredCarts extends Command
{
    protected $signature = 'indiuna:cleanup-carts';

    protected $description = 'Dispatch job to clean up expired shopping carts';

    public function handle(): int
    {
        CleanupExpiredCartsJob::dispatch();

        $this->info('Expired cart cleanup job dispatched.');

        return Command::SUCCESS;
    }
}
