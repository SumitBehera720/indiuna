@extends('emails.layouts.master')

@section('title', 'Order Cancelled #' . $order->order_number)

@section('content')
<div class="greeting">Order Cancelled</div>

<p>Hello {{ $order->shipping_first_name ?? 'Customer' }},</p>

<p>Your order <strong>#{{ $order->order_number }}</strong> has been cancelled.</p>

<div class="order-box" style="background-color: #fef2f2; border-color: #fecaca;">
    <h4 style="margin-top: 0; color: #991b1b;">Cancellation Details:</h4>
    <p style="margin-bottom: 8px;"><strong>Order Number:</strong> #{{ $order->order_number }}</p>
    <p style="margin-bottom: 8px;"><strong>Reason:</strong> {{ $reason ?? 'Cancelled by request / administrative update' }}</p>
    @if($order->payment_status === 'completed' || $order->paid_total > 0)
        <p style="margin-bottom: 0; color: #991b1b; font-weight: 600;">A refund of ₹{{ number_format($order->paid_total, 2) }} will be processed to your original payment method within 3-5 business days.</p>
    @endif
</div>

<p>If you have any questions or would like to place a new order, please feel free to reach out to our team at <a href="mailto:support@indiuna.com" style="color: #ff2e93;">support@indiuna.com</a>.</p>

<p>Sincerely,<br><strong>The Indiuna Team</strong></p>
@endsection
