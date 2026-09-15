@extends('emails.layouts.master')

@section('title', 'Order Delivered #' . $order->order_number)

@section('content')
<div class="greeting">Your Order Has Been Delivered! 📦✨</div>

<p>Hello {{ $order->shipping_first_name ?? 'Customer' }},</p>

<p>Your order <strong>#{{ $order->order_number }}</strong> has been successfully delivered!</p>

<div class="order-box" style="text-align: center; background-color: #fafafa;">
    <h3 style="margin-top: 0; color: #09090b;">We Hope You Love Your Purchase!</h3>
    <p style="margin-bottom: 20px;">If you enjoy your new streetwear item, we would love to hear your feedback!</p>
    <a href="{{ config('app.url') }}" class="btn" target="_blank">Leave a Product Review</a>
</div>

<p style="font-size: 14px; color: #71717a;">
    If you did not receive this package or if there is any issue with your items, please contact us immediately at <a href="mailto:support@indiuna.com" style="color: #ff2e93;">support@indiuna.com</a>.
</p>

<p>Warm regards,<br><strong>The Indiuna Team</strong></p>
@endsection
