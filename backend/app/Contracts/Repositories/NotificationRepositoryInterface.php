<?php
declare(strict_types=1);

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Collection;

interface NotificationRepositoryInterface extends RepositoryInterface
{
    public function getByUser(string $userId): Collection;

    public function getUnreadByUser(string $userId): Collection;

    public function markAsRead(string $notificationId): void;

    public function markAllAsRead(string $userId): void;
}
