<?php
declare(strict_types=1);

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrderPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('order.view');
    }

    public function view(User $user, Order $order): bool
    {
        return $user->can('order.view');
    }

    public function create(User $user): bool
    {
        return $user->can('order.create');
    }

    public function update(User $user, Order $order): bool
    {
        return $user->can('order.edit') || $user->id === $order->user_id;
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->can('order.delete');
    }
}
