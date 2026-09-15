@extends('emails.layouts.master')

@section('title', 'Welcome to Indiuna!')

@section('content')
<div class="greeting">Welcome to Indiuna! 🎉</div>

<p>Hello {{ $name ?? 'there' }},</p>

<p>Thank you for joining <strong>Indiuna</strong>! We are thrilled to have you as part of our community.</p>

<p>At Indiuna, we craft premium embroidered apparel and custom streetwear designed to stand out. Explore our latest drops, custom collections, and exclusive offers.</p>

<div class="order-box" style="text-align: center;">
    <h3 style="margin-top: 0; color: #09090b;">Ready to explore?</h3>
    <p style="margin-bottom: 20px;">Use code <strong style="color: #ff2e93; font-size: 18px;">WELCOME10</strong> at checkout to get 10% off your first order!</p>
    <a href="{{ config('app.url') }}" class="btn" target="_blank">Shop New Arrivals</a>
</div>

<p>If you have any questions or need custom embroidery styling, reply directly to this email or reach out to our support team.</p>

<p>Happy Shopping,<br><strong>The Indiuna Team</strong></p>
@endsection
