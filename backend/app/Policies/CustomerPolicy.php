<?php
declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CustomerPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('customer.view');
    }

    public function view(User $user): bool
    {
        return $user->can('customer.view');
    }

    public function create(User $user): bool
    {
        return $user->can('customer.create');
    }

    public function update(User $user): bool
    {
        return $user->can('customer.edit');
    }

    public function delete(User $user): bool
    {
        return $user->can('customer.delete');
    }

    public function restore(User $user): bool
    {
        return $user->can('customer.restore');
    }
}
