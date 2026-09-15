<?php
declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class MediaPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('media.view');
    }

    public function view(User $user): bool
    {
        return $user->can('media.view');
    }

    public function create(User $user): bool
    {
        return $user->can('media.create');
    }

    public function update(User $user): bool
    {
        return $user->can('media.edit');
    }

    public function delete(User $user): bool
    {
        return $user->can('media.delete');
    }

    public function restore(User $user): bool
    {
        return $user->can('media.restore');
    }
}
