@extends('emails.layouts.master')

@section('title', 'Reset Your Password - Indiuna')

@section('content')
<div class="greeting">Reset Your Password</div>

<p>Hello {{ $name ?? 'Customer' }},</p>

<p>We received a request to reset the password for your Indiuna account associated with <strong>{{ $email }}</strong>.</p>

<p>Click the button below to choose a new password. This reset link will expire in 60 minutes.</p>

<div style="text-align: center;">
    <a href="{{ $resetUrl }}" class="btn" target="_blank">Reset Password</a>
</div>

<p style="font-size: 13px; color: #71717a; margin-top: 20px;">
    If you did not request a password reset, no further action is required and your account remains secure.
</p>

<hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">

<p style="font-size: 12px; color: #a1a1aa; word-break: break-all;">
    If you're having trouble clicking the button, copy and paste this URL into your web browser:<br>
    <a href="{{ $resetUrl }}" style="color: #ff2e93;">{{ $resetUrl }}</a>
</p>
@endsection
