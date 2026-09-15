@extends('emails.layouts.master')

@section('title', 'OUT OF STOCK ALERT: ' . ($productName ?? 'Product'))

@section('content')
<div class="greeting" style="color: #dc2626;">⚠️ Out of Stock Alert</div>

<p>Hello Admin,</p>

<p>This is an automated inventory notification to inform you that a product variant is now <strong>out of stock (0 units remaining)</strong>.</p>

<div class="order-box" style="background-color: #fff1f2; border-color: #fecdd3;">
    <h4 style="margin-top: 0; color: #9f1239;">Product Details:</h4>
    <p style="margin-bottom: 6px;"><strong>Product Name:</strong> {{ $productName }}</p>
    <p style="margin-bottom: 6px;"><strong>Variant / SKU:</strong> {{ $variantName }} ({{ $sku }})</p>
    <p style="margin-bottom: 6px;"><strong>Current Inventory Stock:</strong> <span class="badge badge-danger">0 UNITS</span></p>
    <p style="margin-bottom: 0;"><strong>Time of Alert:</strong> {{ now()->format('M d, Y h:i A') }}</p>
</div>

<p>Please log in to the Indiuna Admin Panel to adjust stock or restock inventory.</p>

<div style="text-align: center;">
    <a href="{{ config('app.url') }}/admin" class="btn" target="_blank" style="background-color: #09090b;">Go to Admin Panel</a>
</div>
@endsection
