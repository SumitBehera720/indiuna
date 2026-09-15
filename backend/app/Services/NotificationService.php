<?php
declare(strict_types=1);

namespace App\Services;

use App\Contracts\Repositories\NotificationRepositoryInterface;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Notifications\Notification;
class NotificationService
{
    public function __construct(
        private readonly NotificationRepositoryInterface $notificationRepository,
    ) {}

    public function send(User $user, Notification $notification): void
    {
        $user->notify($notification);
    }

    public function sendViaChannel(User $user, Notification $notification, string $channel): void
    {
        $user->notifyNow($notification, [$channel]);
    }

    public function getNotifications(string $userId): Collection
    {
        return $this->notificationRepository->getByUser($userId);
    }

    public function markAsRead(string $notificationId): void
    {
        $this->notificationRepository->markAsRead($notificationId);
    }

    public function markAllAsRead(string $userId): void
    {
        $this->notificationRepository->markAllAsRead($userId);
    }
}
