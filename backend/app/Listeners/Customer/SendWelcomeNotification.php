<?php
declare(strict_types=1);

namespace App\Listeners\Customer;

use App\Events\Customer\CustomerRegistered;
use App\Mail\Customer\WelcomeEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendWelcomeNotification implements ShouldQueue
{
    public function handle(CustomerRegistered $event): void
    {
        $customer = $event->customer;

        if (!$customer->email) {
            Log::warning("No email for customer: {$customer->id}");
            return;
        }

        Mail::to($customer->email)->send(new WelcomeEmail($customer));

        Log::info("Welcome email sent to {$customer->email}");
    }
}
