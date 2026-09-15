<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repositories\NotificationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Notifications\DatabaseNotification;

class NotificationRepository extends BaseRepository implements NotificationRepositoryInterface
{
    public function __construct()
    {
        parent::__construct(new DatabaseNotification());
    }

    public function getByUser(string $userId): Collection
    {
        return $this->model->where('notifiable_id', $userId)
            ->where('notifiable_type', 'App\Models\User')
            ->get();
    }

    public function getUnreadByUser(string $userId): Collection
    {
        return $this->model->where('notifiable_id', $userId)
            ->where('notifiable_type', 'App\Models\User')
            ->whereNull('read_at')
            ->get();
    }

    public function markAsRead(string $notificationId): void
    {
        $notification = $this->findOrFail($notificationId);
        $notification->update(['read_at' => now()]);
    }

    public function markAllAsRead(string $userId): void
    {
        $this->model->where('notifiable_id', $userId)
            ->where('notifiable_type', 'App\Models\User')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
