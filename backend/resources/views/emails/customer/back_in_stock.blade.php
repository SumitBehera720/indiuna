@extends('emails.layouts.master')

@section('title', $productName . ' is Back in Stock!')

@section('content')
<div class="greeting">It's Back! 🎉</div>

<p>Hello {{ $name ?? 'Customer' }},</p>

<p>Good news! The product you requested, <strong>{{ $productName }}</strong>, is officially back in stock!</p>

<div class="order-box" style="text-align: center;">
    <h3 style="margin-top: 0; color: #09090b;">{{ $productName }}</h3>
    @if(!empty($variantName))
        <p style="margin-bottom: 12px; color: #71717a;">Variant / Size: {{ $variantName }}</p>
    @endif
    <p style="margin-bottom: 20px;">Hurry, stock is limited. Grab yours before it sells out again!</p>
    <a href="{{ config('app.url') }}" class="btn" target="_blank">Shop Now</a>
</div>

<p>Thank you for choosing Indiuna!<br><strong>The Indiuna Team</strong></p>
@endsection
