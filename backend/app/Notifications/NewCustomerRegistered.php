<?php
declare(strict_types=1);

namespace App\Notifications;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewCustomerRegistered extends Notification
{
    use Queueable;

    public function __construct(
        public Customer $customer,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'customer_id' => $this->customer->id,
            'name' => $this->customer->first_name . ' ' . $this->customer->last_name,
            'email' => $this->customer->email,
            'phone' => $this->customer->phone,
            'message' => "New customer registered: {$this->customer->first_name} {$this->customer->last_name} ({$this->customer->email})",
        ];
    }
}
