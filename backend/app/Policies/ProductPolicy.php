<?php
declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('product.create');
    }

    public function update(User $user): bool
    {
        return $user->can('product.edit');
    }

    public function delete(User $user): bool
    {
        return $user->can('product.delete');
    }

    public function restore(User $user): bool
    {
        return $user->can('product.restore');
    }

    public function forceDelete(User $user): bool
    {
        return $user->can('product.delete');
    }
}
