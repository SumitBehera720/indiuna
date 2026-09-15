@extends('emails.layouts.master')

@section('title', 'Order Shipped #' . $order->order_number)

@section('content')
<div class="greeting">Your Order is On Its Way! 🚚</div>

<p>Hello {{ $order->shipping_first_name ?? 'Customer' }},</p>

<p>Great news! Your order <strong>#{{ $order->order_number }}</strong> has been shipped and is on its way to you.</p>

<div class="order-box" style="text-align: center; background-color: #f0fdf4; border-color: #bbf7d0;">
    <h3 style="margin-top: 0; color: #166534;">Shipment Tracking Info</h3>
    
    <p style="margin-bottom: 8px;"><strong>Courier Partner:</strong> {{ $carrierName ?? $order->shipping_method_name ?? 'Shiprocket' }}</p>
    
    @if(!empty($trackingCode))
        <p style="margin-bottom: 16px;"><strong>Tracking AWB Number:</strong> <span style="font-family: monospace; font-size: 16px; background-color: #ffffff; padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1;">{{ $trackingCode }}</span></p>
    @endif

    @if(!empty($trackingUrl))
        <a href="{{ $trackingUrl }}" class="btn" target="_blank" style="background-color: #16a34a;">Track Shipment Live</a>
    @endif
</div>

<div class="order-box">
    <h4 style="margin-top: 0; margin-bottom: 12px; color: #09090b;">Package Items:</h4>
    <table class="table">
        <thead>
            <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product_name }} @if($item->variant_label) ({{ $item->variant_label }}) @endif</td>
                <td style="text-align: center;">{{ $item->quantity }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>

<p>If you have any questions about your delivery, feel free to reply to this email.</p>

<p>Thank you for shopping with us!<br><strong>The Indiuna Team</strong></p>
@endsection
