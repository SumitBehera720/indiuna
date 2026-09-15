<?php

namespace App\Models;

use App\Traits\HasActivityLog;
use App\Traits\HasUUID;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasUUID, SoftDeletes, HasApiTokens, HasRoles, Notifiable, HasActivityLog;

    protected $guarded = ['id'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function loginActivities(): HasMany
    {
        return $this->hasMany(LoginActivity::class);
    }

    public function auditLogs(): MorphMany
    {
        return $this->morphMany(AuditLog::class, 'actor');
    }

    public function customer(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Customer::class);
    }

    public function sendPasswordResetNotification($token): void
    {
        try {
            \Illuminate\Support\Facades\Mail::to($this->email)->send(
                new \App\Mail\Auth\ResetPasswordEmail($this->email, $token, $this->first_name)
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send password reset email', [
                'email' => $this->email,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
