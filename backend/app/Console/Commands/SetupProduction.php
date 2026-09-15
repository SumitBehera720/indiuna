<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetupProduction extends Command
{
    protected $signature = 'indiuna:setup-production';

    protected $description = 'Run production setup commands';

    public function handle(): int
    {
        $this->call('config:cache');
        $this->call('route:cache');
        $this->call('view:cache');
        $this->call('event:cache');
        $this->call('optimize');
        $this->call('storage:link');

        $this->info('Production setup completed successfully.');

        return Command::SUCCESS;
    }
}
