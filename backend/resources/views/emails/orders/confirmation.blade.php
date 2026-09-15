@extends('emails.layouts.master')

@section('title', 'Order Confirmation #' . $order->order_number)

@section('content')
<div class="greeting">Thank You for Your Order! 🛍️</div>

<p>Hello {{ $order->shipping_first_name ?? 'Customer' }},</p>

<p>Your order <strong>#{{ $order->order_number }}</strong> has been placed and confirmed!</p>

<div class="order-box">
    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <div><strong>Order Date:</strong> {{ $order->created_at->format('M d, Y') }}</div>
        <div><strong>Payment:</strong> <span class="badge badge-success">{{ strtoupper($order->payment_method ?? 'COD') }}</span></div>
    </div>
    
    <table class="table">
        <thead>
            <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>
                    <strong>{{ $item->product_name }}</strong>
                    @if($item->variant_label)
                        <br><span style="font-size: 12px; color: #71717a;">Variant: {{ $item->variant_label }}</span>
                    @endif
                </td>
                <td style="text-align: center;">{{ $item->quantity }}</td>
                <td style="text-align: right;">₹{{ number_format($item->grand_total ?? ($item->unit_price * $item->quantity), 2) }}</td>
            </tr>
            @endforeach
            <tr>
                <td colspan="2" style="text-align: right; border-bottom: none;"><strong>Subtotal:</strong></td>
                <td style="text-align: right; border-bottom: none;">₹{{ number_format($order->subtotal, 2) }}</td>
            </tr>
            @if($order->discount_total > 0)
            <tr>
                <td colspan="2" style="text-align: right; border-bottom: none; color: #166534;"><strong>Discount:</strong></td>
                <td style="text-align: right; border-bottom: none; color: #166534;">-₹{{ number_format($order->discount_total, 2) }}</td>
            </tr>
            @endif
            <tr>
                <td colspan="2" style="text-align: right; border-bottom: none;"><strong>Shipping:</strong></td>
                <td style="text-align: right; border-bottom: none;">₹{{ number_format($order->shipping_total, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td colspan="2" style="text-align: right;">Total Amount:</td>
                <td style="text-align: right;">₹{{ number_format($order->grand_total, 2) }}</td>
            </tr>
        </tbody>
    </table>
</div>

<div style="background-color: #fafafa; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
    <h4 style="margin-top: 0; margin-bottom: 8px; color: #09090b;">Shipping Address:</h4>
    <p style="margin: 0; font-size: 14px; color: #3f3f46;">
        {{ $order->shipping_first_name }} {{ $order->shipping_last_name }}<br>
        {{ $order->shipping_address_line1 }}
        @if($order->shipping_address_line2), {{ $order->shipping_address_line2 }} @endif<br>
        {{ $order->shipping_city }}, {{ $order->shipping_state }} - {{ $order->shipping_postal_code }}<br>
        Phone: {{ $order->shipping_phone }}
    </p>
</div>

<p>We'll notify you as soon as your order is packed and shipped!</p>

<p>Best regards,<br><strong>The Indiuna Team</strong></p>
@endsection
